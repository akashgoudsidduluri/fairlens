import type { AuditReport, Finding } from "@/api-types";

/**
 * Complex-analysis payload, derived from the report the page already has.
 *
 * This mirrors `api/complex.py` for the live and replay pages. The API exposes
 * the same shape at `GET /audits/{id}/complex-analysis` for external consumers;
 * deriving it here avoids a second round trip and keeps replays working, since
 * a replay's source audit may no longer exist in the live store.
 */

export type DecompositionDirection =
  | "explained"
  | "reversal"
  | "hidden"
  | "same_direction"
  | "no_gap";

export interface ProxyFlip {
  attribute: string;
  role: string;
  supported: boolean;
  finding_id?: string;
  status?: Finding["status"];
  net_flip_rate?: number;
  ci_low?: number;
  ci_high?: number;
  p_adjusted?: number;
  n?: number;
  reason?: string;
}

export interface Hotspot {
  finding_id?: string;
  treatment?: string | null;
  treatment_level?: string | null;
  context: Record<string, string>;
  net_flip_rate?: number;
  ci_low?: number;
  ci_high?: number;
  p_adjusted?: number;
  n?: number;
  status?: Finding["status"];
  merged_into?: string | null;
}

export interface Decomposition {
  finding_id: string;
  attribute: string;
  target_group: string;
  comparison_group: string;
  observed_gap: number;
  counterfactual_gap: number;
  confounding_shift: number;
  direction: DecompositionDirection;
  direction_note: string;
  materiality: number;
  n?: number;
  note: string;
}

export interface ComplexAnalysis {
  protocol: "generalized" | "single" | "unknown";
  proxy: ProxyFlip[];
  hotspots: Hotspot[];
  decomposition: Decomposition | null;
}

export const PROXY_FEATURES: ReadonlyArray<{ attribute: string; role: string }> = [
  { attribute: "pincode_group", role: "protected stand-in; treatment and context" },
  { attribute: "name_group", role: "protected stand-in; treatment and context" },
  { attribute: "age", role: "role: proxy; treatment and context" },
];

const DEFAULT_MATERIALITY = 0.02;

const DIRECTION_NOTE: Record<DecompositionDirection, string> = {
  explained:
    "The observed gap does not survive the twin test: twins with identical legitimate signals flip at less than the materiality threshold.",
  reversal:
    "The observed gap and the twin gap point in opposite directions. Composition, not treatment, drives the naive number; no additive legitimate/structural split is valid.",
  hidden:
    "The naive gap is below materiality, but the twins still flip. The population average hides the treatment effect.",
  same_direction:
    "Observed and twin gaps share a direction. The confounding shift is the part of the naive gap that is not reproduced by the twins.",
  no_gap: "Neither the observed gap nor the twin gap reaches materiality.",
};

function attributeOf(finding: Finding): string {
  if (finding.treatment) return finding.treatment;
  return finding.attribute_or_subgroup.split("=", 1)[0].trim();
}

function ratesOf(finding: Finding): {
  target?: number;
  comparison?: number;
} {
  const rates = finding.observational_rates ?? {};
  let target = rates[finding.target_group];
  let comparison = rates[finding.comparison_group];
  if (target === undefined || comparison === undefined) {
    target = rates.target;
    comparison = rates.comparison;
  }
  return { target, comparison };
}

/** Positive means the target group is approved more often than comparison. */
function observedGap(finding: Finding): number | undefined {
  const { target, comparison } = ratesOf(finding);
  if (target === undefined || comparison === undefined) return undefined;
  return target - comparison;
}

function materialityOf(report: AuditReport): number {
  const config = report.config as
    | { audit?: { materiality?: number } }
    | undefined;
  const value = config?.audit?.materiality;
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : DEFAULT_MATERIALITY;
}

function directionOf(
  observed: number,
  counterfactual: number,
  materiality: number,
): DecompositionDirection {
  if (Math.abs(counterfactual) < materiality) {
    return Math.abs(observed) >= materiality ? "explained" : "no_gap";
  }
  if (observed * counterfactual < 0) return "reversal";
  if (Math.abs(observed) < materiality) return "hidden";
  return "same_direction";
}

function observationalRate(
  report: AuditReport,
  attribute: string,
  group: string,
): number | undefined {
  const observational = report.observational as
    | { rates?: Record<string, Record<string, { rate?: number }>> }
    | undefined;
  const value = observational?.rates?.[attribute]?.[group]?.rate;
  return typeof value === "number" ? value : undefined;
}

function proxyRows(findings: Finding[]): ProxyFlip[] {
  const singles = findings.filter((f) => f.kind === "single_attribute");
  return PROXY_FEATURES.map(({ attribute, role }) => {
    const match = singles.find((f) => attributeOf(f) === attribute);
    if (!match) {
      return {
        attribute,
        role,
        supported: false,
        reason: findings.some((f) => f.kind === "generalized")
          ? "no single-attribute estimate in this audit; the generalized protocol confirms cells instead"
          : "this target or protocol did not probe the attribute",
      };
    }
    const evidence = match.evidence;
    return {
      attribute,
      role,
      supported: true,
      finding_id: match.id,
      status: match.status,
      net_flip_rate: evidence.net_flip_rate,
      ci_low: evidence.ci_low,
      ci_high: evidence.ci_high,
      p_adjusted: evidence.p_adjusted,
      n: evidence.n,
    };
  });
}

function hotspotRows(findings: Finding[]): Hotspot[] {
  return findings
    .filter((f) => f.kind === "generalized")
    .map((f) => ({
      finding_id: f.id,
      treatment: f.treatment,
      treatment_level: f.treatment_level,
      context: f.context ?? {},
      net_flip_rate: f.evidence.net_flip_rate,
      ci_low: f.evidence.ci_low,
      ci_high: f.evidence.ci_high,
      p_adjusted: f.evidence.p_adjusted,
      n: f.evidence.n,
      status: f.status,
      merged_into: f.merged_into,
    }));
}

function anchorFinding(findings: Finding[]): Finding | null {
  const candidates = findings.filter(
    (f) =>
      (f.kind === "single_attribute" || f.kind === "generalized") &&
      f.status !== "merged" &&
      typeof f.evidence?.net_flip_rate === "number",
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) => {
    const rank = (f: Finding) => {
      const gap = observedGap(f);
      return [
        f.status === "kept" ? 1 : 0,
        Math.abs(f.evidence.net_flip_rate),
        gap === undefined ? 0 : Math.abs(gap),
      ];
    };
    const a = rank(best);
    const b = rank(current);
    for (let i = 0; i < a.length; i += 1) {
      if (b[i] !== a[i]) return b[i] > a[i] ? current : best;
    }
    return best;
  });
}

function buildDecomposition(report: AuditReport): Decomposition | null {
  const anchor = anchorFinding(report.findings ?? []);
  if (!anchor) return null;

  let observed = observedGap(anchor);
  if (observed === undefined) {
    const attribute = attributeOf(anchor);
    const target = observationalRate(report, attribute, anchor.target_group);
    const comparison = observationalRate(
      report,
      attribute,
      anchor.comparison_group,
    );
    if (target !== undefined && comparison !== undefined) {
      observed = target - comparison;
    }
  }
  if (observed === undefined) return null;

  const counterfactual = anchor.evidence.net_flip_rate;
  const materiality = materialityOf(report);
  const direction = directionOf(observed, counterfactual, materiality);

  return {
    finding_id: anchor.id,
    attribute: attributeOf(anchor),
    target_group: anchor.target_group,
    comparison_group: anchor.comparison_group,
    observed_gap: observed,
    counterfactual_gap: counterfactual,
    confounding_shift: counterfactual - observed,
    direction,
    direction_note: DIRECTION_NOTE[direction],
    materiality,
    n: anchor.evidence.n,
    note: "Observed gap is target minus comparison approval rate. The confounding shift is a difference of two measured gaps, not a causal share; it can exceed 100 points and can reverse sign.",
  };
}

export function buildComplexAnalysis(report: AuditReport): ComplexAnalysis {
  const findings = report.findings ?? [];
  const config = report.config as
    | { audit?: { search?: { enabled?: boolean } } }
    | undefined;
  const searchEnabled = Boolean(config?.audit?.search?.enabled);
  const generalized = findings.some((f) => f.kind === "generalized");
  return {
    protocol: generalized || searchEnabled ? "generalized" : "single",
    proxy: proxyRows(findings),
    hotspots: hotspotRows(findings),
    decomposition: buildDecomposition(report),
  };
}

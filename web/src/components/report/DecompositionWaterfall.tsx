import { Scale } from "lucide-react";

import type { ComplexAnalysis, DecompositionDirection } from "@/lib/complex";
import { signedPercent } from "@/lib/arena";
import { probeLabel } from "@/lib/stream";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DIRECTION: Record<
  DecompositionDirection,
  { label: string; variant: "ok" | "danger" | "warn" | "outline" }
> = {
  explained: { label: "gap explained", variant: "ok" },
  reversal: { label: "direction reversed", variant: "danger" },
  hidden: { label: "hidden by the average", variant: "warn" },
  same_direction: { label: "same direction", variant: "outline" },
  no_gap: { label: "no material gap", variant: "outline" },
};

function Bar({
  label,
  hint,
  value,
  maxAbs,
  tone,
}: {
  label: string;
  hint: string;
  value: number;
  maxAbs: number;
  tone: "danger" | "warn" | "ok";
}) {
  const width = Math.max(2, Math.min(100, (Math.abs(value) / maxAbs) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted/70">
          {label}
        </span>
        <span className="font-mono text-[11px] text-ink">
          {signedPercent(value)}
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-sm border border-line/40 bg-canvas/40">
        <div
          className={cn(
            "h-full",
            tone === "danger" && "bg-rose-400/80",
            tone === "warn" && "bg-amber-400/70",
            tone === "ok" && "bg-teal-300/70",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-0.5 text-[9px] leading-snug text-muted/60">{hint}</p>
    </div>
  );
}

export function DecompositionWaterfall({
  analysis,
}: {
  analysis: ComplexAnalysis;
}) {
  const decomposition = analysis.decomposition;

  if (!decomposition) {
    return (
      <section className="panel p-4" aria-label="Before and after decomposition">
        <p className="eyebrow">before / after</p>
        <h3 className="mt-1 flex items-center gap-2 text-[15px] font-semibold">
          <Scale className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          Naive gap vs twin gap
        </h3>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          No single-attribute finding anchors a comparison for this audit, so no
          before/after split is shown. A cell-level confirmation is not a
          substitute for a measured naive gap.
        </p>
      </section>
    );
  }

  const maxAbs = Math.max(
    0.001,
    Math.abs(decomposition.observed_gap),
    Math.abs(decomposition.counterfactual_gap),
    Math.abs(decomposition.confounding_shift),
  );
  const meta = DIRECTION[decomposition.direction];

  return (
    <section className="panel p-4" aria-label="Before and after decomposition">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="eyebrow">before / after</p>
          <h3 className="mt-1 flex items-center gap-2 text-[15px] font-semibold">
            <Scale className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {probeLabel(decomposition.attribute)}: naive vs twin
          </h3>
          <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
            {decomposition.target_group} vs {decomposition.comparison_group} ·{" "}
            {decomposition.n?.toLocaleString() ?? "—"} pairs · materiality{" "}
            {decomposition.materiality.toFixed(2)}
          </p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <div className="mt-3 space-y-2.5">
        <Bar
          label="naive observed gap"
          hint="Rates as they appear in the population, with no controls."
          value={decomposition.observed_gap}
          maxAbs={maxAbs}
          tone={
            Math.abs(decomposition.observed_gap) >= decomposition.materiality
              ? "danger"
              : "ok"
          }
        />
        <Bar
          label="confounding shift"
          hint="Twin gap minus naive gap. A difference, not a share; it can exceed 100 points."
          value={decomposition.confounding_shift}
          maxAbs={maxAbs}
          tone="warn"
        />
        <Bar
          label="twin gap (same financials)"
          hint="Counterfactual net flip: twins differ only in the treatment."
          value={decomposition.counterfactual_gap}
          maxAbs={maxAbs}
          tone={
            Math.abs(decomposition.counterfactual_gap) >= decomposition.materiality
              ? "danger"
              : "ok"
          }
        />
      </div>

      <p
        className={cn(
          "mt-3 rounded border px-2.5 py-2 text-[10px] leading-relaxed",
          decomposition.direction === "reversal"
            ? "border-rose-400/40 bg-rose-400/10 text-rose-100/90"
            : "border-line/50 bg-canvas/40 text-muted",
        )}
      >
        {decomposition.direction_note}
      </p>
      <p className="mt-1.5 text-[9px] leading-relaxed text-muted/60">
        {decomposition.note}
      </p>
    </section>
  );
}

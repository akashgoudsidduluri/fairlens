import { describe, expect, it } from "vitest";

import type { Finding } from "@/api-types";
import { buildComplexAnalysis } from "@/lib/complex";
import { makeFinding, makeReport } from "@/test/fixtures";

function single(overrides: Partial<Finding> = {}): Finding {
  return makeFinding(overrides);
}

function rates(target: number, comparison: number) {
  return { female: target, male: comparison };
}

describe("buildComplexAnalysis", () => {
  it("orients the observed gap as target minus comparison", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({ observational_rates: rates(0.5, 0.4), evidence: { ...makeFinding().evidence, net_flip_rate: 0.05 } }),
        ],
      }),
    );

    // 0.50 - 0.40 = +0.10, the opposite sign of Finding.observational_gap.
    expect(analysis.decomposition?.observed_gap).toBeCloseTo(0.1);
    expect(analysis.decomposition?.counterfactual_gap).toBeCloseTo(0.05);
    expect(analysis.decomposition?.confounding_shift).toBeCloseTo(-0.05);
    expect(analysis.decomposition?.direction).toBe("same_direction");
  });

  it("adds the shift to the observed gap to recover the twin gap", () => {
    const analysis = buildComplexAnalysis(makeReport());
    const d = analysis.decomposition!;
    expect(d.observed_gap + d.confounding_shift).toBeCloseTo(d.counterfactual_gap);
  });

  it("reports the Model 2 shape as a reversal, not a share", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            observational_rates: rates(0.0065, 0.667),
            evidence: { ...makeFinding().evidence, net_flip_rate: 0.6535 },
          }),
        ],
      }),
    );
    const d = analysis.decomposition!;
    expect(d.observed_gap).toBeCloseTo(-0.6605, 4);
    expect(d.counterfactual_gap).toBeCloseTo(0.6535);
    expect(d.confounding_shift).toBeCloseTo(1.314, 3);
    expect(Math.abs(d.confounding_shift)).toBeGreaterThan(1);
    expect(d.direction).toBe("reversal");
  });

  it("reports the Model 7 shape as explained by neutral twins", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            status: "rejected",
            observational_rates: rates(0.3574, 0.5075),
            evidence: { ...makeFinding().evidence, net_flip_rate: 0 },
          }),
        ],
      }),
    );
    const d = analysis.decomposition!;
    expect(d.observed_gap).toBeCloseTo(-0.1501, 4);
    expect(d.direction).toBe("explained");
  });

  it("reports a hidden effect when the naive gap is immaterial", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            observational_rates: rates(0.405, 0.4),
            evidence: { ...makeFinding().evidence, net_flip_rate: 0.1 },
          }),
        ],
      }),
    );
    expect(analysis.decomposition?.direction).toBe("hidden");
  });

  it("reports no gap when neither side reaches materiality", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            observational_rates: rates(0.401, 0.4),
            evidence: { ...makeFinding().evidence, net_flip_rate: 0.001 },
          }),
        ],
      }),
    );
    expect(analysis.decomposition?.direction).toBe("no_gap");
  });

  it("reads materiality from the report config, not a hardcoded threshold", () => {
    const report = makeReport({
      config: { audit: { materiality: 0.2 } },
      findings: [
        single({
          observational_rates: rates(0.5, 0.4),
          evidence: { ...makeFinding().evidence, net_flip_rate: 0.1 },
        }),
      ],
    });
    const d = buildComplexAnalysis(report).decomposition!;
    expect(d.materiality).toBe(0.2);
    // At a 20-point threshold both measured gaps are immaterial.
    expect(d.direction).toBe("no_gap");
  });

  it("marks unprobed proxy attributes unsupported instead of zero", () => {
    const analysis = buildComplexAnalysis(makeReport());
    const rows = Object.fromEntries(analysis.proxy.map((row) => [row.attribute, row]));

    expect(analysis.proxy.map((row) => row.attribute)).toEqual([
      "pincode_group",
      "name_group",
      "age",
    ]);
    expect(rows.age.supported).toBe(false);
    expect(rows.age.net_flip_rate).toBeUndefined();
    expect(rows.age.reason).toBeTruthy();
    expect(rows).not.toHaveProperty("loan_amount");
    expect(rows).not.toHaveProperty("income");
    expect(rows).not.toHaveProperty("credit_score");
  });

  it("carries measured proxy estimates with their interval and n", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            id: "single-pincode_group-p2",
            attribute_or_subgroup: "pincode_group=P2",
            target_group: "P2",
            comparison_group: "P1",
            observational_rates: { P2: 0.3, P1: 0.35 },
            evidence: {
              ...makeFinding().evidence,
              net_flip_rate: 0,
              ci_low: -0.01,
              ci_high: 0.01,
              n: 2000,
            },
          }),
        ],
      }),
    );
    const row = analysis.proxy.find((r) => r.attribute === "pincode_group")!;
    expect(row.supported).toBe(true);
    expect(row.net_flip_rate).toBe(0);
    expect(row.ci_low).toBe(-0.01);
    expect(row.n).toBe(2000);
  });

  it("extracts generalized hotspots with treatment, context, and status", () => {
    const generalized = single({
      id: "gen-gender-female-age-45plus-rural",
      kind: "generalized",
      treatment: "gender",
      treatment_level: "female",
      context: { age: "45+", urban_rural: "rural" },
      status: "kept",
      evidence: { ...makeFinding().evidence, net_flip_rate: 0.6 },
    });
    const analysis = buildComplexAnalysis(
      makeReport({
        config: { audit: { search: { enabled: true } } },
        findings: [generalized],
      }),
    );

    expect(analysis.protocol).toBe("generalized");
    expect(analysis.hotspots).toHaveLength(1);
    expect(analysis.hotspots[0]).toMatchObject({
      treatment: "gender",
      context: { age: "45+", urban_rural: "rural" },
      status: "kept",
      net_flip_rate: 0.6,
    });
  });

  it("returns no decomposition when no finding carries rates", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          single({
            observational_rates: {},
            observational_gap: 0,
          }),
        ],
      }),
    );
    expect(analysis.decomposition).toBeNull();
  });

  it("anchors on the strongest kept effect", () => {
    const weak = single({ id: "weak", evidence: { ...makeFinding().evidence, net_flip_rate: 0.05 } });
    const strong = single({
      id: "strong",
      evidence: { ...makeFinding().evidence, net_flip_rate: 0.3 },
    });
    const analysis = buildComplexAnalysis(makeReport({ findings: [weak, strong] }));
    expect(analysis.decomposition?.finding_id).toBe("strong");
  });

  it("never anchors on a finding merged into a sibling", () => {
    const kept = single({
      id: "kept",
      evidence: { ...makeFinding().evidence, net_flip_rate: 0.1 },
    });
    const merged = single({
      id: "merged",
      kind: "generalized",
      status: "merged",
      evidence: { ...makeFinding().evidence, net_flip_rate: 0.9 },
    });
    const analysis = buildComplexAnalysis(
      makeReport({ findings: [kept, merged] }),
    );
    expect(analysis.decomposition?.finding_id).toBe("kept");
  });
});

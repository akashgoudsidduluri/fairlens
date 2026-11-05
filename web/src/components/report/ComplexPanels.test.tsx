import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecompositionWaterfall } from "@/components/report/DecompositionWaterfall";
import { ProxyVulnerabilityCard } from "@/components/report/ProxyVulnerabilityCard";
import { buildComplexAnalysis } from "@/lib/complex";
import { makeFinding, makeReport } from "@/test/fixtures";

describe("DecompositionWaterfall", () => {
  it("renders the naive gap, the confounding shift, and the twin gap", () => {
    const analysis = buildComplexAnalysis(makeReport());
    render(<DecompositionWaterfall analysis={analysis} />);

    expect(screen.getByLabelText("Before and after decomposition")).toBeInTheDocument();
    expect(screen.getByText("naive observed gap")).toBeInTheDocument();
    expect(screen.getByText("confounding shift")).toBeInTheDocument();
    expect(screen.getByText("twin gap (same financials)")).toBeInTheDocument();
    expect(screen.getByText("direction reversed")).toBeInTheDocument();
  });

  it("labels the shift as a difference, not a causal share", () => {
    const analysis = buildComplexAnalysis(makeReport());
    render(<DecompositionWaterfall analysis={analysis} />);

    expect(
      screen.getByText(/not a causal share/i),
    ).toBeInTheDocument();
  });

  it("shows an explicit empty state when no anchor exists", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          makeFinding({
            observational_rates: {},
            observational_gap: 0,
          }),
        ],
      }),
    );
    render(<DecompositionWaterfall analysis={analysis} />);

    expect(screen.getByText(/no single-attribute finding anchors/i)).toBeInTheDocument();
  });
});

describe("ProxyVulnerabilityCard", () => {
  it("renders one row per proxy attribute with absence visible", () => {
    const analysis = buildComplexAnalysis(makeReport());
    render(<ProxyVulnerabilityCard analysis={analysis} />);

    expect(screen.getByLabelText("Proxy vulnerability")).toBeInTheDocument();
    expect(screen.getByText("region group")).toBeInTheDocument();
    expect(screen.getByText("name group")).toBeInTheDocument();
    expect(screen.getByText("age band")).toBeInTheDocument();
    expect(screen.getAllByText("not measured")).toHaveLength(3);
  });

  it("shows the measured gender-independent estimate with its interval", () => {
    const analysis = buildComplexAnalysis(
      makeReport({
        findings: [
          makeFinding({
            attribute_or_subgroup: "pincode_group=P2",
            target_group: "P2",
            comparison_group: "P1",
            observational_rates: { P2: 0.3, P1: 0.35 },
            evidence: {
              ...makeFinding().evidence,
              net_flip_rate: 0.04,
              ci_low: 0.03,
              ci_high: 0.05,
              n: 2000,
            },
          }),
        ],
      }),
    );
    render(<ProxyVulnerabilityCard analysis={analysis} />);

    expect(screen.getByText(/95% CI/)).toBeInTheDocument();
    expect(screen.getByText(/2,000 pairs/)).toBeInTheDocument();
  });

  it("explains why there is no composite index", () => {
    const analysis = buildComplexAnalysis(makeReport());
    render(<ProxyVulnerabilityCard analysis={analysis} />);

    expect(screen.getByText(/no composite index/i)).toBeInTheDocument();
  });
});

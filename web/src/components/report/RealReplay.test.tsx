import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { AuditRecord, ReplayFile } from "@/api-types";
import { ReportPanel } from "@/components/report/ReportPanel";

/**
 * Integration check against a recorded audit, not a hand-built fixture. The
 * replay files are checked in, so the panels are exercised with the shapes the
 * pipeline actually stores (including null per-group rates).
 */
const repoRoot =
  path.basename(process.cwd()) === "web"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();

function replay(name: string): ReplayFile {
  const file = path.join(repoRoot, "data", "replays", `${name}.json.gz`);
  return JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")) as ReplayFile;
}

function renderReplay(name: string) {
  const recording = replay(name);
  const record = recording.audit as AuditRecord;
  const report = record.result;
  if (!report) throw new Error(`${name} has no stored report`);
  render(
    <MemoryRouter>
      <ReportPanel
        record={record}
        report={report}
        agentEvents={[]}
        mode="replay"
      />
    </MemoryRouter>,
  );
  return report;
}

describe("ReportPanel with recorded replays", () => {
  it("renders the Model 2 reversal and its measured proxy rows", () => {
    const report = renderReplay("sandbox-2-seed-42");

    const waterfall = screen.getByLabelText("Before and after decomposition");
    expect(within(waterfall).getByText("gender: naive vs twin")).toBeInTheDocument();
    expect(within(waterfall).getByText("direction reversed")).toBeInTheDocument();
    expect(within(waterfall).getByText("naive observed gap")).toBeInTheDocument();
    expect(within(waterfall).getByText("confounding shift")).toBeInTheDocument();
    expect(
      within(waterfall).getByText("twin gap (same financials)"),
    ).toBeInTheDocument();

    const proxy = screen.getByLabelText("Proxy vulnerability");
    expect(within(proxy).getByText("region group")).toBeInTheDocument();
    expect(within(proxy).getByText("name group")).toBeInTheDocument();
    expect(within(proxy).getByText("age band")).toBeInTheDocument();
    // Model 2 probes pincode and name; age is not part of the single protocol.
    expect(within(proxy).getByText("not measured")).toBeInTheDocument();

    // The reversal decomposition must not be presented as an additive share.
    expect(
      within(waterfall).getByText(/not a causal share/i),
    ).toBeInTheDocument();
    expect(report.findings.length).toBeGreaterThan(0);
  });

  it("renders the Model 12 hotspot decomposition with no single-attribute proxies", () => {
    const report = renderReplay("sandbox-12-seed-42");

    const waterfall = screen.getByLabelText("Before and after decomposition");
    expect(within(waterfall).getByText("direction reversed")).toBeInTheDocument();
    expect(
      within(waterfall).getByText(/gender: naive vs twin/i),
    ).toBeInTheDocument();

    const proxy = screen.getByLabelText("Proxy vulnerability");
    // The generalized protocol confirms cells instead of single-attribute twins.
    expect(within(proxy).getAllByText("not measured")).toHaveLength(3);

    // Hotspots stay in SearchPanel; the new panels do not duplicate them.
    expect(screen.getAllByLabelText(/Before and after decomposition/)).toHaveLength(1);
    expect(report.findings.some((f) => f.kind === "generalized")).toBe(true);
  });
});

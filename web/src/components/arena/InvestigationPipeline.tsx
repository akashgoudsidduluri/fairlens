import * as React from "react";
import {
  CheckCircle2,
  FileCheck,
  GitBranch,
  Loader2,
  Radar,
  ShieldCheck,
  Sigma,
} from "lucide-react";

import type { AgentEvent, AuditRecord, ProbeEvent } from "@/api-types";
import type { StreamStatus } from "@/hooks/useAuditStream";
import { cn } from "@/lib/utils";

export interface InvestigationPipelineProps {
  status: StreamStatus;
  probeEvents: ProbeEvent[];
  agentEvents: AgentEvent[];
  record: AuditRecord | null;
  isCompleted: boolean;
}

interface Stage {
  id: string;
  number: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  state: "completed" | "active" | "waiting";
  detail?: string;
}

export function InvestigationPipeline({
  status,
  probeEvents,
  agentEvents,
  record,
  isCompleted,
}: InvestigationPipelineProps) {
  const hasProbes = probeEvents.length > 0;
  const hasStats = agentEvents.some((e) => e.agent === "statistician");
  const hasSkeptic = agentEvents.some((e) => e.agent === "skeptic");
  const hasImpact = agentEvents.some(
    (e) => e.agent === "impact" || e.agent === "reporter",
  );
  const hasCertificate = Boolean(record?.result);

  const stages: Stage[] = [
    {
      id: "prober",
      number: "01",
      name: "Twin Probing",
      description: "Counterfactual generation",
      icon: Radar,
      state: isCompleted
        ? "completed"
        : hasProbes
          ? "active"
          : status === "open"
            ? "active"
            : "waiting",
      detail: hasProbes ? `${probeEvents.length} pairs` : undefined,
    },
    {
      id: "stats",
      number: "02",
      name: "Statistical Inference",
      description: "Sequential estimation",
      icon: Sigma,
      state: isCompleted
        ? "completed"
        : hasStats
          ? "active"
          : hasProbes
            ? "active"
            : "waiting",
      detail: hasStats ? "live CI" : undefined,
    },
    {
      id: "skeptic",
      number: "03",
      name: "Adversarial Skeptic",
      description: "Candidate challenge",
      icon: ShieldCheck,
      state: isCompleted ? "completed" : hasSkeptic ? "active" : "waiting",
      detail: hasSkeptic ? "scrutinizing" : undefined,
    },
    {
      id: "discovery",
      number: "04",
      name: "Complex Discovery",
      description: "Proxy & intersectional",
      icon: GitBranch,
      state: isCompleted ? "completed" : hasImpact ? "active" : "waiting",
      detail: isCompleted ? "decomposed" : undefined,
    },
    {
      id: "governance",
      number: "05",
      name: "Audit Attestation",
      description: "Signed ledger & hash chain",
      icon: FileCheck,
      state: isCompleted || hasCertificate ? "completed" : "waiting",
      detail: isCompleted ? "verified" : undefined,
    },
  ];

  return (
    <div
      className="panel p-3.5 shadow-panel"
      role="region"
      aria-label="Investigation pipeline"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="eyebrow">investigation pipeline</p>
          {!isCompleted && status === "open" && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-neon-ping rounded-full bg-accent opacity-90" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_#5eead4]" />
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          {isCompleted ? "Audit Finalized" : "Multi-Agent Pipeline Active"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = stage.state === "active";
          const isDone = stage.state === "completed";

          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex flex-col justify-between rounded-lg border p-2.5 transition-all duration-300",
                isActive &&
                  "border-accent/90 bg-accent/[0.1] shadow-[0_0_24px_rgba(94,234,212,0.25)] ring-2 ring-accent/50",
                isDone && "border-ok/40 bg-ok/[0.04]",
                !isActive && !isDone && "border-line/60 bg-canvas/30 opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[9px] font-bold tracking-wider",
                    isActive
                      ? "text-accent drop-shadow-[0_0_6px_rgba(94,234,212,0.6)]"
                      : isDone
                        ? "text-ok"
                        : "text-muted/60",
                  )}
                >
                  {stage.number}
                </span>
                {isDone ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-ok"
                    aria-hidden="true"
                  />
                ) : isActive ? (
                  <Loader2
                    className="h-4 w-4 animate-spin text-accent drop-shadow-[0_0_10px_#5eead4]"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon
                    className="h-3.5 w-3.5 text-muted/50"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="mt-2">
                <p
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    isActive ? "text-ink" : isDone ? "text-ink" : "text-muted",
                  )}
                >
                  {stage.name}
                </p>
                <p className="mt-0.5 truncate text-[9.5px] text-muted/70">
                  {stage.description}
                </p>
              </div>

              {stage.detail && (
                <div className="mt-2 flex items-center justify-between border-t border-line/40 pt-1 font-mono text-[8.5px]">
                  <span className={isActive ? "text-accent" : "text-ok"}>
                    {stage.detail}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


import * as React from "react";
import { ArrowLeftRight, Equal, Radio, Zap } from "lucide-react";

import type { ProbeEvent } from "@/api-types";
import { Badge } from "@/components/ui/badge";
import { fieldLabel, probeLabel } from "@/lib/stream";
import { isFlip, pairKey } from "@/lib/arena";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_PAIRS = 5;
const FADE_AFTER_MS = 1400;

const SUMMARY_FIELDS = [
  { key: "income", label: "annual income" },
  { key: "gender", label: "gender" },
  { key: "age_band", label: "age band" },
  { key: "urban_rural", label: "location" },
  { key: "pincode_group", label: "region group" },
  { key: "name_group", label: "name group" },
] as const;

/**
 * Probe ids name the attribute being varied, while the twin card shows the
 * applicant column that actually changes. Age probes store `age` but the card
 * renders `age_band`, so highlight the band when an age probe arrives.
 */
const CHANGED_FIELD_ALIAS: Record<string, string> = {
  age: "age_band",
};

const PHASE_LABEL: Record<ProbeEvent["phase"], string> = {
  single_attribute: "single attribute",
  intersectional: "combined cells",
  matched_retest: "matched retest",
  discovery: "discovery (Phase A)",
  confirmation: "confirmation (Phase B)",
};

function displayValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "income" && typeof value === "number") {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return String(value).replaceAll("_", " ");
}

function DecisionStamp({ approved }: { approved: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rotate-[-1.5deg] whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[9.5px] uppercase font-semibold leading-none tracking-[0.16em]",
        approved
          ? "border-ok/70 bg-ok/15 text-ok shadow-[0_0_10px_rgba(74,222,128,0.25)]"
          : "border-danger/70 bg-danger/15 text-danger shadow-[0_0_10px_rgba(251,113,133,0.25)]",
      )}
    >
      {approved ? "approved" : "rejected"}
    </span>
  );
}

function ApplicantCard({
  side,
  applicant,
  approved,
  changedField,
}: {
  side: "original" | "twin";
  applicant: Record<string, unknown>;
  approved: boolean;
  changedField: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 transition-all duration-300",
        side === "twin"
          ? "border-line bg-panel/85 shadow-sm"
          : "border-line/70 bg-canvas/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
          {side === "original" ? "a · original" : "b · twin"}
        </span>
        <DecisionStamp approved={approved} />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
        {SUMMARY_FIELDS.map((field) => {
          const changed =
            (CHANGED_FIELD_ALIAS[changedField] ?? changedField) === field.key;
          return (
            <div
              key={field.key}
              className={cn(
                "rounded px-1.5 py-0.5 transition-all duration-300",
                changed &&
                  "bg-accent/20 ring-1 ring-inset ring-accent/60 shadow-[0_0_12px_rgba(94,234,212,0.25)]",
              )}
            >
              <dt
                className={cn(
                  "text-[8.5px] uppercase tracking-[0.12em]",
                  changed ? "font-semibold text-accent" : "text-muted/70",
                )}
              >
                {field.label}
                {changed ? " · changed" : ""}
              </dt>
              <dd
                className={cn(
                  "truncate font-mono text-[11px]",
                  changed ? "font-semibold text-accent" : "text-ink",
                )}
                title={displayValue(field.key, applicant[field.key])}
              >
                {displayValue(field.key, applicant[field.key])}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-1.5 truncate font-mono text-[9px] text-muted/60">
        applicant #{String(applicant.id ?? "—")}
      </p>
    </div>
  );
}

function PairCard({ event }: { event: ProbeEvent }) {
  const flip = isFlip(event);
  const [settled, setSettled] = React.useState(false);

  React.useEffect(() => {
    if (flip) return;
    const timer = setTimeout(() => setSettled(true), FADE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [flip]);

  return (
    <article
      data-testid="twin-pair"
      data-flip={flip ? "true" : "false"}
      className={cn(
        "rounded-xl border p-3.5 transition-all duration-500 animate-card-enter",
        !flip && settled && "opacity-30",
        flip
          ? "border-danger/80 bg-danger/[0.07] shadow-[0_0_36px_rgba(251,113,133,0.3)] animate-flip ring-2 ring-danger/50"
          : "border-line/75 bg-raised/30 hover:border-line",
      )}
    >
      <header className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-medium text-muted">
          pair #{event.pair_index + 1}
        </span>
        <Badge variant="outline">{PHASE_LABEL[event.phase]}</Badge>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
          <ArrowLeftRight className="h-3 w-3 text-accent/80" aria-hidden="true" />
          changed: {probeLabel(event.changed_field)}
        </span>
        <span className="ml-auto">
          {flip ? (
            <Badge variant="danger" className="gap-1 shadow-[0_0_16px_rgba(251,113,133,0.5)]">
              <Zap className="h-3 w-3 animate-bounce text-danger" aria-hidden="true" />
              flipped
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Equal className="h-3 w-3" aria-hidden="true" />
              {settled ? "same decision · faded" : "same decision"}
            </Badge>
          )}
        </span>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <ApplicantCard
          side="original"
          applicant={event.original}
          approved={event.original_approved}
          changedField={event.changed_field}
        />
        <ApplicantCard
          side="twin"
          applicant={event.twin}
          approved={event.twin_approved}
          changedField={event.changed_field}
        />
      </div>

      {flip && (
        <p className="mt-2.5 flex items-center gap-1 text-[11px] font-medium leading-snug text-danger">
          <Zap className="h-3.5 w-3.5 shrink-0 text-danger animate-pulse" aria-hidden="true" />
          Same applicant, only {fieldLabel(event.changed_field)} changed — the
          decision flipped.
        </p>
      )}
    </article>
  );
}

export function TwinStream({ events }: { events: ProbeEvent[] }) {
  const visible = React.useMemo(
    () => events.slice(-MAX_VISIBLE_PAIRS).reverse(),
    [events],
  );

  return (
    <section className="panel flex flex-col p-4 shadow-panel" aria-label="Twin stream">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">twin stream</p>
            {events.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-neon-ping rounded-full bg-accent opacity-90" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_#5eead4]" />
              </span>
            )}
          </div>
          <h2 className="mt-1 text-[15px] font-semibold">
            Same person, one field changed
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent/20 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-accent shadow-[0_0_14px_rgba(94,234,212,0.4)]">
              <Radio className="h-3 w-3 animate-spin [animation-duration:2.5s] text-accent" aria-hidden="true" />
              <span className="animate-pulse">active stream</span>
            </span>
          )}
          <Badge variant="outline">{MAX_VISIBLE_PAIRS} on screen max</Badge>
        </div>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted/80">
        A flip flashes red and drops into the flipped tray. Matching pairs fade
        after a moment so the next pair is easy to read.
      </p>

      {events.length > 0 && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-accent/50 bg-gradient-to-r from-accent/[0.09] via-panel/95 to-accent/[0.05] p-3 shadow-[0_0_20px_rgba(94,234,212,0.18)] ring-1 ring-accent/30">
          <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-sweep-horizontal" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping opacity-70" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent animate-spin [animation-duration:3s]" />
                <div className="absolute inset-1 rounded-full border border-accent/60 animate-spin [animation-duration:6s] [animation-direction:reverse]" />
                <Radio className="relative z-10 h-4 w-4 text-accent drop-shadow-[0_0_8px_rgba(94,234,212,0.9)] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                    Counterfactual Intervention Sweep
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-90" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#5eead4]" />
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-muted">
                  Generating twin pairs under do(X = x′) · <span className="font-semibold text-ink">{events.length}</span> pairs evaluated
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 rounded-lg border border-accent/50 bg-accent/25 px-2.5 py-1 font-semibold text-accent shadow-[0_0_12px_rgba(94,234,212,0.3)]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                DO(X) ENGINE RUNNING
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3.5 min-h-[240px] flex-1 space-y-3">
        {visible.map((event) => (
          <PairCard key={pairKey(event)} event={event} />
        ))}
        {visible.length === 0 && (
          <div className="radar-grid relative flex h-full min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-xl border border-line/90 bg-canvas/70 p-6 text-center">
            {/* Animated sweeping scanline */}
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-28 bg-gradient-to-b from-transparent via-accent/20 to-transparent animate-scanline" />

            {/* Large concentric rotating radar viewport */}
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
              {/* Outer glowing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/40 shadow-[0_0_24px_rgba(94,234,212,0.35)]" />

              {/* Middle dashed rotating ring */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent/70 animate-spin [animation-duration:8s]" />

              {/* Inner reverse-rotating ring */}
              <div className="absolute inset-4 rounded-full border-2 border-accent/80 animate-spin [animation-duration:4s] [animation-direction:reverse]" />

              {/* Conical radar sweep beam */}
              <div className="absolute inset-0 animate-radar-sweep origin-center">
                <div className="h-1/2 w-1/2 rounded-tl-full bg-gradient-to-br from-accent/60 via-accent/25 to-transparent" />
              </div>

              {/* Crosshair target ticks */}
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-accent/30" />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-accent/30" />

              {/* Center glowing radio transmitter */}
              <Radio className="relative z-10 h-7 w-7 text-accent drop-shadow-[0_0_12px_#5eead4] animate-strong-pulse" aria-hidden="true" />
            </div>

            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-accent drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]">
              initializing counterfactual engine
            </p>
            <p className="mt-1.5 font-mono text-[11.5px] font-medium text-ink">
              waiting for the first twin pair…
            </p>
            <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-muted/80">
              Pairs arrive in batches over the event stream and slide in here.
            </p>

            <div className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 font-mono text-[9.5px] font-medium text-accent shadow-[0_0_15px_rgba(94,234,212,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-90" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Awaiting Prober stream · Intervention: do(X = x′)
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

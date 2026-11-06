import { CheckCircle2, Link2, ShieldCheck, XCircle } from "lucide-react";

import type { Certificate } from "@/api-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function payloadString(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === "string" ? value : null;
}

export function CertificateCard({
  certificate,
  broken = false,
}: {
  certificate: Certificate;
  broken?: boolean;
}) {
  const approver = payloadString(certificate.payload, "approver") ?? "unknown";
  const decision = payloadString(certificate.payload, "decision") ?? "unknown";
  const approved = decision === "approve";
  const licenseId = payloadString(certificate.payload, "approver_license_id");
  const approverRole = payloadString(certificate.payload, "approver_role");
  const approverOrg = payloadString(certificate.payload, "approver_organization");
  const auditorSig = payloadString(certificate.payload, "auditor_signature");

  return (
    <article
      className={cn(
        "rounded-xl border bg-panel/70 p-4 shadow-sm",
        broken ? "border-danger/60" : "border-line",
      )}
      aria-label={`Audit Record ${certificate.index}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <p className="font-mono text-[11px] text-ink font-semibold">
            record #{certificate.index}
          </p>
          {certificate.index === 0 && (
            <Badge variant="outline">genesis</Badge>
          )}
        </div>
        <Badge variant={approved ? "ok" : "danger"}>
          {approved ? (
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          ) : (
            <XCircle className="h-3 w-3" aria-hidden="true" />
          )}
          {decision}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
        <p className="text-[12px] font-medium text-ink">{approver}</p>
        {approverRole && (
          <Badge variant="accent" className="text-[9px] py-0">
            {approverRole}
          </Badge>
        )}
      </div>

      <p className="font-mono text-[10px] text-muted tabular-nums">{certificate.created_at}</p>

      {/* Verified Auditor Badge */}
      {licenseId && (
        <div className="mt-2.5 rounded-md border border-line bg-raised/50 p-2.5 text-[11px]">
          <div className="flex items-center justify-between font-mono text-[9.5px]">
            <span className="flex items-center gap-1 text-muted uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3 text-accent" />
              Accredited Auditor
            </span>
            <span className="font-semibold text-accent tabular-nums">{licenseId}</span>
          </div>
          {approverOrg && (
            <p className="text-[10px] text-muted truncate mt-1">{approverOrg}</p>
          )}
          {auditorSig && (
            <div className="mt-1.5 pt-1 border-t border-line/50 flex items-center justify-between text-[9px] font-mono text-muted/80">
              <span>Signature Digest:</span>
              <span className="tabular-nums font-semibold text-ink">{auditorSig.slice(0, 16)}…</span>
            </div>
          )}
        </div>
      )}

      <dl className="mt-3 space-y-1.5">
        <div>
          <dt className="font-mono text-[9px] uppercase tracking-[0.13em] text-muted/60">
            record hash
          </dt>
          <dd className="hash break-all tabular-nums">{certificate.record_hash}</dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] uppercase tracking-[0.13em] text-muted/60">
            previous hash
          </dt>
          <dd className="hash break-all tabular-nums">{certificate.prev_hash}</dd>
        </div>
      </dl>
      {broken && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-danger">
          hash mismatch · first broken record
        </p>
      )}
    </article>
  );
}

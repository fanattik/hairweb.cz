import Link from "next/link";
import { AdminCard } from "@/components/admin/ui";
import type { Lead } from "@/lib/leads/types";

type AuditResultLite = {
  recommendations?: Array<{ title: string; priority: string }>;
  summary?: string;
};

export function OnlineAuditPanel({ lead }: { lead: Lead }) {
  if (lead.audit_score == null && !lead.online_audit_id && !lead.audit_result) {
    return null;
  }

  const result = (lead.audit_result || {}) as AuditResultLite;
  const topProblems = (result.recommendations || [])
    .filter((r) => r.priority === "high" || r.priority === "medium")
    .slice(0, 3);

  const potential =
    lead.audit_score == null
      ? null
      : lead.audit_score < 55
        ? "HIGH"
        : lead.audit_score < 75
          ? "MEDIUM"
          : "LOW";

  const auditHref = lead.online_audit_id
    ? `/audit/${lead.online_audit_id}`
    : lead.id
      ? `/audit/${lead.id}`
      : null;

  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
            HAIRWEB Online Audit
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {lead.audit_score != null ? `${lead.audit_score} / 100` : "—"}
          </p>
          {potential ? (
            <p className="mt-1 text-sm text-ink-soft">
              Obchodní potenciál:{" "}
              <span className="font-semibold text-ink">{potential}</span>
              <span className="text-ink-muted">
                {" "}
                (nižší score = větší prostor k pomoci)
              </span>
            </p>
          ) : null}
        </div>
        {auditHref ? (
          <Link
            href={auditHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 px-5 text-[14px] font-medium tracking-tight transition hover:border-ink/35"
          >
            Otevřít výsledek
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Web", lead.audit_web_score],
          ["Google", lead.audit_google_score],
          ["Katalogy", lead.audit_directories_score],
          ["AI", lead.audit_ai_score],
          ["Recenze", lead.audit_reviews_score],
          ["Rezervace", lead.audit_booking_score],
          ["Social", lead.audit_social_score],
          ["Zákazníci", lead.audit_customers_score],
          ["Marketing", lead.audit_marketing_score],
        ].map(([label, score]) => (
          <div key={String(label)} className="rounded-[14px] bg-mist px-3 py-2.5">
            <p className="text-[11px] text-ink-muted">{label}</p>
            <p className="text-sm font-medium tabular-nums">
              {score != null ? `${score}` : "—"}
            </p>
          </div>
        ))}
      </div>

      {topProblems.length > 0 ? (
        <div className="mt-5">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
            Největší problémy
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
            {topProblems.map((p) => (
              <li key={p.title}>{p.title}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {result.summary || lead.opportunity_note ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {result.summary || lead.opportunity_note}
        </p>
      ) : null}

      {lead.email ? (
        <a
          href={`mailto:${lead.email}?subject=${encodeURIComponent(`HAIRWEB — audit ${lead.salon_name || ""}`)}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-[14px] font-medium text-foam transition hover:bg-copper"
        >
          Kontaktovat lead
        </a>
      ) : null}
    </AdminCard>
  );
}

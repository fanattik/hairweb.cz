import Link from "next/link";
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
    <section className="border border-line bg-foam p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            HAIRWEB Online Audit
          </p>
          <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-3xl font-semibold tracking-tight">
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
            className="border border-line px-3 py-2 text-sm hover:border-ink"
            target="_blank"
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
          <div key={String(label)} className="rounded-lg bg-mist px-3 py-2">
            <p className="text-[11px] text-ink-muted">{label}</p>
            <p className="text-sm font-medium tabular-nums">
              {score != null ? `${score}` : "—"}
            </p>
          </div>
        ))}
      </div>

      {topProblems.length > 0 ? (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
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
          className="mt-5 inline-flex border border-ink bg-ink px-4 py-2 text-sm text-foam hover:bg-copper"
        >
          Kontaktovat lead
        </a>
      ) : null}
    </section>
  );
}

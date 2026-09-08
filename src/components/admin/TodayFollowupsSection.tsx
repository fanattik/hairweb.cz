"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  daysOverdue,
  formatPragueDate,
  followupBadgeLabel,
} from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

type Props = {
  overdue: Lead[];
  dueToday: Lead[];
};

function QuickRow({ lead, overdueDays }: { lead: Lead; overdueDays?: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const title = lead.salon_name || lead.name;
  const badge = followupBadgeLabel(lead.next_followup_at, {
    followupPaused: lead.followup_paused,
    followupStopped: lead.followup_stopped,
    leadStatus: lead.status,
  });

  async function recordEmailFollowup() {
    setBusy(true);
    await fetch(`/api/admin/leads/${lead.id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "contact",
        contactType: "email",
        contactedAt: new Date().toISOString(),
        isFollowup: Boolean(lead.last_contact_at),
      }),
    });
    setBusy(false);
    router.refresh();
  }

  async function snooze(preset: "tomorrow" | "plus3" | "plus7") {
    setBusy(true);
    await fetch(`/api/admin/leads/${lead.id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "snooze", preset }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="border border-line bg-foam p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/leads/${lead.id}`}
            className="font-medium hover:underline"
          >
            {title}
          </Link>
          <p className="mt-1 text-sm text-ink-soft">
            {[lead.city, lead.email || lead.phone].filter(Boolean).join(" · ") ||
              "—"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <StatusBadge status={lead.status} />
            <span
              className={
                badge.tone === "danger"
                  ? "text-copper-deep"
                  : badge.tone === "warning"
                    ? "text-amber-800"
                    : "text-ink-soft"
              }
            >
              {badge.label}
            </span>
            <span className="text-ink-soft">
              FU {lead.followup_count ?? 0}/3 ·{" "}
              {formatPragueDate(lead.next_followup_at)}
              {overdueDays != null && overdueDays > 0
                ? ` · +${overdueDays} d`
                : ""}
            </span>
            {lead.opportunity_grade ? (
              <span className="text-ink-soft">Opp {lead.opportunity_grade}</span>
            ) : null}
            {lead.google_rating != null ? (
              <span className="text-ink-soft">
                {Number(lead.google_rating).toFixed(1)}★
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="border border-line px-3 py-1.5 hover:border-ink"
            >
              E-mail
            </a>
          ) : null}
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="border border-line px-3 py-1.5 hover:border-ink"
            >
              Telefon
            </a>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void recordEmailFollowup()}
            className="border border-line px-3 py-1.5 hover:border-ink disabled:opacity-50"
          >
            Zaznamenat
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void snooze("tomorrow")}
            className="border border-line px-3 py-1.5 hover:border-ink disabled:opacity-50"
          >
            Odložit
          </button>
          <Link
            href={`/admin/leads/${lead.id}`}
            className="border border-line px-3 py-1.5 hover:border-ink"
          >
            Detail
          </Link>
        </div>
      </div>
    </li>
  );
}

export function TodayFollowupsSection({ overdue, dueToday }: Props) {
  if (!overdue.length && !dueToday.length) {
    return (
      <section className="mt-10 border border-line bg-foam p-5">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl">
          Dnes kontaktovat
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Nic na dnes — žádné due ani overdue follow-upy.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl">
          Dnes kontaktovat
        </h2>
        <Link
          href="/admin/leads?followup=today"
          className="text-sm text-copper hover:underline"
        >
          Zobrazit vše →
        </Link>
      </div>

      {overdue.length ? (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-deep">
            Po termínu ({overdue.length})
          </h3>
          <ul className="mt-3 grid gap-3">
            {overdue.map((lead) => (
              <QuickRow
                key={lead.id}
                lead={lead}
                overdueDays={
                  lead.next_followup_at
                    ? daysOverdue(lead.next_followup_at)
                    : undefined
                }
              />
            ))}
          </ul>
        </div>
      ) : null}

      {dueToday.length ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
            Dnes ({dueToday.length})
          </h3>
          <ul className="mt-3 grid gap-3">
            {dueToday.map((lead) => (
              <QuickRow key={lead.id} lead={lead} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

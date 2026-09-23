"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  AdminButton,
  AdminEmpty,
  AdminSection,
} from "@/components/admin/ui";
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

  async function snooze() {
    setBusy(true);
    await fetch(`/api/admin/leads/${lead.id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "snooze", preset: "tomorrow" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="rounded-[20px] bg-foam px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/leads/${lead.id}`}
            className="font-medium tracking-tight text-ink hover:text-copper"
          >
            {title}
          </Link>
          <p className="mt-1 text-sm text-ink-soft">
            {[lead.city, lead.email || lead.phone].filter(Boolean).join(" · ") ||
              "—"}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <StatusBadge status={lead.status} />
            <span
              className={
                badge.tone === "danger"
                  ? "text-copper-deep"
                  : badge.tone === "warning"
                    ? "text-ink"
                    : "text-ink-muted"
              }
            >
              {badge.label}
            </span>
            <span className="text-ink-muted">
              FU {lead.followup_count ?? 0}/3 ·{" "}
              {formatPragueDate(lead.next_followup_at)}
              {overdueDays != null && overdueDays > 0
                ? ` · +${overdueDays} d`
                : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex min-h-9 items-center rounded-full border border-ink/12 px-3.5 text-[13px] font-medium"
            >
              E-mail
            </a>
          ) : null}
          <AdminButton
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void recordEmailFollowup()}
            className="min-h-9 px-3.5 text-[13px]"
          >
            Zaznamenat
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void snooze()}
            className="min-h-9 px-3.5 text-[13px]"
          >
            Odložit
          </AdminButton>
        </div>
      </div>
    </li>
  );
}

export function TodayFollowupsSection({ overdue, dueToday }: Props) {
  if (!overdue.length && !dueToday.length) {
    return (
      <AdminSection
        title="Dnes kontaktovat"
        description="Follow-upy, které mají jít ven dnes."
      >
        <AdminEmpty>Nic na dnes — žádné due ani overdue follow-upy.</AdminEmpty>
      </AdminSection>
    );
  }

  return (
    <AdminSection
      title="Dnes kontaktovat"
      description="Follow-upy, které mají jít ven dnes."
      action={
        <Link
          href="/admin/leads?followup=today"
          className="text-sm font-medium text-copper hover:underline"
        >
          Zobrazit vše →
        </Link>
      }
    >
      {overdue.length ? (
        <div>
          <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-copper uppercase">
            Po termínu · {overdue.length}
          </p>
          <ul className="grid gap-2.5">
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
        <div className={overdue.length ? "mt-8" : undefined}>
          <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
            Dnes · {dueToday.length}
          </p>
          <ul className="grid gap-2.5">
            {dueToday.map((lead) => (
              <QuickRow key={lead.id} lead={lead} />
            ))}
          </ul>
        </div>
      ) : null}
    </AdminSection>
  );
}

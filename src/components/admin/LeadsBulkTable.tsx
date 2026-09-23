"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PriorityBadge,
  WebBandBadge,
} from "@/components/admin/ScoreBadges";
import { MarketingChannelBadge } from "@/components/admin/MarketingChannelBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminButton } from "@/components/admin/ui";
import { planLeadAnalysis } from "@/lib/leads/analyze-plan";
import { followupBadgeLabel } from "@/lib/leads/followup";
import {
  leadPriorityFromScore,
  webScoreBand,
} from "@/lib/leads/scoring";
import type { Lead } from "@/lib/leads/types";

const BATCH_SIZE = 5;
const DELETE_BATCH_SIZE = 50;

type Props = {
  leads: Lead[];
};

type BulkResult = {
  id: string;
  name: string;
  status: "ok" | "skipped" | "needs_selection" | "failed";
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

function isAnalyzable(lead: Lead) {
  const plan = planLeadAnalysis(lead);
  return plan.google || plan.instagram || plan.web;
}

export function LeadsBulkTable({ leads }: Props) {
  const router = useRouter();
  const allIds = useMemo(() => leads.map((l) => l.id), [leads]);
  const analyzableIds = useMemo(
    () => leads.filter(isAnalyzable).map((l) => l.id),
    [leads],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [overwrite, setOverwrite] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [summary, setSummary] = useState<{
    ok: number;
    skipped: number;
    needs_selection: number;
    failed: number;
  } | null>(null);
  const [failures, setFailures] = useState<BulkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));
  const selectedAnalyzable = useMemo(
    () => [...selected].filter((id) => analyzableIds.includes(id)),
    [selected, analyzableIds],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmDelete(false);
  }

  function toggleAll() {
    setConfirmDelete(false);
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(allIds));
  }

  async function runBulk(ids: string[]) {
    if (!ids.length) return;
    setRunning(true);
    setConfirmDelete(false);
    setError(null);
    setDeleteMessage(null);
    setFailures([]);
    setSummary({ ok: 0, skipped: 0, needs_selection: 0, failed: 0 });
    setProgress({ done: 0, total: ids.length });

    const tallies = {
      ok: 0,
      skipped: 0,
      needs_selection: 0,
      failed: 0,
    };
    const failRows: BulkResult[] = [];

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const chunk = ids.slice(i, i + BATCH_SIZE);
      const response = await fetch("/api/admin/leads/analyze-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: chunk, overwrite }),
      });

      const data = (await response.json()) as {
        error?: string;
        results?: BulkResult[];
      };

      if (!response.ok) {
        setError(data.error || "Hromadná analýza selhala.");
        setRunning(false);
        return;
      }

      for (const row of data.results || []) {
        tallies[row.status] += 1;
        if (row.status === "failed" || row.status === "needs_selection") {
          failRows.push(row);
        }
      }

      setSummary({ ...tallies });
      setProgress({
        done: Math.min(i + chunk.length, ids.length),
        total: ids.length,
      });
      setFailures([...failRows]);
    }

    setRunning(false);
    setSelected(new Set());
    router.refresh();
  }

  async function runDelete(ids: string[]) {
    if (!ids.length) return;
    setRunning(true);
    setError(null);
    setDeleteMessage(null);
    setSummary(null);
    setFailures([]);
    setProgress({ done: 0, total: ids.length });

    let deleted = 0;

    for (let i = 0; i < ids.length; i += DELETE_BATCH_SIZE) {
      const chunk = ids.slice(i, i + DELETE_BATCH_SIZE);
      const response = await fetch("/api/admin/leads/delete-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: chunk }),
      });

      const data = (await response.json()) as {
        error?: string;
        deleted?: number;
      };

      if (!response.ok) {
        setError(data.error || "Hromadné mazání selhalo.");
        setRunning(false);
        setConfirmDelete(false);
        return;
      }

      deleted += data.deleted ?? chunk.length;
      setProgress({
        done: Math.min(i + chunk.length, ids.length),
        total: ids.length,
      });
    }

    setRunning(false);
    setConfirmDelete(false);
    setSelected(new Set());
    setDeleteMessage(`Smazáno: ${deleted}`);
    router.refresh();
  }

  const selectedCount = selected.size;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5 rounded-full bg-foam px-4 py-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={running || allIds.length === 0}
          />
          Vybrat vše ({allIds.length})
        </label>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={running || analyzableIds.length === 0}
          onClick={() => {
            setConfirmDelete(false);
            setSelected(new Set(analyzableIds));
          }}
          className="min-h-9 px-3.5 text-[13px]"
        >
          Jen analyzovatelné ({analyzableIds.length})
        </AdminButton>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            disabled={running}
          />
          Přepsat data
        </label>
        <AdminButton
          type="button"
          disabled={running || selectedAnalyzable.length === 0}
          onClick={() => runBulk(selectedAnalyzable)}
          className="min-h-9 px-3.5 text-[13px]"
        >
          {running && !confirmDelete
            ? `Analyzuji… ${progress?.done ?? 0}/${progress?.total ?? 0}`
            : `Analyzovat (${selectedAnalyzable.length})`}
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={running || analyzableIds.length === 0}
          onClick={() => runBulk(analyzableIds)}
          className="min-h-9 px-3.5 text-[13px]"
        >
          Všechny na stránce ({analyzableIds.length})
        </AdminButton>
        {!confirmDelete ? (
          <AdminButton
            type="button"
            variant="danger"
            disabled={running || selectedCount === 0}
            onClick={() => setConfirmDelete(true)}
            className="min-h-9 px-3.5 text-[13px]"
          >
            Smazat ({selectedCount})
          </AdminButton>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-soft">
              Opravdu smazat {selectedCount}?
            </span>
            <AdminButton
              type="button"
              variant="ghost"
              disabled={running}
              onClick={() => setConfirmDelete(false)}
              className="min-h-9 px-3.5 text-[13px]"
            >
              Zrušit
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              disabled={running || selectedCount === 0}
              onClick={() => runDelete([...selected])}
              className="min-h-9 px-3.5 text-[13px]"
            >
              {running
                ? `Mazání… ${progress?.done ?? 0}/${progress?.total ?? 0}`
                : `Ano, smazat`}
            </AdminButton>
          </div>
        )}
      </div>

      {summary ? (
        <p className="text-sm text-ink-soft">
          Hotovo: ✓ {summary.ok} · přeskočeno {summary.skipped} · ke kontrole{" "}
          {summary.needs_selection} · chyby {summary.failed}
        </p>
      ) : null}
      {deleteMessage ? (
        <p className="text-sm text-ink-soft">{deleteMessage}</p>
      ) : null}
      {error ? <p className="text-sm text-copper-deep">{error}</p> : null}
      {failures.length ? (
        <ul className="max-h-40 overflow-auto rounded-[16px] bg-mist p-4 text-xs text-ink-soft">
          {failures.map((row) => (
            <li key={row.id}>
              <Link href={`/admin/leads/${row.id}`} className="underline">
                {row.name}
              </Link>
              : {row.error || row.status}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="overflow-x-auto rounded-[22px] bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink/6 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.1em] text-ink-muted uppercase">
            <tr>
              <th className="w-10 px-4 py-4" />
              <th className="px-4 py-4">Opp</th>
              <th className="px-4 py-4">Salon</th>
              <th className="hidden px-4 py-4 md:table-cell">Město</th>
              <th className="px-4 py-4">Google</th>
              <th className="hidden px-4 py-4 lg:table-cell">Recenze</th>
              <th className="px-4 py-4">Web</th>
              <th className="hidden px-4 py-4 xl:table-cell">Booking</th>
              <th className="px-4 py-4">Status</th>
              <th className="hidden px-4 py-4 xl:table-cell">Zdroj</th>
              <th className="hidden px-4 py-4 lg:table-cell">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const score = lead.opportunity_score ?? lead.lead_score;
              const priorityValue =
                lead.lead_score != null
                  ? leadPriorityFromScore(lead.lead_score)
                  : null;
              const web =
                lead.has_website === false ? null : lead.web_score;
              const canAnalyze = isAnalyzable(lead);
              const fu = followupBadgeLabel(lead.next_followup_at, {
                followupPaused: lead.followup_paused,
                followupStopped: lead.followup_stopped,
                leadStatus: lead.status,
              });

              return (
                <tr
                  key={lead.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-mist/50"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      disabled={running}
                      onChange={() => toggle(lead.id)}
                      title={
                        canAnalyze
                          ? "Vybrat k analýze / smazání"
                          : "Vybrat ke smazání"
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="block min-w-[4.5rem]"
                    >
                      {score != null ? (
                        <div>
                          <p className="text-xl font-semibold leading-none tracking-tight text-ink">
                            {score}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            {lead.opportunity_grade ? (
                              <span className="text-[10px] font-semibold tracking-wide">
                                {lead.opportunity_grade}
                              </span>
                            ) : null}
                            {priorityValue ? (
                              <PriorityBadge priority={priorityValue} />
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium tracking-tight hover:text-copper"
                    >
                      {lead.salon_name || lead.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-soft md:hidden">
                      {lead.city || "—"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    {lead.city || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {lead.google_rating != null ? (
                      <span>{Number(lead.google_rating).toFixed(1)} ★</span>
                    ) : (
                      "—"
                    )}
                    <span className="mt-0.5 block text-xs text-ink-soft lg:hidden">
                      {lead.google_reviews_count != null
                        ? `${lead.google_reviews_count} rec.`
                        : ""}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 lg:table-cell">
                    {lead.google_reviews_count ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    {lead.has_website === false ? (
                      <span className="text-xs text-ink-soft">NO WEB</span>
                    ) : web != null ? (
                      <WebBandBadge band={webScoreBand(web)} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden px-4 py-4 xl:table-cell">
                    {lead.has_online_booking
                      ? lead.booking_provider || "Ano"
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-4 py-4 xl:table-cell">
                    <MarketingChannelBadge
                      lead={{
                        type: lead.type,
                        leadSource: lead.source,
                        first_touch_source: lead.first_touch_source,
                        first_touch_medium: lead.first_touch_medium,
                        first_touch_campaign: lead.first_touch_campaign,
                        first_touch_referrer: lead.first_touch_referrer,
                        utm_source: lead.utm_source,
                        utm_medium: lead.utm_medium,
                        utm_campaign: lead.utm_campaign,
                        fbclid: lead.fbclid,
                        referrer: lead.referrer,
                      }}
                    />
                    {lead.first_touch_campaign || lead.utm_campaign ? (
                      <p className="mt-1 max-w-[9rem] truncate text-[10px] text-ink-soft">
                        {lead.first_touch_campaign || lead.utm_campaign}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-4 lg:table-cell">
                    <span
                      className={
                        fu.tone === "danger"
                          ? "text-xs font-medium text-copper-deep"
                          : fu.tone === "warning"
                            ? "text-xs font-medium text-ink"
                            : fu.tone === "muted"
                              ? "text-xs text-ink-soft"
                              : "text-xs text-ink"
                      }
                      title={formatDate(lead.next_followup_at)}
                    >
                      {fu.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

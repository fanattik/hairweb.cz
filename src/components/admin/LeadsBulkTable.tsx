"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PriorityBadge,
  WebBandBadge,
} from "@/components/admin/ScoreBadges";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { planLeadAnalysis } from "@/lib/leads/analyze-plan";
import { followupBadgeLabel } from "@/lib/leads/followup";
import {
  leadPriorityFromScore,
  webScoreBand,
} from "@/lib/leads/scoring";
import type { Lead } from "@/lib/leads/types";

const BATCH_SIZE = 5;

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
  const analyzableIds = useMemo(
    () => leads.filter(isAnalyzable).map((l) => l.id),
    [leads],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [overwrite, setOverwrite] = useState(false);
  const [running, setRunning] = useState(false);
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

  const allSelected =
    analyzableIds.length > 0 &&
    analyzableIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(analyzableIds));
  }

  async function runBulk(ids: string[]) {
    if (!ids.length) return;
    setRunning(true);
    setError(null);
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

  const selectedCount = selected.size;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3 border border-line bg-foam p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={running || analyzableIds.length === 0}
          />
          Vybrat analyzovatelné ({analyzableIds.length})
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            disabled={running}
          />
          Přepsat existující data
        </label>
        <button
          type="button"
          disabled={running || selectedCount === 0}
          onClick={() => runBulk([...selected])}
          className="bg-ink px-3 py-2 text-sm text-foam hover:bg-ink-soft disabled:opacity-50"
        >
          {running
            ? `Analyzuji… ${progress?.done ?? 0}/${progress?.total ?? 0}`
            : `Analyzovat vybrané (${selectedCount})`}
        </button>
        <button
          type="button"
          disabled={running || analyzableIds.length === 0}
          onClick={() => runBulk(analyzableIds)}
          className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
        >
          Analyzovat všechny na stránce ({analyzableIds.length})
        </button>
      </div>

      {summary ? (
        <p className="text-sm text-ink-soft">
          Hotovo: ✓ {summary.ok} · přeskočeno {summary.skipped} · ke kontrole{" "}
          {summary.needs_selection} · chyby {summary.failed}
        </p>
      ) : null}
      {error ? <p className="text-sm text-copper-deep">{error}</p> : null}
      {failures.length ? (
        <ul className="max-h-40 overflow-auto border border-line bg-mist p-3 text-xs text-ink-soft">
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

      <div className="overflow-x-auto border border-line bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-3 py-3 w-10" />
              <th className="px-3 py-3">Opp / Score</th>
              <th className="px-3 py-3">Salon</th>
              <th className="hidden px-3 py-3 md:table-cell">Město</th>
              <th className="px-3 py-3">Google</th>
              <th className="hidden px-3 py-3 lg:table-cell">Recenze</th>
              <th className="px-3 py-3">Web</th>
              <th className="hidden px-3 py-3 xl:table-cell">Booking</th>
              <th className="px-3 py-3">Status</th>
              <th className="hidden px-3 py-3 lg:table-cell">Follow-up</th>
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
                  className="border-b border-line/70 hover:bg-mist/60"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      disabled={!canAnalyze || running}
                      onChange={() => toggle(lead.id)}
                      title={
                        canAnalyze
                          ? "Vybrat k analýze"
                          : "Není co analyzovat"
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="block min-w-[4.5rem]"
                    >
                      {score != null ? (
                        <div>
                          <p className="font-[family-name:var(--font-fraunces)] text-xl leading-none text-ink">
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
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium hover:underline"
                    >
                      {lead.salon_name || lead.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-soft md:hidden">
                      {lead.city || "—"}
                    </p>
                  </td>
                  <td className="hidden px-3 py-3 md:table-cell">
                    {lead.city || "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
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
                  <td className="hidden px-3 py-3 lg:table-cell">
                    {lead.google_reviews_count ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    {lead.has_website === false ? (
                      <span className="text-xs text-ink-soft">NO WEB</span>
                    ) : web != null ? (
                      <WebBandBadge band={webScoreBand(web)} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    {lead.has_online_booking
                      ? lead.booking_provider || "Ano"
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell whitespace-nowrap">
                    <span
                      className={
                        fu.tone === "danger"
                          ? "text-xs font-medium text-copper-deep"
                          : fu.tone === "warning"
                            ? "text-xs font-medium text-amber-800"
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

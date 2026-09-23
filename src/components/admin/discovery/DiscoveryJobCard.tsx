"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton, AdminCard } from "@/components/admin/ui";
import { businessTypeLabel } from "@/lib/discovery/business-types";
import type { LeadDiscoveryJob, LeadDiscoveryRun } from "@/lib/discovery/types";

type Props = {
  job: LeadDiscoveryJob;
  lastRun?: LeadDiscoveryRun | null;
};

const dtClass =
  "font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

export function DiscoveryJobCard({ job, lastRun }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/admin/discovery/jobs/${job.id}/run`, {
      method: "POST",
    });
    const data = (await response.json()) as {
      error?: string;
      found?: number;
      created?: number;
      duplicates?: number;
      review?: number;
      status?: string;
    };
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Spuštění selhalo.");
      return;
    }
    setMessage(
      `Nalezeno ${data.found ?? 0} · nové ${data.created ?? 0} · duplicity ${data.duplicates ?? 0} · review ${data.review ?? 0}`,
    );
    router.refresh();
  }

  async function toggleEnabled() {
    await fetch(`/api/admin/discovery/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !job.enabled }),
    });
    router.refresh();
  }

  const types = Array.isArray(job.business_types)
    ? job.business_types
    : [];

  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-ink">
            {job.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {[job.city, job.region].filter(Boolean).join(" · ") || "—"}
            {" · "}
            radius {job.radius_m} m · max {job.max_results} · {job.schedule}
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            {types.map((type) => (
              <span
                key={type}
                className="rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-medium tracking-tight text-ink-soft"
              >
                {businessTypeLabel(type)}
              </span>
            ))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            className="min-h-9 px-4 text-xs"
            onClick={toggleEnabled}
          >
            {job.enabled ? "Zapnuto" : "Vypnuto"}
          </AdminButton>
          <AdminButton
            type="button"
            disabled={loading}
            className="min-h-9 px-4 text-xs"
            onClick={run}
          >
            {loading ? "Skenuji…" : "Spustit teď"}
          </AdminButton>
        </div>
      </div>

      {lastRun ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className={dtClass}>Poslední scan</dt>
            <dd>
              {new Date(lastRun.started_at).toLocaleString("cs-CZ")}
            </dd>
          </div>
          <div>
            <dt className={dtClass}>Nalezeno</dt>
            <dd>{lastRun.found_count}</dd>
          </div>
          <div>
            <dt className={dtClass}>Nové leady</dt>
            <dd>{lastRun.new_leads_count}</dd>
          </div>
          <div>
            <dt className={dtClass}>Duplicity / review</dt>
            <dd>
              {lastRun.duplicate_count} / {lastRun.review_count}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">Ještě neběžel.</p>
      )}

      {message ? (
        <p className="mt-3 text-sm text-ink">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-copper-deep">{error}</p>
      ) : null}
    </AdminCard>
  );
}

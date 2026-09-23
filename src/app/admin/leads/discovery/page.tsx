import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DiscoveryJobCard } from "@/components/admin/discovery/DiscoveryJobCard";
import { DiscoveryJobForm } from "@/components/admin/discovery/DiscoveryJobForm";
import { DiscoveryReviewList } from "@/components/admin/discovery/DiscoveryReviewList";
import {
  AdminCard,
  AdminLinkButton,
  AdminPageHeader,
  AdminSection,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { countApiCallsToday, getDiscoverySettings } from "@/lib/discovery/budget";
import type {
  LeadDiscoveryJob,
  LeadDiscoveryRun,
} from "@/lib/discovery/types";

function MetricTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <AdminCard padding="sm">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </p>
      <p className="mt-3 text-[clamp(2rem,3.5vw,2.75rem)] font-semibold leading-none tracking-[-0.05em] text-ink">
        {value}
      </p>
    </AdminCard>
  );
}

export default async function DiscoveryPage() {
  const { supabase, user } = await requireAdmin();
  const settings = await getDiscoverySettings(supabase);
  const usedToday = await countApiCallsToday(supabase);

  const { data: jobsData } = await supabase
    .from("lead_discovery_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const jobs = (jobsData || []).map((job) => ({
    ...job,
    business_types: Array.isArray(job.business_types)
      ? job.business_types
      : [],
  })) as LeadDiscoveryJob[];

  const jobIds = jobs.map((j) => j.id);
  const { data: runsData } = jobIds.length
    ? await supabase
        .from("lead_discovery_runs")
        .select("*")
        .in("job_id", jobIds)
        .order("started_at", { ascending: false })
        .limit(50)
    : { data: [] as LeadDiscoveryRun[] };

  const runs = (runsData || []) as LeadDiscoveryRun[];
  const lastRunByJob = new Map<string, LeadDiscoveryRun>();
  for (const run of runs) {
    if (!lastRunByJob.has(run.job_id)) lastRunByJob.set(run.job_id, run);
  }

  const { data: reviews } = await supabase
    .from("lead_discovery_reviews")
    .select("id, match_reason, matched_lead_id, candidate")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <AdminShell email={user.email}>
      <AdminPageHeader
        eyebrow="CRM"
        title="Lead Discovery"
        description="Radar příležitostí — automaticky hledá salony, deduplikuje a skóruje obchodní opportunity."
        actions={
          <AdminLinkButton href="/admin/settings" variant="secondary">
            Nastavení discovery
          </AdminLinkButton>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricTile
          label="API dnes"
          value={`${usedToday} / ${settings.daily_api_limit}`}
        />
        <MetricTile
          label="Auto discovery"
          value={settings.automatic_discovery ? "ON" : "OFF"}
        />
        <MetricTile label="Needs review" value={reviews?.length ?? 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <AdminSection title="Discovery jobs" className="mt-0">
            {jobs.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Zatím žádný job — vytvoř první vyhledávání vpravo.
              </p>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <DiscoveryJobCard
                    key={job.id}
                    job={job}
                    lastRun={lastRunByJob.get(job.id)}
                  />
                ))}
              </div>
            )}
          </AdminSection>

          <AdminSection title="Review queue" className="mt-6">
            <DiscoveryReviewList reviews={(reviews || []) as never} />
          </AdminSection>
        </div>

        <DiscoveryJobForm />
      </div>
    </AdminShell>
  );
}

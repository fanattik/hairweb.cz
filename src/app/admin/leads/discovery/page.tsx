import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DiscoveryJobCard } from "@/components/admin/discovery/DiscoveryJobCard";
import { DiscoveryJobForm } from "@/components/admin/discovery/DiscoveryJobForm";
import { DiscoveryReviewList } from "@/components/admin/discovery/DiscoveryReviewList";
import { requireAdmin } from "@/lib/admin/auth";
import { countApiCallsToday, getDiscoverySettings } from "@/lib/discovery/budget";
import type {
  LeadDiscoveryJob,
  LeadDiscoveryRun,
} from "@/lib/discovery/types";

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Lead Discovery
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Radar příležitostí — automaticky hledá salony, deduplikuje a skóruje
            obchodní opportunity.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="border border-line px-3 py-2 text-sm hover:border-ink"
        >
          Nastavení discovery
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            API dnes
          </p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
            {usedToday} / {settings.daily_api_limit}
          </p>
        </div>
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Auto discovery
          </p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
            {settings.automatic_discovery ? "ON" : "OFF"}
          </p>
        </div>
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Needs review
          </p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
            {reviews?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Discovery jobs
          </h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Zatím žádný job — vytvoř první vyhledávání vpravo.
            </p>
          ) : (
            jobs.map((job) => (
              <DiscoveryJobCard
                key={job.id}
                job={job}
                lastRun={lastRunByJob.get(job.id)}
              />
            ))
          )}

          <section className="mt-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Review queue
            </h2>
            <DiscoveryReviewList reviews={(reviews || []) as never} />
          </section>
        </div>

        <DiscoveryJobForm />
      </div>
    </AdminShell>
  );
}

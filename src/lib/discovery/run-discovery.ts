import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertApiBudget,
  getDiscoverySettings,
  logApiUsage,
} from "@/lib/discovery/budget";
import { createLeadFromDiscoveredPlace } from "@/lib/discovery/create-lead";
import {
  discoveredToDuplicateCandidate,
  findPotentialDuplicate,
} from "@/lib/discovery/dedupe";
import { getDiscoveryProvider } from "@/lib/discovery/providers";
import type {
  DiscoveryProviderId,
  DiscoverySchedule,
  LeadDiscoveryJob,
} from "@/lib/discovery/types";

function nextRunAt(schedule: DiscoverySchedule, from = new Date()): Date | null {
  if (schedule === "manual") return null;
  const next = new Date(from);
  if (schedule === "daily") next.setDate(next.getDate() + 1);
  else if (schedule === "weekly") next.setDate(next.getDate() + 7);
  else if (schedule === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

function parseBusinessTypes(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(",").map((part) => part.trim()).filter(Boolean);
    }
  }
  return [];
}

export async function runDiscoveryJob(
  supabase: SupabaseClient,
  jobId: string,
  options?: { force?: boolean },
): Promise<{
  runId: string;
  status: string;
  found: number;
  created: number;
  duplicates: number;
  review: number;
  failed: number;
  error?: string;
}> {
  const settings = await getDiscoverySettings(supabase);
  if (!options?.force && !settings.automatic_discovery) {
    // Manual runs from UI always pass force=true
  }

  const { data: jobRow, error: jobError } = await supabase
    .from("lead_discovery_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !jobRow) {
    throw new Error(jobError?.message || "Discovery job not found");
  }

  const job = {
    ...jobRow,
    business_types: parseBusinessTypes(jobRow.business_types),
  } as LeadDiscoveryJob;

  if (!job.enabled && !options?.force) {
    throw new Error("Job je vypnutý.");
  }

  const provider = getDiscoveryProvider(job.provider as DiscoveryProviderId);
  if (provider.id === "google_places" && !settings.google_places_enabled) {
    throw new Error("Google Places discovery je vypnuté v nastavení.");
  }

  const budget = await assertApiBudget(supabase, 1);
  if (!budget.allowed) {
    const { data: limitedRun } = await supabase
      .from("lead_discovery_runs")
      .insert({
        job_id: job.id,
        status: "limit_reached",
        finished_at: new Date().toISOString(),
        error: `Denní API limit (${budget.limit}) dosažen (použito ${budget.used}).`,
        metadata: { used: budget.used, limit: budget.limit },
      })
      .select("id")
      .single();

    return {
      runId: limitedRun?.id || "",
      status: "limit_reached",
      found: 0,
      created: 0,
      duplicates: 0,
      review: 0,
      failed: 0,
      error: `Denní API limit (${budget.limit}) dosažen.`,
    };
  }

  const { data: run, error: runError } = await supabase
    .from("lead_discovery_runs")
    .insert({
      job_id: job.id,
      status: "running",
      metadata: {
        city: job.city,
        region: job.region,
        radius_m: job.radius_m,
        business_types: job.business_types,
        max_results: job.max_results,
      },
    })
    .select("*")
    .single();

  if (runError || !run) throw new Error(runError?.message || "Nelze vytvořit run");

  let found = 0;
  let created = 0;
  let duplicates = 0;
  let review = 0;
  let failed = 0;
  let apiCalls = 0;

  try {
    const maxResults = Math.min(
      job.max_results,
      settings.default_max_results,
      60,
    );

    const searchResult = await provider.search({
      city: job.city,
      region: job.region,
      locationQuery: job.location_query || job.city,
      latitude: job.latitude,
      longitude: job.longitude,
      radiusMeters: job.radius_m || settings.default_radius_m,
      businessTypes: job.business_types,
      maxResults,
    });

    apiCalls = searchResult.apiCalls;
    found = searchResult.places.length;

    await logApiUsage(supabase, {
      provider: provider.id,
      operation: "search",
      units: apiCalls,
      jobId: job.id,
      runId: run.id,
      meta: { found },
    });

    // Mid-run budget check after search
    const after = await assertApiBudget(supabase, 0);
    if (!after.allowed && found === 0) {
      throw new Error("API limit dosažen během běhu.");
    }

    for (const place of searchResult.places) {
      try {
        const dup = await findPotentialDuplicate(
          supabase,
          discoveredToDuplicateCandidate(place),
        );

        if (dup.kind === "exact_match") {
          duplicates += 1;
          continue;
        }

        if (dup.kind === "probable_match") {
          review += 1;
          await supabase.from("lead_discovery_reviews").insert({
            run_id: run.id,
            job_id: job.id,
            status: "pending",
            match_kind: "probable_match",
            matched_lead_id: dup.match?.leadId ?? null,
            match_reason: dup.reason,
            candidate: place,
          });
          continue;
        }

        await createLeadFromDiscoveredPlace(supabase, place, {
          jobId: job.id,
          runId: run.id,
          discoverySource: provider.id,
        });
        created += 1;
      } catch (err) {
        failed += 1;
        console.error("[discovery] place failed", err);
      }
    }

    const finishedAt = new Date().toISOString();
    await supabase
      .from("lead_discovery_runs")
      .update({
        status: "completed",
        finished_at: finishedAt,
        found_count: found,
        new_leads_count: created,
        duplicate_count: duplicates,
        review_count: review,
        failed_count: failed,
        api_calls: apiCalls,
      })
      .eq("id", run.id);

    await supabase
      .from("lead_discovery_jobs")
      .update({
        last_run_at: finishedAt,
        next_run_at: nextRunAt(job.schedule)?.toISOString() ?? null,
      })
      .eq("id", job.id);

    return {
      runId: run.id,
      status: "completed",
      found,
      created,
      duplicates,
      review,
      failed,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery failed";
    await supabase
      .from("lead_discovery_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        found_count: found,
        new_leads_count: created,
        duplicate_count: duplicates,
        review_count: review,
        failed_count: failed,
        api_calls: apiCalls,
        error: message.slice(0, 1000),
      })
      .eq("id", run.id);

    return {
      runId: run.id,
      status: "failed",
      found,
      created,
      duplicates,
      review,
      failed,
      error: message,
    };
  }
}

/** Cron entry: run due enabled jobs when automatic_discovery is on. */
export async function runDueDiscoveryJobs(supabase: SupabaseClient) {
  const settings = await getDiscoverySettings(supabase);
  if (!settings.automatic_discovery) {
    return { skipped: true as const, reason: "automatic_discovery off", results: [] };
  }

  const now = new Date().toISOString();
  const { data: jobs, error } = await supabase
    .from("lead_discovery_jobs")
    .select("id")
    .eq("enabled", true)
    .neq("schedule", "manual")
    .or(`next_run_at.is.null,next_run_at.lte.${now}`);

  if (error) throw new Error(error.message);

  const results = [];
  for (const job of jobs || []) {
    results.push(await runDiscoveryJob(supabase, job.id, { force: true }));
  }

  return { skipped: false as const, results };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadDiscoverySettings } from "@/lib/discovery/types";

export async function getDiscoverySettings(
  supabase: SupabaseClient,
): Promise<LeadDiscoverySettings> {
  const { data, error } = await supabase
    .from("lead_discovery_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return {
      id: 1,
      automatic_discovery: false,
      default_radius_m: 15000,
      default_max_results: 20,
      daily_api_limit: 200,
      monthly_budget_limit: null,
      ai_enrichment_enabled: false,
      website_audit_enabled: false,
      google_places_enabled: true,
      updated_at: new Date().toISOString(),
    };
  }

  return data as LeadDiscoverySettings;
}

export async function countApiCallsToday(
  supabase: SupabaseClient,
  provider = "google_places",
): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("lead_discovery_api_log")
    .select("units")
    .eq("provider", provider)
    .eq("cache_hit", false)
    .gte("created_at", start.toISOString());

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, row) => sum + (row.units ?? 1), 0);
}

export async function assertApiBudget(
  supabase: SupabaseClient,
  neededUnits: number,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const settings = await getDiscoverySettings(supabase);
  const used = await countApiCallsToday(supabase);
  const limit = settings.daily_api_limit;
  return {
    allowed: used + neededUnits <= limit,
    used,
    limit,
  };
}

export async function logApiUsage(
  supabase: SupabaseClient,
  input: {
    provider: string;
    operation: string;
    units?: number;
    jobId?: string | null;
    runId?: string | null;
    cacheHit?: boolean;
    meta?: Record<string, unknown>;
  },
) {
  await supabase.from("lead_discovery_api_log").insert({
    provider: input.provider,
    operation: input.operation,
    units: input.units ?? 1,
    job_id: input.jobId ?? null,
    run_id: input.runId ?? null,
    cache_hit: input.cacheHit ?? false,
    meta: input.meta ?? {},
  });
}

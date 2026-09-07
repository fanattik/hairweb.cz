import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DISCOVERY_BUSINESS_TYPES } from "@/lib/discovery/business-types";
import { DISCOVERY_SCHEDULES } from "@/lib/discovery/types";

const businessTypeIds = DISCOVERY_BUSINESS_TYPES.map((t) => t.id);

const jobSchema = z.object({
  name: z.string().trim().min(2).max(120),
  enabled: z.boolean().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  location_query: z.string().trim().max(200).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  radius_m: z.number().int().min(500).max(50000).optional(),
  business_types: z.array(z.string()).min(1).max(10),
  max_results: z.number().int().min(1).max(60).optional(),
  provider: z.literal("google_places").optional(),
  schedule: z.enum(DISCOVERY_SCHEDULES).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("lead_discovery_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: data,
    businessTypes: DISCOVERY_BUSINESS_TYPES,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = jobSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const types = input.business_types.filter(
    (id) =>
      businessTypeIds.includes(id as (typeof businessTypeIds)[number]) ||
      id.length > 0,
  );

  const { data, error } = await supabase
    .from("lead_discovery_jobs")
    .insert({
      name: input.name,
      enabled: input.enabled ?? true,
      city: input.city ?? null,
      region: input.region ?? null,
      location_query: input.location_query ?? input.city ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      radius_m: input.radius_m ?? 15000,
      business_types: types,
      max_results: input.max_results ?? 20,
      provider: input.provider ?? "google_places",
      schedule: input.schedule ?? "manual",
      created_by: user.id,
      next_run_at:
        input.schedule && input.schedule !== "manual"
          ? new Date().toISOString()
          : null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}

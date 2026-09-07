import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDiscoverySettings } from "@/lib/discovery/budget";

const patchSchema = z.object({
  automatic_discovery: z.boolean().optional(),
  default_radius_m: z.number().int().min(500).max(50000).optional(),
  default_max_results: z.number().int().min(1).max(60).optional(),
  daily_api_limit: z.number().int().min(1).max(10000).optional(),
  monthly_budget_limit: z.number().int().min(0).nullable().optional(),
  ai_enrichment_enabled: z.boolean().optional(),
  website_audit_enabled: z.boolean().optional(),
  google_places_enabled: z.boolean().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getDiscoverySettings(supabase);
  return NextResponse.json({
    settings,
    env: {
      googlePlacesConfigured: Boolean(
        process.env.GOOGLE_PLACES_API_KEY?.trim(),
      ),
      // Never expose the key — only whether it is set server-side.
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lead_discovery_settings")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

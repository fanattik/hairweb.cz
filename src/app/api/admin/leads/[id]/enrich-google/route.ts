import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleEnrichPatch } from "@/lib/google-places/apply";
import { resolveGooglePlace } from "@/lib/google-places/client";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  placeId: z.string().trim().min(1).optional(),
  mapsUrl: z.string().trim().min(1).optional(),
  query: z.string().trim().min(1).optional(),
  overwrite: z.boolean().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Chybí GOOGLE_PLACES_API_KEY. Přidej ho do .env.local / Vercel env.",
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: existing, error: loadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lead = existing as Lead;

  await supabase
    .from("leads")
    .update({ enrichment_status: "running", enrichment_error: null })
    .eq("id", id);

  try {
    const { place, candidates } = await resolveGooglePlace({
      placeId: parsed.data.placeId || lead.google_place_id,
      mapsUrl: parsed.data.mapsUrl || lead.google_maps_url,
      query: parsed.data.query,
      salonName: lead.salon_name,
      city: lead.city,
    });

    // Multiple matches and no explicit place chosen → ask admin to pick.
    if (!parsed.data.placeId && !lead.google_place_id && candidates.length > 1) {
      await supabase
        .from("leads")
        .update({ enrichment_status: "idle", enrichment_error: null })
        .eq("id", id);

      return NextResponse.json({
        ok: false,
        needsSelection: true,
        candidates,
      });
    }

    const enrichPatch = buildGoogleEnrichPatch(lead, place, {
      overwrite: parsed.data.overwrite,
    });

    const merged = { ...lead, ...enrichPatch } as Lead;
    const scores = scoredColumnsFromInput(leadToScoreInput(merged), {
      enrichmentSource: "google_places",
    });

    const { error: updateError } = await supabase
      .from("leads")
      .update({ ...enrichPatch, ...scores })
      .eq("id", id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      ok: true,
      place,
      candidates,
      patch: enrichPatch,
      scores,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google Places enrichment failed";
    console.error("[admin] enrich-google apply", error);
    await supabase
      .from("leads")
      .update({
        enrichment_status: "error",
        enrichment_error: message.slice(0, 1000),
      })
      .eq("id", id);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

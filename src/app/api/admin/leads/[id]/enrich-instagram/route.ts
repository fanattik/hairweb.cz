import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildInstagramEnrichPatch } from "@/lib/instagram/apply";
import {
  isInstagramGraphConfigured,
  resolveInstagramProfile,
} from "@/lib/instagram/client";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  handle: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  overwrite: z.boolean().optional(),
  requireGraph: z.boolean().optional(),
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
    const profile = await resolveInstagramProfile({
      handle: parsed.data.handle || lead.instagram_handle,
      url: parsed.data.url || lead.instagram_url,
      requireGraph: parsed.data.requireGraph ?? true,
    });

    const enrichPatch = buildInstagramEnrichPatch(lead, profile, {
      overwrite: parsed.data.overwrite,
    });

    const merged = { ...lead, ...enrichPatch } as Lead;
    const scores = scoredColumnsFromInput(leadToScoreInput(merged), {
      enrichmentSource: "instagram",
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
      profile,
      patch: enrichPatch,
      scores,
      graphConfigured: isInstagramGraphConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Instagram enrichment failed";
    console.error("[admin] enrich-instagram apply", error);
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

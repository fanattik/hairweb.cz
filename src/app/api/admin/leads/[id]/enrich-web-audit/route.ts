import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  buildWebAuditEnrichPatch,
  summarizeLighthouse,
} from "@/lib/web-audit/apply";
import { runWebAudit } from "@/lib/web-audit/run-audit";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  website: z.string().trim().min(1).optional(),
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
  const website = parsed.data.website || lead.website;

  await supabase
    .from("leads")
    .update({ enrichment_status: "running", enrichment_error: null })
    .eq("id", id);

  try {
    const audit = await runWebAudit(website);
    const enrichPatch = buildWebAuditEnrichPatch(lead, audit.scores, {
      overwrite: parsed.data.overwrite,
    });

    const merged = { ...lead, ...enrichPatch } as Lead;
    const scores = scoredColumnsFromInput(leadToScoreInput(merged), {
      enrichmentSource: "ai_audit",
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
      url: audit.url,
      finalUrl: audit.finalUrl,
      auditScores: audit.scores,
      lighthouse: summarizeLighthouse(audit.lighthouse),
      aiSource: audit.aiSource,
      aiConfigured: audit.aiConfigured,
      warnings: audit.warnings,
      patch: enrichPatch,
      scores,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Web audit enrichment failed";
    console.error("[admin] enrich-web-audit apply", error);
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

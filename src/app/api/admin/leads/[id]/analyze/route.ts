import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { planLeadAnalysis, runLeadAnalysis } from "@/lib/leads/analyze";
import { recalculateOpportunityForLead } from "@/lib/discovery/create-lead";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  overwrite: z.boolean().optional(),
  placeId: z.string().trim().min(1).optional(),
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
  const plan = planLeadAnalysis(lead);

  if (!plan.google && !plan.instagram && !plan.web) {
    return NextResponse.json(
      {
        error:
          "Není co analyzovat. Vyplň Maps URL / název+město, Instagram, nebo web.",
      },
      { status: 400 },
    );
  }

  await supabase
    .from("leads")
    .update({ enrichment_status: "running", enrichment_error: null })
    .eq("id", id);

  try {
    const result = await runLeadAnalysis(lead, {
      overwrite: parsed.data.overwrite,
      placeId: parsed.data.placeId,
    });

    if (result.needsSelection) {
      await supabase
        .from("leads")
        .update({ enrichment_status: "idle", enrichment_error: null })
        .eq("id", id);

      return NextResponse.json({
        ok: false,
        needsSelection: true,
        candidates: result.candidates,
        plan: result.plan,
      });
    }

    if (Object.keys(result.patch).length === 0) {
      throw new Error("Analýza nic nevrátila.");
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update(result.patch)
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    let opportunityScore: number | null = null;
    try {
      const opportunity = await recalculateOpportunityForLead(supabase, id);
      opportunityScore = opportunity.opportunityScore;
    } catch {
      // optional
    }

    return NextResponse.json({
      ok: true,
      plan: result.plan,
      steps: result.steps,
      scores: result.scores,
      webAudit: result.webAudit,
      opportunityScore,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analyze failed";
    console.error("[admin] analyze", error);
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

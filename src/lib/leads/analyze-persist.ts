import type { SupabaseClient } from "@supabase/supabase-js";
import { recalculateOpportunityForLead } from "@/lib/discovery/create-lead";
import { planLeadAnalysis, runLeadAnalysis } from "@/lib/leads/analyze";
import type { Lead } from "@/lib/leads/types";

export type BulkAnalyzeItemResult = {
  id: string;
  name: string;
  status: "ok" | "skipped" | "needs_selection" | "failed";
  error?: string;
  leadScore?: number | null;
  opportunityScore?: number | null;
};

/**
 * Run analyze + persist for one lead (shared by single + bulk endpoints).
 */
export async function analyzeAndPersistLead(
  supabase: SupabaseClient,
  lead: Lead,
  options?: { overwrite?: boolean },
): Promise<BulkAnalyzeItemResult> {
  const name = lead.salon_name || lead.name;
  const plan = planLeadAnalysis(lead);

  if (!plan.google && !plan.instagram && !plan.web) {
    return {
      id: lead.id,
      name,
      status: "skipped",
      error: "Není co analyzovat (chybí Maps / IG / web).",
    };
  }

  await supabase
    .from("leads")
    .update({ enrichment_status: "running", enrichment_error: null })
    .eq("id", lead.id);

  try {
    const result = await runLeadAnalysis(lead, {
      overwrite: options?.overwrite === true,
    });

    if (result.needsSelection) {
      await supabase
        .from("leads")
        .update({ enrichment_status: "idle", enrichment_error: null })
        .eq("id", lead.id);

      return {
        id: lead.id,
        name,
        status: "needs_selection",
        error: "Vyžaduje ruční výběr Google Places.",
      };
    }

    if (Object.keys(result.patch).length === 0) {
      throw new Error("Analýza nic nevrátila.");
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update(result.patch)
      .eq("id", lead.id);

    if (updateError) throw new Error(updateError.message);

    let opportunityScore: number | null = null;
    try {
      const opportunity = await recalculateOpportunityForLead(
        supabase,
        lead.id,
      );
      opportunityScore = opportunity.opportunityScore;
    } catch {
      // Opportunity rescore is best-effort after analyze.
    }

    return {
      id: lead.id,
      name,
      status: "ok",
      leadScore: result.scores?.lead_score ?? null,
      opportunityScore,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analyze failed";

    await supabase
      .from("leads")
      .update({
        enrichment_status: "error",
        enrichment_error: message.slice(0, 1000),
      })
      .eq("id", lead.id);

    return {
      id: lead.id,
      name,
      status: "failed",
      error: message,
    };
  }
}

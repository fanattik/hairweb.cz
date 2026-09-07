import { buildGoogleEnrichPatch } from "@/lib/google-places/apply";
import { resolveGooglePlace } from "@/lib/google-places/client";
import { buildInstagramEnrichPatch } from "@/lib/instagram/apply";
import {
  isInstagramGraphConfigured,
  resolveInstagramProfile,
} from "@/lib/instagram/client";
import { geocodeSalonLocation } from "@/lib/geo/geocode";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import {
  planLeadAnalysis,
  type AnalyzePlan,
} from "@/lib/leads/analyze-plan";
import type { Lead } from "@/lib/leads/types";
import {
  buildWebAuditEnrichPatch,
  summarizeLighthouse,
  type MergedWebAuditScores,
} from "@/lib/web-audit/apply";
import { runWebAudit } from "@/lib/web-audit/run-audit";

export type { AnalyzePlan };
export { planLeadAnalysis };

type AnalyzeOptions = {
  overwrite?: boolean;
  placeId?: string;
};

export type AnalyzeStepResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  detail?: string;
};

export async function runLeadAnalysis(
  lead: Lead,
  options?: AnalyzeOptions,
): Promise<{
  plan: AnalyzePlan;
  lead: Lead;
  patch: Record<string, unknown>;
  scores: ReturnType<typeof scoredColumnsFromInput> | null;
  steps: {
    google: AnalyzeStepResult;
    instagram: AnalyzeStepResult;
    web: AnalyzeStepResult;
    geo: AnalyzeStepResult;
  };
  needsSelection?: boolean;
  candidates?: Awaited<ReturnType<typeof resolveGooglePlace>>["candidates"];
  webAudit?: {
    scores: MergedWebAuditScores;
    lighthouse: ReturnType<typeof summarizeLighthouse>;
    aiSource: "ai" | "heuristic";
    warnings: string[];
    finalUrl: string;
  };
}> {
  const plan = planLeadAnalysis(lead);
  const overwrite = options?.overwrite === true;
  let working = { ...lead } as Lead;
  const patch: Record<string, unknown> = {};
  const steps = {
    google: { ok: true, skipped: !plan.google } as AnalyzeStepResult,
    instagram: { ok: true, skipped: !plan.instagram } as AnalyzeStepResult,
    web: { ok: true, skipped: !plan.web } as AnalyzeStepResult,
    geo: { ok: true, skipped: true } as AnalyzeStepResult,
  };

  let webAudit:
    | {
        scores: MergedWebAuditScores;
        lighthouse: ReturnType<typeof summarizeLighthouse>;
        aiSource: "ai" | "heuristic";
        warnings: string[];
        finalUrl: string;
      }
    | undefined;

  if (plan.google) {
    try {
      if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
        throw new Error("Chybí GOOGLE_PLACES_API_KEY.");
      }

      const { place, candidates } = await resolveGooglePlace({
        placeId: options?.placeId || lead.google_place_id,
        mapsUrl: lead.google_maps_url,
        salonName: lead.salon_name,
        city: lead.city,
      });

      if (
        !options?.placeId &&
        !lead.google_place_id &&
        !lead.google_maps_url &&
        candidates.length > 1
      ) {
        return {
          plan,
          lead: working,
          patch,
          scores: null,
          steps: {
            ...steps,
            google: { ok: false, error: "Vyber správný salon ze seznamu." },
          },
          needsSelection: true,
          candidates,
        };
      }

      const googlePatch = buildGoogleEnrichPatch(working, place, { overwrite });
      Object.assign(patch, googlePatch);
      working = { ...working, ...googlePatch } as Lead;
      steps.google = {
        ok: true,
        detail: place.name || place.placeId,
      };
    } catch (error) {
      steps.google = {
        ok: false,
        error:
          error instanceof Error ? error.message : "Google enrichment failed",
      };
    }
  }

  if (plan.instagram) {
    try {
      if (!isInstagramGraphConfigured()) {
        throw new Error(
          "Chybí META_GRAPH_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID.",
        );
      }

      const profile = await resolveInstagramProfile({
        handle: working.instagram_handle,
        url: working.instagram_url,
        requireGraph: true,
      });
      const igPatch = buildInstagramEnrichPatch(working, profile, { overwrite });
      Object.assign(patch, igPatch);
      working = { ...working, ...igPatch } as Lead;
      steps.instagram = {
        ok: true,
        detail: `@${profile.handle}`,
      };
    } catch (error) {
      steps.instagram = {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Instagram enrichment failed",
      };
    }
  }

  if (plan.web) {
    try {
      const audit = await runWebAudit(working.website);
      const webPatch = buildWebAuditEnrichPatch(working, audit.scores, {
        overwrite,
        lighthouse: audit.lighthouse,
      });
      Object.assign(patch, webPatch);
      working = { ...working, ...webPatch } as Lead;
      webAudit = {
        scores: audit.scores,
        lighthouse: summarizeLighthouse(audit.lighthouse),
        aiSource: audit.aiSource,
        warnings: audit.warnings,
        finalUrl: audit.finalUrl,
      };
      steps.web = {
        ok: true,
        detail:
          audit.lighthouse.performance != null
            ? `PSI ${audit.lighthouse.performance}`
            : audit.aiSource,
      };
    } catch (error) {
      steps.web = {
        ok: false,
        error: error instanceof Error ? error.message : "Web audit failed",
      };
    }
  }

  if (
    (working.latitude == null || working.longitude == null) &&
    (working.city || working.salon_name)
  ) {
    const geo = await geocodeSalonLocation({
      city: working.city,
      region: working.region,
      salonName: working.salon_name,
    });
    if (geo) {
      patch.latitude = geo.latitude;
      patch.longitude = geo.longitude;
      working = { ...working, ...geo };
      steps.geo = { ok: true, skipped: false, detail: "Nominatim" };
    } else {
      steps.geo = {
        ok: false,
        skipped: false,
        error: "Geocode se nepovedl",
      };
    }
  }

  const anyOk =
    (plan.google && steps.google.ok) ||
    (plan.instagram && steps.instagram.ok) ||
    (plan.web && steps.web.ok) ||
    Boolean(patch.latitude);

  const scores = anyOk
    ? scoredColumnsFromInput(leadToScoreInput(working), {
        enrichmentSource: "analyze",
      })
    : null;

  if (scores) Object.assign(patch, scores);

  const failed = [steps.google, steps.instagram, steps.web].filter(
    (step) => !step.skipped && !step.ok,
  );
  if (failed.length && !anyOk) {
    patch.enrichment_status = "error";
    patch.enrichment_error = failed.map((step) => step.error).join(" · ");
  } else if (Object.keys(patch).length) {
    patch.enrichment_status = "done";
    patch.enrichment_error = failed.length
      ? failed.map((step) => step.error).join(" · ")
      : null;
    patch.last_enriched_at = new Date().toISOString();
  }

  return {
    plan,
    lead: working,
    patch,
    scores,
    steps,
    webAudit,
  };
}

import type { WebAiAuditResult } from "@/lib/web-audit/ai-audit";
import type { LighthouseSnapshot } from "@/lib/web-audit/pagespeed";
import type { Lead } from "@/lib/leads/types";

export type WebAuditEnrichPatch = {
  has_website: boolean;
  website_design_score: number;
  website_mobile_score: number;
  website_cta_score: number;
  website_content_score: number;
  website_trust_score: number;
  website_seo_score: number;
  website_performance_score: number;
  website_outdated: boolean;
  website_mobile_problem: boolean;
  website_clear_booking_cta: boolean;
  website_has_prices: boolean;
  website_has_gallery: boolean;
  website_has_team: boolean;
  website_has_reviews: boolean;
  website_audit: string;
  opportunity_note: string;
  has_online_booking?: boolean | null;
  enrichment_source: "ai_audit";
  enrichment_status: "done";
  enrichment_error: null;
  last_enriched_at: string;
};

export type MergedWebAuditScores = WebAiAuditResult & {
  website_performance_score: number;
};

/**
 * Merge AI + Lighthouse into lead website qualification fields.
 * Score fields always update from audit. Booking flag: fill when empty or overwrite.
 */
export function buildWebAuditEnrichPatch(
  lead: Pick<Lead, "has_online_booking" | "opportunity_note">,
  audit: MergedWebAuditScores,
  options?: { overwrite?: boolean },
): WebAuditEnrichPatch {
  const overwrite = options?.overwrite === true;

  const opportunity =
    overwrite || !lead.opportunity_note?.trim()
      ? audit.opportunity_note
      : `${lead.opportunity_note.trim()}\n\n[Web audit] ${audit.opportunity_note}`;

  const patch: WebAuditEnrichPatch = {
    has_website: true,
    website_design_score: audit.website_design_score,
    website_mobile_score: audit.website_mobile_score,
    website_cta_score: audit.website_cta_score,
    website_content_score: audit.website_content_score,
    website_trust_score: audit.website_trust_score,
    website_seo_score: audit.website_seo_score,
    website_performance_score: audit.website_performance_score,
    website_outdated: audit.website_outdated,
    website_mobile_problem: audit.website_mobile_problem,
    website_clear_booking_cta: audit.website_clear_booking_cta,
    website_has_prices: audit.website_has_prices,
    website_has_gallery: audit.website_has_gallery,
    website_has_team: audit.website_has_team,
    website_has_reviews: audit.website_has_reviews,
    website_audit: audit.website_audit,
    opportunity_note: opportunity,
    enrichment_source: "ai_audit",
    enrichment_status: "done",
    enrichment_error: null,
    last_enriched_at: new Date().toISOString(),
  };

  if (overwrite || lead.has_online_booking == null) {
    patch.has_online_booking = audit.website_clear_booking_cta;
  }

  return patch;
}

export function summarizeLighthouse(lh: LighthouseSnapshot) {
  return {
    performance: lh.performance,
    seo: lh.seo,
    accessibility: lh.accessibility,
    bestPractices: lh.bestPractices,
    lcpMs: lh.lcpMs,
    cls: lh.cls,
    tbtMs: lh.tbtMs,
    error: lh.error,
  };
}

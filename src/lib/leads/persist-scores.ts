import {
  calculateLeadScores,
  hasQualificationSignals,
  type LeadScoreInput,
} from "@/lib/leads/scoring";
import type {
  BusinessSize,
  InstagramQuality,
  Lead,
} from "@/lib/leads/types";

export function leadToScoreInput(
  lead: Partial<Lead> | LeadScoreInput,
): LeadScoreInput {
  return {
    email: lead.email,
    phone: lead.phone,
    contact_person: lead.contact_person,
    google_rating: lead.google_rating,
    google_reviews_count: lead.google_reviews_count,
    instagram_url: lead.instagram_url,
    instagram_handle: lead.instagram_handle,
    instagram_active: lead.instagram_active,
    instagram_quality: lead.instagram_quality as InstagramQuality | null | undefined,
    premium_impression: lead.premium_impression,
    has_online_booking: lead.has_online_booking,
    paid_marketing: lead.paid_marketing,
    professional_branding: lead.professional_branding,
    professional_photos: lead.professional_photos,
    business_size: lead.business_size as BusinessSize | null | undefined,
    has_website: lead.has_website,
    website_design_score: lead.website_design_score,
    website_mobile_score: lead.website_mobile_score,
    website_cta_score: lead.website_cta_score,
    website_content_score: lead.website_content_score,
    website_trust_score: lead.website_trust_score,
    website_seo_score: lead.website_seo_score,
    website_performance_score: lead.website_performance_score,
    website_mobile_problem: lead.website_mobile_problem,
    website_clear_booking_cta: lead.website_clear_booking_cta,
    website_has_prices: lead.website_has_prices,
    website_has_gallery: lead.website_has_gallery,
  };
}

/** Server-side score columns to persist. */
export function scoredColumnsFromInput(input: LeadScoreInput) {
  if (!hasQualificationSignals(input)) {
    return {
      business_score: null as number | null,
      web_score: null as number | null,
      web_opportunity_score: null as number | null,
      purchase_intent_score: null as number | null,
      contactability_score: null as number | null,
      lead_score: null as number | null,
      score: null as number | null,
    };
  }

  const scores = calculateLeadScores(input);
  return {
    business_score: scores.businessScore,
    web_score: scores.webScore,
    web_opportunity_score: scores.webOpportunityScore,
    purchase_intent_score: scores.purchaseIntentScore,
    contactability_score: scores.contactabilityScore,
    lead_score: scores.leadScore,
    score: scores.leadScore,
    last_enriched_at: new Date().toISOString(),
    enrichment_source: "manual" as const,
  };
}

export function emptyToNull(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function optionalInt(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export function optionalFloat(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function optionalBool(value: unknown): boolean | null {
  if (value === true || value === "true" || value === "1" || value === "on") {
    return true;
  }
  if (value === false || value === "false" || value === "0") return false;
  if (value === "" || value == null) return null;
  return null;
}

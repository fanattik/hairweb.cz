import type {
  BusinessSize,
  InstagramQuality,
  LeadOpportunity,
  LeadPriority,
  LeadScores,
  WebScoreBand,
} from "@/lib/leads/types";

export type LeadScoreInput = {
  email?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  instagram_url?: string | null;
  instagram_handle?: string | null;
  instagram_active?: boolean | null;
  instagram_quality?: InstagramQuality | null;
  premium_impression?: boolean | null;
  has_online_booking?: boolean | null;
  paid_marketing?: boolean | null;
  professional_branding?: boolean | null;
  professional_photos?: boolean | null;
  business_size?: BusinessSize | null;
  has_website?: boolean | null;
  website_design_score?: number | null;
  website_mobile_score?: number | null;
  website_cta_score?: number | null;
  website_content_score?: number | null;
  website_trust_score?: number | null;
  website_seo_score?: number | null;
  website_performance_score?: number | null;
  website_mobile_problem?: boolean | null;
  website_clear_booking_cta?: boolean | null;
  website_has_prices?: boolean | null;
  website_has_gallery?: boolean | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function scoreGoogleRating(rating: number | null | undefined): number {
  if (rating == null || Number.isNaN(rating)) return 0;
  if (rating >= 4.8) return 10;
  if (rating >= 4.6) return 7;
  if (rating >= 4.4) return 4;
  return 0;
}

export function scoreGoogleReviews(count: number | null | undefined): number {
  if (count == null || count < 0) return 0;
  if (count >= 200) return 10;
  if (count >= 100) return 8;
  if (count >= 50) return 6;
  if (count >= 20) return 3;
  return 0;
}

export function scoreInstagramBusiness(
  active: boolean | null | undefined,
  quality: InstagramQuality | null | undefined,
): number {
  if (!active) return 0;
  if (quality === "excellent") return 5;
  if (quality === "good") return 4;
  if (quality === "average") return 2;
  return 0;
}

export function computeBusinessScore(input: LeadScoreInput): number {
  const total =
    scoreGoogleRating(input.google_rating) +
    scoreGoogleReviews(input.google_reviews_count) +
    scoreInstagramBusiness(input.instagram_active, input.instagram_quality) +
    (input.premium_impression ? 5 : 0);
  return clamp(total, 0, 30);
}

export function computeWebScore(input: LeadScoreInput): number {
  if (input.has_website === false) return 0;

  const total =
    (input.website_design_score ?? 0) +
    (input.website_mobile_score ?? 0) +
    (input.website_cta_score ?? 0) +
    (input.website_content_score ?? 0) +
    (input.website_trust_score ?? 0) +
    (input.website_seo_score ?? 0) +
    (input.website_performance_score ?? 0);

  return clamp(total, 0, 100);
}

export function computeWebOpportunityScore(input: LeadScoreInput): number {
  let base: number;

  if (input.has_website === false) {
    base = 35;
  } else {
    const webScore = computeWebScore(input);
    if (webScore <= 25) base = 30;
    else if (webScore <= 45) base = 25;
    else if (webScore <= 65) base = 18;
    else if (webScore <= 80) base = 8;
    else base = 2;
  }

  let bonus = 0;
  if (input.website_mobile_problem) bonus += 5;
  if (input.website_clear_booking_cta === false) bonus += 5;
  if (input.website_has_prices === false) bonus += 3;
  if (input.website_has_gallery === false) bonus += 2;

  return Math.min(40, base + bonus);
}

export function computePurchaseIntentScore(input: LeadScoreInput): number {
  let total = 0;
  if (input.has_online_booking) total += 5;
  if (
    input.instagram_active &&
    (input.instagram_quality === "good" ||
      input.instagram_quality === "excellent")
  ) {
    total += 5;
  }
  if (input.paid_marketing) total += 5;
  if (input.professional_branding) total += 2;
  if (input.professional_photos) total += 1;
  if (input.business_size === "medium" || input.business_size === "large") {
    total += 2;
  }
  return clamp(total, 0, 20);
}

export function computeContactabilityScore(input: LeadScoreInput): number {
  let total = 0;
  if (hasText(input.email)) total += 3;
  if (hasText(input.phone)) total += 2;
  if (hasText(input.instagram_url) || hasText(input.instagram_handle)) {
    total += 2;
  }
  if (hasText(input.contact_person)) total += 3;
  return clamp(total, 0, 10);
}

export function leadPriorityFromScore(leadScore: number): LeadPriority {
  if (leadScore >= 80) return "hot";
  if (leadScore >= 65) return "good";
  if (leadScore >= 50) return "warm";
  return "low";
}

/** Import grade bands (A–D) derived from Lead Score. */
export function leadGradeFromScore(leadScore: number): "A" | "B" | "C" | "D" {
  if (leadScore >= 75) return "A";
  if (leadScore >= 50) return "B";
  if (leadScore >= 25) return "C";
  return "D";
}

export function leadOpportunityFromScore(leadScore: number): LeadOpportunity {
  if (leadScore >= 80) return "very_high";
  if (leadScore >= 65) return "high";
  if (leadScore >= 50) return "medium";
  return "low";
}

export function webScoreBand(webScore: number): WebScoreBand {
  if (webScore <= 39) return "poor";
  if (webScore <= 59) return "weak";
  if (webScore <= 79) return "good";
  return "strong";
}

export function recommendedActionFromPriority(priority: LeadPriority): string {
  switch (priority) {
    case "hot":
      return "Vytvořit personalizovaný mini redesign a individuálně oslovit.";
    case "good":
      return "Poslat personalizované oslovení.";
    case "warm":
      return "Standardní outreach.";
    case "low":
      return "Nízká priorita – zatím neoslovovat.";
  }
}

/**
 * Central Hairweb Lead Score calculator.
 * Always clamp component scores; never trust client-provided totals.
 */
export function calculateLeadScores(input: LeadScoreInput): LeadScores {
  const businessScore = computeBusinessScore(input);
  const webScore = computeWebScore(input);
  const webOpportunityScore = computeWebOpportunityScore(input);
  const purchaseIntentScore = computePurchaseIntentScore(input);
  const contactabilityScore = computeContactabilityScore(input);
  const leadScore = clamp(
    businessScore +
      webOpportunityScore +
      purchaseIntentScore +
      contactabilityScore,
    0,
    100,
  );
  const priority = leadPriorityFromScore(leadScore);
  const opportunity = leadOpportunityFromScore(leadScore);

  return {
    businessScore,
    webScore,
    webOpportunityScore,
    purchaseIntentScore,
    contactabilityScore,
    leadScore,
    priority,
    opportunity,
    recommendedAction: recommendedActionFromPriority(priority),
    webScoreBand: webScoreBand(webScore),
  };
}

/** True when the lead has any qualification signals beyond basic contact. */
export function hasQualificationSignals(input: LeadScoreInput): boolean {
  return (
    input.google_rating != null ||
    input.google_reviews_count != null ||
    input.instagram_active != null ||
    hasText(input.instagram_url) ||
    hasText(input.instagram_handle) ||
    input.instagram_quality != null ||
    input.premium_impression != null ||
    input.has_online_booking != null ||
    input.paid_marketing != null ||
    input.professional_branding != null ||
    input.professional_photos != null ||
    (input.business_size != null && input.business_size !== "unknown") ||
    input.has_website != null ||
    input.website_design_score != null ||
    input.website_mobile_score != null ||
    input.website_cta_score != null ||
    input.website_content_score != null ||
    input.website_trust_score != null ||
    input.website_seo_score != null ||
    input.website_performance_score != null ||
    input.website_mobile_problem != null ||
    input.website_clear_booking_cta != null ||
    input.website_has_prices != null ||
    input.website_has_gallery != null
  );
}

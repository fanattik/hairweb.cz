export const LEAD_TYPES = ["inbound", "outbound"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_PACKAGES = ["start", "pro"] as const;
export type LeadPackage = (typeof LEAD_PACKAGES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "meeting",
  "proposal",
  "won",
  "lost",
  "skip",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCE_DETAILS = [
  "hero",
  "portfolio",
  "pricing_start",
  "pricing_pro",
  "reservation",
  "final_cta",
  "mobile_sticky",
  "header",
] as const;
export type LeadSourceDetail = (typeof LEAD_SOURCE_DETAILS)[number];

export const INSTAGRAM_QUALITIES = [
  "poor",
  "average",
  "good",
  "excellent",
] as const;
export type InstagramQuality = (typeof INSTAGRAM_QUALITIES)[number];

export const BUSINESS_SIZES = [
  "solo",
  "small",
  "medium",
  "large",
  "unknown",
] as const;
export type BusinessSize = (typeof BUSINESS_SIZES)[number];

export const LEAD_PRIORITIES = ["hot", "good", "warm", "low"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_OPPORTUNITIES = [
  "very_high",
  "high",
  "medium",
  "low",
] as const;
export type LeadOpportunity = (typeof LEAD_OPPORTUNITIES)[number];

export const WEB_SCORE_BANDS = ["poor", "weak", "good", "strong"] as const;
export type WebScoreBand = (typeof WEB_SCORE_BANDS)[number];

export type LeadUtm = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type LeadScores = {
  businessScore: number;
  webScore: number;
  webOpportunityScore: number;
  purchaseIntentScore: number;
  contactabilityScore: number;
  leadScore: number;
  priority: LeadPriority;
  opportunity: LeadOpportunity;
  recommendedAction: string;
  webScoreBand: WebScoreBand;
};

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  type: LeadType;
  name: string;
  salon_name: string | null;
  email: string | null;
  phone: string | null;
  website: string;
  message: string | null;
  package: LeadPackage | null;
  source: string | null;
  source_detail: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_page: string | null;
  status: LeadStatus;
  /** Legacy manual score — kept in sync with lead_score when auto-scored. */
  score: number | null;
  notes: string | null;
  last_contact_at: string | null;
  next_followup_at: string | null;
  /** Completed follow-ups in the sequence (0 = only initial contact). */
  followup_count: number;
  last_contact_type:
    | "email"
    | "phone"
    | "sms"
    | "whatsapp"
    | "instagram"
    | "other"
    | null;
  last_followup_at: string | null;
  followup_paused: boolean;
  followup_stopped: boolean;
  won_value: number | null;
  lost_reason: string | null;

  city: string | null;
  region: string | null;
  contact_person: string | null;

  google_rating: number | null;
  google_reviews_count: number | null;
  google_maps_url: string | null;
  google_place_id: string | null;

  instagram_url: string | null;
  instagram_handle: string | null;
  instagram_active: boolean | null;
  instagram_followers: number | null;
  instagram_quality: InstagramQuality | null;
  instagram_media_count: number | null;
  instagram_name: string | null;
  instagram_biography: string | null;
  instagram_suggested_quality: InstagramQuality | null;

  has_online_booking: boolean | null;
  booking_provider: string | null;
  booking_url: string | null;

  business_size: BusinessSize | null;
  premium_impression: boolean | null;
  professional_photos: boolean | null;
  professional_branding: boolean | null;
  paid_marketing: boolean | null;

  has_website: boolean | null;
  website_design_score: number | null;
  website_mobile_score: number | null;
  website_cta_score: number | null;
  website_content_score: number | null;
  website_trust_score: number | null;
  website_seo_score: number | null;
  website_performance_score: number | null;
  web_score: number | null;

  website_outdated: boolean | null;
  website_mobile_problem: boolean | null;
  website_clear_booking_cta: boolean | null;
  website_has_prices: boolean | null;
  website_has_gallery: boolean | null;
  website_has_team: boolean | null;
  website_has_reviews: boolean | null;

  website_audit: string | null;
  opportunity_note: string | null;

  facebook_url: string | null;
  address: string | null;
  postal_code: string | null;
  country: string | null;
  website_domain: string | null;
  phone_normalized: string | null;
  email_normalized: string | null;
  salon_name_normalized: string | null;
  raw_import_data: Record<string, string | null> | null;
  source_type: string | null;
  source_name: string | null;
  source_url: string | null;
  lead_grade: "A" | "B" | "C" | "D" | null;

  lighthouse_performance: number | null;
  lighthouse_accessibility: number | null;
  lighthouse_seo: number | null;
  lighthouse_best_practices: number | null;

  latitude: number | null;
  longitude: number | null;

  business_score: number | null;
  web_opportunity_score: number | null;
  purchase_intent_score: number | null;
  contactability_score: number | null;
  lead_score: number | null;

  enrichment_source: string | null;
  last_enriched_at: string | null;
  enrichment_status:
    | "idle"
    | "running"
    | "done"
    | "error"
    | "pending"
    | "processing"
    | "completed"
    | "partial"
    | "failed"
    | null;
  enrichment_error: string | null;

  discovery_status:
    | "discovered"
    | "enriching"
    | "ready"
    | "needs_review"
    | "rejected"
    | null;
  discovery_source: string | null;
  discovery_job_id: string | null;
  discovery_run_id: string | null;
  business_status: string | null;
  primary_type: string | null;
  google_types: string[] | null;
  opening_hours: unknown | null;
  cover_photo_url: string | null;
  opportunity_score: number | null;
  opportunity_grade: "A" | "B" | "C" | "D" | null;
  opportunity_summary: string | null;
  recommended_pitch: string | null;
  recommended_channel: string | null;
  suggested_service: string | null;
  opportunity_reasons: Array<{ label: string; points: number }> | null;
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nový",
  contacted: "Osloven",
  interested: "Zájem",
  meeting: "Schůzka",
  proposal: "Nabídka",
  won: "Vyhráno",
  lost: "Ztraceno",
  skip: "Neřešit",
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  hot: "HOT",
  good: "GOOD",
  warm: "WARM",
  low: "LOW",
};

export const OPPORTUNITY_LABELS: Record<LeadOpportunity, string> = {
  very_high: "VERY HIGH",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

export const WEB_BAND_LABELS: Record<WebScoreBand, string> = {
  poor: "POOR",
  weak: "WEAK",
  good: "GOOD",
  strong: "STRONG",
};

export const INSTAGRAM_QUALITY_LABELS: Record<InstagramQuality, string> = {
  poor: "Slabý",
  average: "Průměrný",
  good: "Dobrý",
  excellent: "Výborný",
};

export const BUSINESS_SIZE_LABELS: Record<BusinessSize, string> = {
  solo: "Solo (1)",
  small: "Malý (2–3)",
  medium: "Střední (4–8)",
  large: "Velký / pobočky",
  unknown: "Neznámé",
};

export const WEB_SCORE_MAX = {
  design: 20,
  mobile: 15,
  cta: 15,
  content: 15,
  trust: 10,
  seo: 15,
  performance: 10,
} as const;

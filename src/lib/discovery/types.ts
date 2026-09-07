/**
 * Lead Discovery Engine — shared types (Phase 1 + Phase 2 stubs).
 */

export const DISCOVERY_STATUSES = [
  "discovered",
  "enriching",
  "ready",
  "needs_review",
  "rejected",
] as const;
export type DiscoveryStatus = (typeof DISCOVERY_STATUSES)[number];

export const DISCOVERY_SCHEDULES = [
  "manual",
  "daily",
  "weekly",
  "monthly",
] as const;
export type DiscoverySchedule = (typeof DISCOVERY_SCHEDULES)[number];

export const DISCOVERY_RUN_STATUSES = [
  "running",
  "completed",
  "failed",
  "cancelled",
  "limit_reached",
] as const;
export type DiscoveryRunStatus = (typeof DISCOVERY_RUN_STATUSES)[number];

export const DISCOVERY_PROVIDERS = [
  "google_places",
  "firmy_cz",
  "instagram",
  "facebook",
  "mapy_cz",
] as const;
export type DiscoveryProviderId = (typeof DISCOVERY_PROVIDERS)[number];

export const OPPORTUNITY_GRADES = ["A", "B", "C", "D"] as const;
export type OpportunityGrade = (typeof OPPORTUNITY_GRADES)[number];

export const DUPLICATE_MATCH_KINDS = [
  "exact_match",
  "probable_match",
  "no_match",
] as const;
export type DuplicateMatchKind = (typeof DUPLICATE_MATCH_KINDS)[number];

export const OPPORTUNITY_SIGNAL_TYPES = [
  "NO_WEBSITE",
  "BROKEN_WEBSITE",
  "NO_HTTPS",
  "OLD_DESIGN",
  "NOT_MOBILE_FRIENDLY",
  "NO_BOOKING",
  "NO_INSTAGRAM_LINK",
  "NO_GOOGLE_MAPS",
  "BAD_SEO",
  "MISSING_META",
  "LOW_REVIEW_COUNT",
  "HIGH_RATING_BAD_WEBSITE",
  "STRONG_INSTAGRAM_WEAK_WEBSITE",
  "FACEBOOK_ONLY",
  "BOOKING_PLATFORM_ONLY",
  "NO_CUSTOM_DOMAIN",
] as const;
export type OpportunitySignalType = (typeof OPPORTUNITY_SIGNAL_TYPES)[number];

export type OpportunitySignal = {
  type: OpportunitySignalType | string;
  severity: "low" | "medium" | "high";
  score: number;
  message: string;
};

export type OpportunityScoreBreakdown = {
  label: string;
  points: number;
};

export type OpportunityScoreResult = {
  opportunityScore: number;
  opportunityGrade: OpportunityGrade;
  reasons: OpportunityScoreBreakdown[];
  signals: OpportunitySignal[];
  recommendedPitch: string;
  recommendedChannel: string;
  suggestedService: string;
  summary: string;
};

export type DiscoveredPlace = {
  provider: DiscoveryProviderId;
  externalId: string;
  googlePlaceId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
  businessStatus: string | null;
  primaryType: string | null;
  types: string[];
  openingHours: unknown | null;
  coverPhotoUrl: string | null;
  raw?: unknown;
};

export type DiscoverySearchInput = {
  city?: string | null;
  region?: string | null;
  locationQuery?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters: number;
  businessTypes: string[];
  maxResults: number;
};

export type LeadDiscoveryJob = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  enabled: boolean;
  city: string | null;
  region: string | null;
  location_query: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_m: number;
  business_types: string[];
  max_results: number;
  provider: DiscoveryProviderId;
  schedule: DiscoverySchedule;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
};

export type LeadDiscoveryRun = {
  id: string;
  job_id: string;
  started_at: string;
  finished_at: string | null;
  status: DiscoveryRunStatus;
  found_count: number;
  new_leads_count: number;
  duplicate_count: number;
  review_count: number;
  failed_count: number;
  api_calls: number;
  error: string | null;
  metadata: Record<string, unknown>;
};

export type LeadDiscoverySettings = {
  id: number;
  automatic_discovery: boolean;
  default_radius_m: number;
  default_max_results: number;
  daily_api_limit: number;
  monthly_budget_limit: number | null;
  ai_enrichment_enabled: boolean;
  website_audit_enabled: boolean;
  google_places_enabled: boolean;
  updated_at: string;
};

export const DISCOVERY_STATUS_LABELS: Record<DiscoveryStatus, string> = {
  discovered: "Nalezeno",
  enriching: "Obohacování",
  ready: "Připraveno",
  needs_review: "Ke kontrole",
  rejected: "Zamítnuto",
};

export const OPPORTUNITY_GRADE_LABELS: Record<OpportunityGrade, string> = {
  A: "A — Hot",
  B: "B — Silná",
  C: "C — Střední",
  D: "D — Slabá",
};

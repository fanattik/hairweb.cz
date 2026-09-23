/** Deterministic online-audit types. AI may summarize — never invent scores. */

export const AUDIT_CATEGORIES = [
  "web",
  "google",
  "directories",
  "ai",
  "reviews",
  "booking",
  "social",
  "customers",
  "marketing",
] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  web: "Web",
  google: "Google",
  directories: "Katalogy (Firmy, Mapy…)",
  ai: "Dohledatelnost pro AI",
  reviews: "Recenze",
  booking: "Rezervace",
  social: "Sociální sítě",
  customers: "Zákazníci",
  marketing: "Data & marketing",
};

/** Relative influence on overall HAIRWEB SCORE (normalized at compute time). */
export const AUDIT_CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  web: 16,
  google: 14,
  directories: 10,
  ai: 8,
  booking: 16,
  reviews: 13,
  social: 9,
  customers: 8,
  marketing: 6,
};

export type AuditCheckStatus = "pass" | "fail" | "partial" | "unknown";
export type AuditSeverity = "high" | "medium" | "low" | "none";

export type AuditCheck = {
  checkId: string;
  category: AuditCategory;
  status: AuditCheckStatus;
  /** Points earned (0 when unknown). */
  points: number;
  maxPoints: number;
  severity: AuditSeverity;
  title: string;
  description: string;
  recommendation: string | null;
  /** How we know — answers | places | website_fetch | future_api */
  source: string;
  value?: string | number | boolean | null;
  /** Ease of fix 1–5 (5 = easiest). Used for quick wins. */
  ease?: number;
  /** Business impact 1–5. */
  impact?: number;
};

export type AuditCategoryScore = {
  category: AuditCategory;
  label: string;
  score: number | null;
  earned: number;
  max: number;
  weight: number;
};

export type AuditRecommendation = {
  id: string;
  checkId: string;
  category: AuditCategory;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
  ease: number;
  impact: number;
};

export type AuditStrength = {
  id: string;
  checkId: string;
  category: AuditCategory;
  title: string;
  description: string;
};

export type AuditQuickWin = {
  rank: number;
  title: string;
  recommendation: string;
  category: AuditCategory;
  checkId: string;
};

export type BookingMethod =
  | "online"
  | "phone"
  | "instagram"
  | "whatsapp"
  | "email"
  | "in_person"
  | "other";

export type DirectoryPlatform =
  | "firmy_cz"
  | "mapy_cz"
  | "kdomestriha"
  | "zlate_stranky"
  | "other"
  | "none";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "other"
  | "none";

export type AuditAnswers = {
  salonName: string;
  city: string;
  address?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  googleRating?: number | null;
  googleReviewsCount?: number | null;
  suggestedWebsite?: string | null;

  hasWebsite: boolean | null;
  websiteUrl?: string;
  websiteBooking?: "yes" | "no" | "unknown";

  /** Czech local directories the salon claims to use. */
  directoryPlatforms: DirectoryPlatform[];

  bookingMethods: BookingMethod[];
  bookingProvider?: string;
  booking247?: "yes" | "no" | "unknown";

  socialPlatforms: SocialPlatform[];
  instagramHandle?: string;
  facebookUrl?: string;
  socialConfirmed?: boolean;

  remindVisits?: "yes" | "no" | "partial";
  reactivateCustomers?: "yes" | "no";
  paidAds?: "regular" | "occasional" | "no";
  knowSources?: "yes" | "approx" | "no";

  name: string;
  email: string;
  phone?: string;
  consent: boolean;
};

export type AuditScoresPayload = {
  overall: number;
  categories: AuditCategoryScore[];
  band: "strong" | "good" | "fair" | "weak";
  headline: string;
  /** Mobile PageSpeed Insights snapshot (null = not run / no website). */
  pagespeed?: AuditPagespeedSnapshot | null;
};

/** Stored on the audit result for the result-page UI. */
export type AuditPagespeedSnapshot = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  error: string | null;
  strategy: "mobile";
  /** URL actually sent to PageSpeed (may differ from Google listing). */
  measuredUrl?: string | null;
  /** True when we measured an ASCII/fallback host because the listed URL failed. */
  usedFallbackUrl?: boolean;
};

export type AuditResult = {
  overallScore: number;
  scores: AuditScoresPayload;
  checks: AuditCheck[];
  strengths: AuditStrength[];
  recommendations: AuditRecommendation[];
  quickWins: AuditQuickWin[];
  summary: string;
  relevantServices: Array<{
    slug: string;
    title: string;
    blurb: string;
  }>;
};

export type SalonAuditRow = {
  id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  status: "draft" | "analyzing" | "completed" | "error";
  lead_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  salon_name: string;
  city: string;
  address: string | null;
  google_place_id: string | null;
  answers: AuditAnswers;
  checks: AuditCheck[];
  scores: AuditScoresPayload;
  recommendations: AuditRecommendation[];
  strengths: AuditStrength[];
  quick_wins: AuditQuickWin[];
  summary: string | null;
  overall_score: number | null;
  score_web: number | null;
  score_google: number | null;
  score_directories: number | null;
  score_ai: number | null;
  score_reviews: number | null;
  score_booking: number | null;
  score_social: number | null;
  score_customers: number | null;
  score_marketing: number | null;
  relevant_services: AuditResult["relevantServices"];
  attribution: Record<string, unknown> | null;
};

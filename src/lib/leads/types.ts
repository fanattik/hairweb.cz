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

export type LeadUtm = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  type: LeadType;
  name: string;
  salon_name: string | null;
  email: string;
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
  score: number | null;
  notes: string | null;
  last_contact_at: string | null;
  next_followup_at: string | null;
  won_value: number | null;
  lost_reason: string | null;
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "NEW",
  contacted: "CONTACTED",
  interested: "INTERESTED",
  meeting: "MEETING",
  proposal: "PROPOSAL",
  won: "WON",
  lost: "LOST",
};

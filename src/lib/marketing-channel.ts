/**
 * Marketing channel labels for CRM reporting.
 * Extensible — add rules at the top of CHANNEL_RULES.
 */

export type MarketingChannel =
  | "meta_ads"
  | "google_ads"
  | "google_organic"
  | "organic_social"
  | "referral"
  | "direct"
  | "outbound"
  | "other";

export const MARKETING_CHANNEL_LABELS: Record<MarketingChannel, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  google_organic: "Google Organic",
  organic_social: "Organic Social",
  referral: "Referral",
  direct: "Direct",
  outbound: "Outbound",
  other: "Other",
};

export type AttributionTouchInput = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  fbclid?: string | null;
};

export type LeadAttributionView = AttributionTouchInput & {
  type?: string | null;
  leadSource?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  first_touch_source?: string | null;
  first_touch_medium?: string | null;
  first_touch_campaign?: string | null;
  first_touch_content?: string | null;
  first_touch_term?: string | null;
  first_touch_referrer?: string | null;
  first_touch_landing_page?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
};

type ChannelRule = {
  channel: MarketingChannel;
  test: (touch: AttributionTouchInput) => boolean;
};

function norm(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

const CHANNEL_RULES: ChannelRule[] = [
  {
    channel: "meta_ads",
    test: (t) => {
      const s = norm(t.source);
      const m = norm(t.medium);
      if (t.fbclid) return true;
      if (["facebook", "fb", "instagram", "ig", "meta"].includes(s)) {
        return (
          m.includes("paid") ||
          m === "cpc" ||
          m === "ppc" ||
          m === "paidsocial" ||
          m === "paid_social"
        );
      }
      return false;
    },
  },
  {
    channel: "google_ads",
    test: (t) => {
      const s = norm(t.source);
      const m = norm(t.medium);
      return (
        (s === "google" || s === "googleads" || s === "adwords") &&
        (m === "cpc" || m === "ppc" || m === "paid" || m.includes("paid"))
      );
    },
  },
  {
    channel: "google_organic",
    test: (t) => {
      const s = norm(t.source);
      const m = norm(t.medium);
      if (s === "google" && (m === "organic" || m === "seo")) return true;
      const ref = norm(t.referrer);
      return (
        !s &&
        (ref.includes("google.") || ref.includes("googleusercontent"))
      );
    },
  },
  {
    channel: "organic_social",
    test: (t) => {
      const s = norm(t.source);
      const m = norm(t.medium);
      if (["facebook", "instagram", "ig", "fb", "meta"].includes(s)) {
        return m === "organic" || m === "social" || m === "" || m === "referral";
      }
      return false;
    },
  },
  {
    channel: "referral",
    test: (t) => {
      const m = norm(t.medium);
      if (m === "referral") return true;
      return Boolean(t.referrer) && !norm(t.source);
    },
  },
];

export function resolveMarketingChannel(
  input: LeadAttributionView,
): MarketingChannel {
  if (
    input.type === "outbound" ||
    input.leadSource === "manual" ||
    input.leadSource === "discovery" ||
    input.leadSource === "import"
  ) {
    return "outbound";
  }

  const touch: AttributionTouchInput = {
    source:
      input.first_touch_source ?? input.source ?? input.utm_source ?? null,
    medium:
      input.first_touch_medium ?? input.medium ?? input.utm_medium ?? null,
    campaign:
      input.first_touch_campaign ??
      input.campaign ??
      input.utm_campaign ??
      null,
    content:
      input.first_touch_content ?? input.content ?? input.utm_content ?? null,
    term: input.first_touch_term ?? input.term ?? input.utm_term ?? null,
    referrer: input.first_touch_referrer ?? input.referrer ?? null,
    landingPage: input.first_touch_landing_page ?? input.landing_page ?? null,
    fbclid: input.fbclid ?? null,
  };

  for (const rule of CHANNEL_RULES) {
    if (rule.test(touch)) return rule.channel;
  }

  if (
    !touch.source &&
    !touch.medium &&
    !touch.campaign &&
    !touch.fbclid &&
    !touch.referrer
  ) {
    return "direct";
  }

  return "other";
}

export function marketingChannelLabel(channel: MarketingChannel): string {
  return MARKETING_CHANNEL_LABELS[channel];
}

/** Map lead row → channel (first-touch preferred). */
export function leadMarketingChannel(lead: LeadAttributionView): MarketingChannel {
  return resolveMarketingChannel(lead);
}

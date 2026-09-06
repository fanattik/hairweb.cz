export type AnalyticsEvent =
  | "hero_cta_click"
  | "demo_hair_click"
  | "demo_barber_click"
  | "demo_color_click"
  | "portfolio_click"
  | "pricing_start_click"
  | "pricing_pro_click"
  | "final_cta_click"
  | "mobile_cta_click"
  | "lead_form_start"
  | "generate_lead"
  | "reservation_section_view";

type AnalyticsPayload = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Analytics helper.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID to enable gtag.
 * TODO: wire cookie consent before loading GA in production if required.
 */
export function trackEvent(event: AnalyticsEvent, payload?: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  // Never send PII to analytics.
  const safePayload = { ...payload };
  delete safePayload.name;
  delete safePayload.email;
  delete safePayload.phone;
  delete safePayload.website;
  delete safePayload.message;

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, safePayload);
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...safePayload,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", event, safePayload);
  }
}

/** @deprecated Use trackEvent */
export const track = trackEvent;

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
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: Window["fbq"];
  }
}

function isMetaPixelDebug() {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.NEXT_PUBLIC_META_PIXEL_DEBUG === "1") return true;
  try {
    return new URLSearchParams(window.location.search).get("meta_debug") === "1";
  } catch {
    return false;
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

/**
 * Meta Pixel standard Lead via the existing layout fbq instance.
 * Never throws. Returns whether fbq('track','Lead') was invoked.
 */
export function trackMetaLead(options?: { eventId?: string }): boolean {
  if (typeof window === "undefined") return false;
  const debug = isMetaPixelDebug();

  try {
    const fbq = window.fbq || window._fbq;
    if (typeof fbq !== "function") {
      if (debug) {
        console.warn("[Meta Pixel] Lead skipped — window.fbq not available", {
          hasFbq: typeof window.fbq,
          has_fbq: typeof window._fbq,
        });
      }
      return false;
    }

    if (debug) {
      console.log("[Meta Pixel] Sending Lead event");
    }

    // Prefer explicit window.fbq as required for Events Manager / Test events.
    if (options?.eventId) {
      window.fbq!("track", "Lead", {}, { eventID: options.eventId });
    } else {
      window.fbq!("track", "Lead");
    }
    return true;
  } catch (error) {
    if (debug) {
      console.warn("[Meta Pixel] Lead track threw", error);
    }
    return false;
  }
}

/** @deprecated Use trackEvent */
export const track = trackEvent;

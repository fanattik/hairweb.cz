import type { LeadSubmitInput } from "@/lib/leads/schema";

function nullIfEmpty(value: string | undefined | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, 1000);
}

function sanitizeTouch(
  touch:
    | {
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
        utm_content?: string | null;
        utm_term?: string | null;
        fbclid?: string | null;
        landing_page?: string | null;
        referrer?: string | null;
        at?: string | null;
      }
    | undefined,
) {
  if (!touch) return null;
  return {
    utm_source: nullIfEmpty(touch.utm_source ?? null),
    utm_medium: nullIfEmpty(touch.utm_medium ?? null),
    utm_campaign: nullIfEmpty(touch.utm_campaign ?? null),
    utm_content: nullIfEmpty(touch.utm_content ?? null),
    utm_term: nullIfEmpty(touch.utm_term ?? null),
    fbclid: nullIfEmpty(touch.fbclid ?? null),
    landing_page: nullIfEmpty(touch.landing_page ?? null),
    referrer: nullIfEmpty(touch.referrer ?? null),
    at: touch.at || null,
  };
}

export function normalizeLeadSubmit(input: LeadSubmitInput) {
  const first =
    sanitizeTouch(input.attribution?.first) ||
    sanitizeTouch({
      utm_source: input.utm?.utm_source,
      utm_medium: input.utm?.utm_medium,
      utm_campaign: input.utm?.utm_campaign,
      utm_content: input.utm?.utm_content,
      utm_term: input.utm?.utm_term,
      fbclid: input.fbclid,
      landing_page: input.landingPage,
      referrer: input.referrer,
      at: input.attribution?.firstTouchAt,
    });

  const last =
    sanitizeTouch(input.attribution?.last) || first;

  const firstSource = first?.utm_source ?? null;
  const firstMedium = first?.utm_medium ?? null;
  const firstCampaign = first?.utm_campaign ?? null;
  const firstContent = first?.utm_content ?? null;
  const firstTerm = first?.utm_term ?? null;
  const firstLanding =
    first?.landing_page ?? nullIfEmpty(input.landingPage ?? null);
  const firstReferrer =
    first?.referrer ?? nullIfEmpty(input.referrer ?? null);
  const firstFbclid =
    first?.fbclid ?? nullIfEmpty(input.fbclid ?? null);
  const firstAt =
    first?.at ||
    input.attribution?.firstTouchAt ||
    new Date().toISOString();

  return {
    type: "inbound" as const,
    name: input.name.trim(),
    salon_name: nullIfEmpty(input.salonName ?? null),
    email: input.email.trim().toLowerCase(),
    phone: nullIfEmpty(input.phone ?? null),
    website: input.website.trim(),
    message: nullIfEmpty(input.message ?? null),
    package: input.package ?? null,
    source: "landing",
    source_detail: input.sourceDetail ?? null,
    // Legacy aliases = first touch (reporting + email templates).
    utm_source: firstSource,
    utm_medium: firstMedium,
    utm_campaign: firstCampaign,
    utm_content: firstContent,
    utm_term: firstTerm,
    referrer: firstReferrer,
    landing_page: firstLanding,
    fbclid: firstFbclid,
    first_touch_at: firstAt,
    first_touch_source: firstSource,
    first_touch_medium: firstMedium,
    first_touch_campaign: firstCampaign,
    first_touch_content: firstContent,
    first_touch_term: firstTerm,
    first_touch_landing_page: firstLanding,
    first_touch_referrer: firstReferrer,
    last_touch_at: last?.at || input.attribution?.lastTouchAt || firstAt,
    last_touch_source: last?.utm_source ?? firstSource,
    last_touch_medium: last?.utm_medium ?? firstMedium,
    last_touch_campaign: last?.utm_campaign ?? firstCampaign,
    last_touch_content: last?.utm_content ?? firstContent,
    last_touch_term: last?.utm_term ?? firstTerm,
    last_touch_landing_page: last?.landing_page ?? firstLanding,
    last_touch_referrer: last?.referrer ?? firstReferrer,
    last_touch_fbclid: last?.fbclid ?? firstFbclid,
    status: "new" as const,
  };
}

export function isHoneypotTriggered(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function isTooFastSubmit(formStartedAt: number | undefined, minMs = 2000) {
  if (!formStartedAt) return false;
  return Date.now() - formStartedAt < minMs;
}

/**
 * TODO: Cloudflare Turnstile — add when spam becomes a problem.
 * Verify token server-side before insert.
 */
export function turnstileTodo() {
  return null;
}

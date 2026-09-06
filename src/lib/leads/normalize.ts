import type { LeadSubmitInput } from "@/lib/leads/schema";

function nullIfEmpty(value: string | undefined | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function normalizeLeadSubmit(input: LeadSubmitInput) {
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
    utm_source: nullIfEmpty(input.utm?.utm_source ?? null),
    utm_medium: nullIfEmpty(input.utm?.utm_medium ?? null),
    utm_campaign: nullIfEmpty(input.utm?.utm_campaign ?? null),
    utm_content: nullIfEmpty(input.utm?.utm_content ?? null),
    utm_term: nullIfEmpty(input.utm?.utm_term ?? null),
    referrer: nullIfEmpty(input.referrer ?? null),
    landing_page: nullIfEmpty(input.landingPage ?? null),
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

/**
 * First/last-touch marketing attribution (Europe/Prague site).
 *
 * Storage: localStorage, 90-day window (documented as functional preference
 * on /cookies — needed to attribute inbound form submits).
 * First touch never overwrites within the window.
 * Last touch updates when a new recognizable marketing signal arrives.
 */

export type SourceDetail =
  | "hero"
  | "portfolio"
  | "pricing_start"
  | "pricing_pro"
  | "reservation"
  | "final_cta"
  | "mobile_sticky"
  | "header";

const STORAGE_KEY = "hairweb_attribution_v2";
const SOURCE_KEY = "hairweb_source_detail";
const ATTR_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type TouchSnapshot = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  at: string;
};

export type StoredAttribution = {
  version: 2;
  expiresAt: string;
  first: TouchSnapshot;
  last: TouchSnapshot;
};

export type AttributionPayload = {
  first: TouchSnapshot;
  last: TouchSnapshot;
  /** Legacy flat aliases = first touch (for older readers). */
  utm: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  referrer: string | null;
  landingPage: string | null;
  fbclid: string | null;
  firstTouchAt: string | null;
  lastTouchAt: string | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function nullIfEmpty(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed.slice(0, 1000) : null;
}

function readParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    utm_source: nullIfEmpty(params.get("utm_source")),
    utm_medium: nullIfEmpty(params.get("utm_medium")),
    utm_campaign: nullIfEmpty(params.get("utm_campaign")),
    utm_content: nullIfEmpty(params.get("utm_content")),
    utm_term: nullIfEmpty(params.get("utm_term")),
    fbclid: nullIfEmpty(params.get("fbclid")),
  };
}

function hasMarketingSignal(touch: Partial<TouchSnapshot>): boolean {
  return Boolean(
    touch.utm_source ||
      touch.utm_medium ||
      touch.utm_campaign ||
      touch.utm_content ||
      touch.utm_term ||
      touch.fbclid,
  );
}

function touchFromVisit(nowIso: string): TouchSnapshot {
  const params = readParams(window.location.search);
  return {
    ...params,
    landing_page: `${window.location.pathname}${window.location.search}`.slice(
      0,
      1000,
    ),
    referrer: nullIfEmpty(document.referrer)?.slice(0, 1000) ?? null,
    at: nowIso,
  };
}

function readStore(): StoredAttribution | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (parsed.version !== 2 || !parsed.first || !parsed.last) return null;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(value: StoredAttribution) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function migrateLegacySession(): StoredAttribution | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const utmRaw = sessionStorage.getItem("hairweb_utm");
    const referrer = sessionStorage.getItem("hairweb_referrer");
    const landing = sessionStorage.getItem("hairweb_landing");
    if (!utmRaw && !referrer && !landing) return null;
    const utm = utmRaw ? (JSON.parse(utmRaw) as Record<string, string>) : {};
    const nowIso = new Date().toISOString();
    const touch: TouchSnapshot = {
      utm_source: nullIfEmpty(utm.utm_source),
      utm_medium: nullIfEmpty(utm.utm_medium),
      utm_campaign: nullIfEmpty(utm.utm_campaign),
      utm_content: nullIfEmpty(utm.utm_content),
      utm_term: nullIfEmpty(utm.utm_term),
      fbclid: null,
      landing_page: nullIfEmpty(landing),
      referrer: nullIfEmpty(referrer),
      at: nowIso,
    };
    return {
      version: 2,
      expiresAt: new Date(Date.now() + ATTR_TTL_MS).toISOString(),
      first: touch,
      last: touch,
    };
  } catch {
    return null;
  }
}

/**
 * Capture / refresh attribution on each page load.
 * Call once from ClientBootstrap.
 */
export function captureAttributionOnce() {
  if (!canUseStorage()) return;

  let stored = readStore();
  if (!stored) {
    stored = migrateLegacySession();
  }

  const nowIso = new Date().toISOString();
  const visit = touchFromVisit(nowIso);
  const marketing = hasMarketingSignal(visit);

  if (!stored) {
    // First visit ever — always store landing + optional marketing.
    writeStore({
      version: 2,
      expiresAt: new Date(Date.now() + ATTR_TTL_MS).toISOString(),
      first: visit,
      last: visit,
    });
    return;
  }

  // First touch never changes within TTL.
  let last = stored.last;
  if (marketing) {
    last = {
      ...visit,
      // Keep referrer from this visit if present, else previous last.
      referrer: visit.referrer || stored.last.referrer,
    };
  }

  writeStore({
    version: 2,
    expiresAt: stored.expiresAt,
    first: stored.first,
    last,
  });
}

export function getStoredAttribution(): AttributionPayload {
  const emptyTouch = (): TouchSnapshot => ({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    fbclid: null,
    landing_page: null,
    referrer: null,
    at: new Date().toISOString(),
  });

  const stored = readStore();
  if (!stored) {
    const empty = emptyTouch();
    return {
      first: empty,
      last: empty,
      utm: {},
      referrer: null,
      landingPage: null,
      fbclid: null,
      firstTouchAt: null,
      lastTouchAt: null,
    };
  }

  const first = stored.first;
  const last = stored.last;
  return {
    first,
    last,
    utm: {
      utm_source: first.utm_source || undefined,
      utm_medium: first.utm_medium || undefined,
      utm_campaign: first.utm_campaign || undefined,
      utm_content: first.utm_content || undefined,
      utm_term: first.utm_term || undefined,
    },
    referrer: first.referrer,
    landingPage: first.landing_page,
    fbclid: first.fbclid || last.fbclid,
    firstTouchAt: first.at,
    lastTouchAt: last.at,
  };
}

/** @deprecated Prefer getStoredAttribution().utm */
export function getStoredUtm() {
  return getStoredAttribution().utm;
}

export function getStoredReferrer() {
  return getStoredAttribution().referrer;
}

export function getStoredLandingPage() {
  return getStoredAttribution().landingPage;
}

export function setSourceDetail(source: SourceDetail) {
  if (!canUseStorage()) return;
  // CTA source_detail is session-scoped (page interaction), not marketing window.
  try {
    sessionStorage.setItem(SOURCE_KEY, source);
  } catch {
    /* ignore */
  }
}

export function getSourceDetail(): SourceDetail | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return (sessionStorage.getItem(SOURCE_KEY) as SourceDetail | null) || null;
  } catch {
    return null;
  }
}

export const ATTRIBUTION_TTL_DAYS = 90;

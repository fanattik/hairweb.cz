export type SourceDetail =
  | "hero"
  | "portfolio"
  | "pricing_start"
  | "pricing_pro"
  | "reservation"
  | "final_cta"
  | "mobile_sticky"
  | "header";

const UTM_KEY = "hairweb_utm";
const REFERRER_KEY = "hairweb_referrer";
const LANDING_KEY = "hairweb_landing";
const SOURCE_KEY = "hairweb_source_detail";

export type StoredUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function captureAttributionOnce() {
  if (!canUseStorage()) return;

  const params = new URLSearchParams(window.location.search);
  const existingUtm = sessionStorage.getItem(UTM_KEY);

  if (!existingUtm) {
    const utm: StoredUtm = {};
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ] as const) {
      const value = params.get(key);
      if (value) utm[key] = value;
    }
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  }

  if (!sessionStorage.getItem(REFERRER_KEY) && document.referrer) {
    sessionStorage.setItem(REFERRER_KEY, document.referrer);
  }

  if (!sessionStorage.getItem(LANDING_KEY)) {
    sessionStorage.setItem(
      LANDING_KEY,
      `${window.location.pathname}${window.location.search}`,
    );
  }
}

export function getStoredUtm(): StoredUtm {
  if (!canUseStorage()) return {};
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}") as StoredUtm;
  } catch {
    return {};
  }
}

export function getStoredReferrer() {
  if (!canUseStorage()) return null;
  return sessionStorage.getItem(REFERRER_KEY);
}

export function getStoredLandingPage() {
  if (!canUseStorage()) return null;
  return sessionStorage.getItem(LANDING_KEY);
}

export function setSourceDetail(source: SourceDetail) {
  if (!canUseStorage()) return;
  sessionStorage.setItem(SOURCE_KEY, source);
}

export function getSourceDetail(): SourceDetail | null {
  if (!canUseStorage()) return null;
  const value = sessionStorage.getItem(SOURCE_KEY);
  return value as SourceDetail | null;
}

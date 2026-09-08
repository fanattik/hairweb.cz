/**
 * Short-lived client flag proving the lead form just succeeded.
 * Prevents fake Meta conversions from opening /poptavka-odeslana directly.
 *
 * Uses sessionStorage (UI guard) + a SameSite cookie (middleware can redirect
 * before the thank-you HTML/Pixel PageView is served).
 */

const FLAG_KEY = "hairweb_lead_thanks_v1";
export const LEAD_THANKS_COOKIE = "hairweb_lead_thanks";
const FLAG_TTL_MS = 15 * 60 * 1000; // 15 minutes
const FLAG_TTL_SEC = Math.floor(FLAG_TTL_MS / 1000);

export type LeadThanksFlag = {
  leadId: string;
  at: number;
};

function canUseSession() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function setThanksCookie(leadId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${LEAD_THANKS_COOKIE}=${encodeURIComponent(leadId)}; Path=/; Max-Age=${FLAG_TTL_SEC}; SameSite=Lax`;
}

function clearThanksCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${LEAD_THANKS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function markLeadFormSuccess(leadId: string) {
  if (!canUseSession()) return;
  const payload: LeadThanksFlag = { leadId, at: Date.now() };
  sessionStorage.setItem(FLAG_KEY, JSON.stringify(payload));
  setThanksCookie(leadId);
}

/** Returns flag if valid; consumes it (one-time). */
export function consumeLeadFormSuccessFlag(): LeadThanksFlag | null {
  if (!canUseSession()) return null;
  try {
    const raw = sessionStorage.getItem(FLAG_KEY);
    sessionStorage.removeItem(FLAG_KEY);
    clearThanksCookie();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadThanksFlag;
    if (!parsed?.leadId || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > FLAG_TTL_MS) return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(FLAG_KEY);
    clearThanksCookie();
    return null;
  }
}

export function peekLeadFormSuccessFlag(): LeadThanksFlag | null {
  if (!canUseSession()) return null;
  try {
    const raw = sessionStorage.getItem(FLAG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadThanksFlag;
    if (!parsed?.leadId || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > FLAG_TTL_MS) {
      sessionStorage.removeItem(FLAG_KEY);
      clearThanksCookie();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const LEAD_THANKS_PATH = "/poptavka-odeslana";

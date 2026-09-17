/**
 * Persist the last /admin/leads list URL (with filters) in sessionStorage
 * so detail → back and nav "Leady" restore the same view.
 */

export const LEADS_LIST_URL_KEY = "hairweb_admin_leads_list_url";
export const LEADS_LIST_DEFAULT_PATH = "/admin/leads";

export function saveLeadsListUrl(url: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LEADS_LIST_URL_KEY, url);
  } catch {
    // ignore quota / private mode
  }
}

export function clearLeadsListUrl() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LEADS_LIST_URL_KEY);
  } catch {
    // ignore
  }
}

export function getLeadsListUrl(): string {
  if (typeof window === "undefined") return LEADS_LIST_DEFAULT_PATH;
  try {
    const raw = sessionStorage.getItem(LEADS_LIST_URL_KEY);
    if (!raw || !raw.startsWith(LEADS_LIST_DEFAULT_PATH)) {
      return LEADS_LIST_DEFAULT_PATH;
    }
    return raw;
  } catch {
    return LEADS_LIST_DEFAULT_PATH;
  }
}

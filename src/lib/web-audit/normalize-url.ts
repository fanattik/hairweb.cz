/**
 * Normalize salon website URLs for auditing.
 */

export function normalizeAuditUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  let raw = value.trim();
  if (!raw || raw === "—") return null;
  if (raw.startsWith("@")) return null;
  if (/instagram\.com/i.test(raw)) return null;

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".")) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

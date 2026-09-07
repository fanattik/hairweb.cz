/**
 * Normalize Instagram handles and profile URLs.
 */

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

export function stripAt(value: string) {
  return value.trim().replace(/^@+/, "");
}

export function normalizeInstagramHandle(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  let raw = value.trim();
  if (!raw) return null;

  try {
    if (/^https?:\/\//i.test(raw) || raw.includes("instagram.com")) {
      const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const url = new URL(withProtocol);
      if (!/instagram\.com$/i.test(url.hostname.replace(/^www\./, ""))) {
        return null;
      }
      const segment = url.pathname.split("/").filter(Boolean)[0] || "";
      raw = decodeURIComponent(segment);
    }
  } catch {
    // fall through to handle parsing
  }

  const handle = stripAt(raw).split(/[/?#]/)[0] || "";
  if (!HANDLE_RE.test(handle)) return null;
  // Reserved path segments
  if (
    [
      "p",
      "reel",
      "reels",
      "stories",
      "explore",
      "accounts",
      "direct",
      "tv",
    ].includes(handle.toLowerCase())
  ) {
    return null;
  }
  return handle.toLowerCase();
}

export function instagramProfileUrl(handle: string) {
  return `https://www.instagram.com/${stripAt(handle)}/`;
}

export function parseInstagramInput(input: {
  handle?: string | null;
  url?: string | null;
}): { handle: string; url: string } | null {
  const handle =
    normalizeInstagramHandle(input.handle) ||
    normalizeInstagramHandle(input.url);
  if (!handle) return null;
  return { handle, url: instagramProfileUrl(handle) };
}

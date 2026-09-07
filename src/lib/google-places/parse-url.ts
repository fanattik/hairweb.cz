/**
 * Parse Google Maps / Places URLs into a usable place id or search query.
 */

const PLACE_ID_RE = /\b(ChIJ[\w-]+)\b/;
const PLACES_PATH_RE = /places\/(ChIJ[\w-]+)/i;

export type ParsedMapsInput = {
  placeId: string | null;
  /** Human query extracted from /maps/place/Name/… */
  queryFromUrl: string | null;
};

export function extractPlaceId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^ChIJ[\w-]+$/.test(trimmed)) return trimmed;

  const fromPath = trimmed.match(PLACES_PATH_RE);
  if (fromPath?.[1]) return fromPath[1];

  const fromQuery = trimmed.match(/[?&](?:place_id|query_place_id)=([^&]+)/i);
  if (fromQuery?.[1]) {
    const decoded = decodeURIComponent(fromQuery[1]);
    const id = decoded.match(PLACE_ID_RE);
    if (id) return id[1];
  }

  const any = trimmed.match(PLACE_ID_RE);
  return any?.[1] ?? null;
}

export function extractQueryFromMapsUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim() || null;
    }
    const q = parsed.searchParams.get("q");
    if (q?.trim()) return q.trim();
  } catch {
    return null;
  }
  return null;
}

export function parseMapsInput(value: string | null | undefined): ParsedMapsInput {
  return {
    placeId: extractPlaceId(value),
    queryFromUrl: extractQueryFromMapsUrl(value),
  };
}

/** Follow short Google Maps links to the final URL (best-effort). */
export async function resolveMapsRedirect(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  if (!/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) return url;

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "HairwebEnrichment/1.0" },
    });
    return response.url || url;
  } catch {
    return url;
  }
}

/** Best-effort city from a Czech/EU formatted address. */
export function cityFromFormattedAddress(
  address: string | null | undefined,
): string | null {
  if (!address) return null;
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;

  // Prefer segment that looks like "110 00 Praha 1" or "Praha"
  for (const part of parts) {
    const withoutZip = part.replace(/^\d{3}\s?\d{2}\s+/, "").trim();
    if (
      /praha|brno|ostrava|plzeň|plzen|liberec|olomouc|české|ceske|hradec|pardubice|zlín|zlin|karlovy|ústí|usti|jihava|teplice/i.test(
        withoutZip,
      )
    ) {
      return withoutZip;
    }
  }

  // Fallback: second-to-last before country
  const candidate = parts[parts.length - 2] ?? parts[0];
  return candidate.replace(/^\d{3}\s?\d{2}\s+/, "").trim() || null;
}

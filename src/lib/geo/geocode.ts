/**
 * Geocode Czech salon locations for the admin map (Nominatim / OSM).
 */

export type GeoPoint = { latitude: number; longitude: number };

export async function geocodeSalonLocation(input: {
  city?: string | null;
  region?: string | null;
  salonName?: string | null;
  address?: string | null;
}): Promise<GeoPoint | null> {
  const query = [
    input.address,
    input.salonName,
    input.city,
    input.region,
    "Česko",
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  if (!query || query === "Česko") return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "cz");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Hairweb.cz Admin Map/1.0 (https://www.hairweb.cz)",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
    }>;

    const hit = json[0];
    if (!hit?.lat || !hit?.lon) return null;

    const latitude = Number(hit.lat);
    const longitude = Number(hit.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return { latitude, longitude };
  } catch {
    return null;
  }
}

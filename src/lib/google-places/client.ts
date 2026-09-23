import {
  cityFromFormattedAddress,
  extractPlaceId,
  parseMapsInput,
  regionFromCity,
  resolveMapsRedirect,
} from "@/lib/google-places/parse-url";

export type GoogleOpeningHours = {
  weekdayDescriptions: string[];
  openNow: boolean | null;
};

export type GooglePlaceSnapshot = {
  placeId: string;
  name: string | null;
  rating: number | null;
  reviewsCount: number | null;
  mapsUrl: string | null;
  formattedAddress: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  businessStatus: string | null;
  primaryType: string | null;
  primaryTypeDisplayName: string | null;
  types: string[];
  openingHours: GoogleOpeningHours | null;
};

type PlacesApiPlace = {
  id?: string;
  name?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  location?: { latitude?: number; longitude?: number };
  businessStatus?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
};

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.location",
  "places.addressComponents",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "location",
  "addressComponents",
  "businessStatus",
  "primaryType",
  "primaryTypeDisplayName",
  "types",
  "regularOpeningHours",
  "currentOpeningHours",
].join(",");

function cityFromComponents(
  components: PlacesApiPlace["addressComponents"],
): string | null {
  if (!components?.length) return null;
  const locality =
    components.find((c) => c.types?.includes("locality"))?.longText ||
    components.find((c) => c.types?.includes("postal_town"))?.longText ||
    components.find((c) => c.types?.includes("sublocality"))?.longText;
  return locality?.trim() || null;
}

function regionFromComponents(
  components: PlacesApiPlace["addressComponents"],
): string | null {
  if (!components?.length) return null;
  const area = components.find((c) =>
    c.types?.includes("administrative_area_level_1"),
  )?.longText;
  return area?.trim() || null;
}

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Chybí GOOGLE_PLACES_API_KEY. Přidej klíč z Google Cloud (Places API New).",
    );
  }
  return key;
}

function normalizePlaceId(raw: string) {
  return raw.replace(/^places\//, "");
}

function toOpeningHours(place: PlacesApiPlace): GoogleOpeningHours | null {
  const source = place.regularOpeningHours || place.currentOpeningHours;
  if (!source) return null;
  const weekdayDescriptions = (source.weekdayDescriptions || [])
    .map((line) => line.trim())
    .filter(Boolean);
  if (!weekdayDescriptions.length && typeof source.openNow !== "boolean") {
    return null;
  }
  return {
    weekdayDescriptions,
    openNow: typeof source.openNow === "boolean" ? source.openNow : null,
  };
}

function toSnapshot(place: PlacesApiPlace): GooglePlaceSnapshot | null {
  const rawId = place.id || place.name;
  if (!rawId) return null;
  const placeId = normalizePlaceId(rawId);
  const rating =
    typeof place.rating === "number" && Number.isFinite(place.rating)
      ? Math.round(place.rating * 10) / 10
      : null;
  const reviewsCount =
    typeof place.userRatingCount === "number" && place.userRatingCount >= 0
      ? place.userRatingCount
      : null;

  const city =
    cityFromComponents(place.addressComponents) ||
    cityFromFormattedAddress(place.formattedAddress);

  return {
    placeId,
    name: place.displayName?.text?.trim() || null,
    rating,
    reviewsCount,
    mapsUrl: place.googleMapsUri || null,
    formattedAddress: place.formattedAddress || null,
    city,
    region:
      regionFromComponents(place.addressComponents) || regionFromCity(city),
    phone:
      place.nationalPhoneNumber?.trim() ||
      place.internationalPhoneNumber?.trim() ||
      null,
    website: place.websiteUri?.trim() || null,
    latitude:
      typeof place.location?.latitude === "number"
        ? place.location.latitude
        : null,
    longitude:
      typeof place.location?.longitude === "number"
        ? place.location.longitude
        : null,
    businessStatus: place.businessStatus?.trim() || null,
    primaryType: place.primaryType?.trim() || null,
    primaryTypeDisplayName: place.primaryTypeDisplayName?.text?.trim() || null,
    types: Array.isArray(place.types) ? place.types.filter(Boolean) : [],
    openingHours: toOpeningHours(place),
  };
}

async function placesFetch(
  url: string,
  init: RequestInit & { fieldMask: string },
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": init.fieldMask,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    places?: PlacesApiPlace[];
  } & PlacesApiPlace;

  if (!response.ok) {
    throw new Error(
      json.error?.message || `Google Places error (${response.status})`,
    );
  }

  return json;
}

export async function fetchPlaceDetails(
  placeId: string,
): Promise<GooglePlaceSnapshot> {
  const id = normalizePlaceId(placeId);
  const json = await placesFetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
    { method: "GET", fieldMask: DETAILS_FIELD_MASK },
  );
  const snapshot = toSnapshot(json);
  if (!snapshot) throw new Error("Place Details nevrátilo platný záznam.");
  return snapshot;
}

export async function searchPlaces(
  textQuery: string,
  options?: { maxResultCount?: number },
): Promise<GooglePlaceSnapshot[]> {
  const query = textQuery.trim();
  if (query.length < 2) return [];

  const json = await placesFetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      fieldMask: SEARCH_FIELD_MASK,
      body: JSON.stringify({
        textQuery: query,
        languageCode: "cs",
        regionCode: "CZ",
        maxResultCount: options?.maxResultCount ?? 5,
      }),
    },
  );

  return (json.places || [])
    .map(toSnapshot)
    .filter((place): place is GooglePlaceSnapshot => place != null);
}

export type ResolvePlaceInput = {
  placeId?: string | null;
  mapsUrl?: string | null;
  query?: string | null;
  salonName?: string | null;
  city?: string | null;
};

/**
 * Resolve the best Google Place snapshot from URL / place id / text query.
 * Always prefers Place Details so opening hours / phone / website are complete.
 */
export async function resolveGooglePlace(
  input: ResolvePlaceInput,
): Promise<{ place: GooglePlaceSnapshot; candidates: GooglePlaceSnapshot[] }> {
  let mapsUrl = input.mapsUrl?.trim() || null;
  if (mapsUrl) {
    mapsUrl = await resolveMapsRedirect(mapsUrl);
  }

  const parsed = parseMapsInput(mapsUrl);
  const placeId =
    extractPlaceId(input.placeId) || parsed.placeId || extractPlaceId(mapsUrl);

  if (placeId) {
    const place = await fetchPlaceDetails(placeId);
    return { place, candidates: [place] };
  }

  const query =
    input.query?.trim() ||
    parsed.queryFromUrl ||
    [input.salonName, input.city, "kadeřnictví"]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ");

  if (!query || query.length < 2) {
    throw new Error(
      "Zadej Google Maps URL, Place ID, nebo název salonu + město.",
    );
  }

  const candidates = await searchPlaces(query, { maxResultCount: 5 });
  if (candidates.length === 0) {
    throw new Error(`Nic nenalezeno pro „${query}“.`);
  }

  try {
    const detailed = await fetchPlaceDetails(candidates[0].placeId);
    return {
      place: detailed,
      candidates: [detailed, ...candidates.slice(1)],
    };
  } catch {
    return { place: candidates[0], candidates };
  }
}

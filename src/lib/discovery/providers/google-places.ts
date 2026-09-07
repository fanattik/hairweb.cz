import {
  resolveGoogleIncludedTypes,
  resolveTextQueryHints,
} from "@/lib/discovery/business-types";
import type { LeadSourceProvider } from "@/lib/discovery/providers/types";
import type {
  DiscoveredPlace,
  DiscoverySearchInput,
} from "@/lib/discovery/types";
import { geocodeSalonLocation } from "@/lib/geo/geocode";
import {
  cityFromFormattedAddress,
  regionFromCity,
} from "@/lib/google-places/parse-url";

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
  businessStatus?: string;
  primaryType?: string;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    openNow?: boolean;
  };
  photos?: Array<{ name?: string }>;
};

const FIELD_MASK = [
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
  "places.businessStatus",
  "places.primaryType",
  "places.types",
  "places.regularOpeningHours",
  "places.photos",
].join(",");

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

function component(
  components: PlacesApiPlace["addressComponents"],
  type: string,
) {
  return (
    components?.find((c) => c.types?.includes(type))?.longText?.trim() || null
  );
}

function toDiscovered(place: PlacesApiPlace): DiscoveredPlace | null {
  const rawId = place.id || place.name;
  if (!rawId) return null;
  const placeId = normalizePlaceId(rawId);
  const name = place.displayName?.text?.trim();
  if (!name) return null;

  const city =
    component(place.addressComponents, "locality") ||
    component(place.addressComponents, "postal_town") ||
    component(place.addressComponents, "sublocality") ||
    cityFromFormattedAddress(place.formattedAddress);

  const region =
    component(place.addressComponents, "administrative_area_level_1") ||
    regionFromCity(city);

  const postalCode = component(place.addressComponents, "postal_code");

  const photoName = place.photos?.[0]?.name || null;

  return {
    provider: "google_places",
    externalId: placeId,
    googlePlaceId: placeId,
    name,
    address: place.formattedAddress || null,
    city,
    region,
    postalCode,
    latitude:
      typeof place.location?.latitude === "number"
        ? place.location.latitude
        : null,
    longitude:
      typeof place.location?.longitude === "number"
        ? place.location.longitude
        : null,
    phone:
      place.nationalPhoneNumber?.trim() ||
      place.internationalPhoneNumber?.trim() ||
      null,
    website: place.websiteUri?.trim() || null,
    mapsUrl: place.googleMapsUri || null,
    rating:
      typeof place.rating === "number" && Number.isFinite(place.rating)
        ? Math.round(place.rating * 10) / 10
        : null,
    reviewsCount:
      typeof place.userRatingCount === "number" && place.userRatingCount >= 0
        ? place.userRatingCount
        : null,
    businessStatus: place.businessStatus || null,
    primaryType: place.primaryType || null,
    types: place.types || [],
    openingHours: place.regularOpeningHours || null,
    coverPhotoUrl: photoName,
    raw: place,
  };
}

async function placesPost(
  url: string,
  body: Record<string, unknown>,
): Promise<{ places?: PlacesApiPlace[]; error?: { message?: string } }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({}))) as {
    places?: PlacesApiPlace[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      json.error?.message || `Google Places error (${response.status})`,
    );
  }

  return json;
}

async function resolveCenter(
  input: DiscoverySearchInput,
): Promise<{ latitude: number; longitude: number } | null> {
  if (
    typeof input.latitude === "number" &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
  ) {
    return { latitude: input.latitude, longitude: input.longitude };
  }

  return geocodeSalonLocation({
    city: input.city,
    region: input.region,
    address: input.locationQuery,
  });
}

export const googlePlacesProvider: LeadSourceProvider = {
  id: "google_places",
  label: "Google Places",
  enabled: true,

  async search(input) {
    let apiCalls = 0;
    const includedTypes = resolveGoogleIncludedTypes(input.businessTypes);
    const maxResults = Math.min(Math.max(input.maxResults, 1), 20);
    const center = await resolveCenter(input);

    const places: DiscoveredPlace[] = [];
    const seen = new Set<string>();

    if (center) {
      apiCalls += 1;
      const nearby = await placesPost(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          includedTypes,
          maxResultCount: maxResults,
          languageCode: "cs",
          regionCode: "CZ",
          locationRestriction: {
            circle: {
              center: {
                latitude: center.latitude,
                longitude: center.longitude,
              },
              radius: input.radiusMeters,
            },
          },
        },
      );

      for (const raw of nearby.places || []) {
        const place = toDiscovered(raw);
        if (!place || seen.has(place.externalId)) continue;
        seen.add(place.externalId);
        places.push(place);
      }
    }

    // Fallback / supplement via text search when nearby is empty or sparse.
    if (places.length < Math.min(5, maxResults)) {
      const hints = resolveTextQueryHints(input.businessTypes);
      const locationLabel =
        input.locationQuery ||
        [input.city, input.region].filter(Boolean).join(" ") ||
        "Česko";

      for (const hint of hints.slice(0, 2)) {
        if (places.length >= maxResults) break;
        apiCalls += 1;
        const body: Record<string, unknown> = {
          textQuery: `${hint} ${locationLabel}`.trim(),
          languageCode: "cs",
          regionCode: "CZ",
          maxResultCount: maxResults,
          includedType: includedTypes[0],
        };
        if (center) {
          body.locationBias = {
            circle: {
              center: {
                latitude: center.latitude,
                longitude: center.longitude,
              },
              radius: input.radiusMeters,
            },
          };
        }

        const text = await placesPost(
          "https://places.googleapis.com/v1/places:searchText",
          body,
        );

        for (const raw of text.places || []) {
          const place = toDiscovered(raw);
          if (!place || seen.has(place.externalId)) continue;
          seen.add(place.externalId);
          places.push(place);
          if (places.length >= maxResults) break;
        }
      }
    }

    return { places: places.slice(0, maxResults), apiCalls };
  },
};

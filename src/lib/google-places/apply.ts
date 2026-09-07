import type { GooglePlaceSnapshot } from "@/lib/google-places/client";
import type { Lead } from "@/lib/leads/types";

export type GoogleEnrichPatch = {
  google_place_id: string;
  google_rating: number | null;
  google_reviews_count: number | null;
  google_maps_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
  salon_name?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  has_website?: boolean | null;
  enrichment_source: "google_places";
  enrichment_status: "done";
  enrichment_error: null;
  last_enriched_at: string;
};

function isBlank(value: string | null | undefined) {
  return value == null || value.trim() === "" || value.trim() === "—";
}

/**
 * Merge Places snapshot into lead fields.
 * Rating/reviews/maps/place id always update.
 * Name/city/phone/website fill only when empty, unless overwrite=true.
 */
export function buildGoogleEnrichPatch(
  lead: Pick<
    Lead,
    "salon_name" | "city" | "phone" | "website" | "has_website"
  >,
  place: GooglePlaceSnapshot,
  options?: { overwrite?: boolean },
): GoogleEnrichPatch {
  const overwrite = options?.overwrite === true;
  const patch: GoogleEnrichPatch = {
    google_place_id: place.placeId,
    google_rating: place.rating,
    google_reviews_count: place.reviewsCount,
    google_maps_url: place.mapsUrl,
    enrichment_source: "google_places",
    enrichment_status: "done",
    enrichment_error: null,
    last_enriched_at: new Date().toISOString(),
  };

  if (place.latitude != null && place.longitude != null) {
    patch.latitude = place.latitude;
    patch.longitude = place.longitude;
  }

  if (overwrite || isBlank(lead.salon_name)) {
    if (place.name) patch.salon_name = place.name;
  }
  if (overwrite || isBlank(lead.city)) {
    if (place.city) patch.city = place.city;
  }
  if (overwrite || isBlank(lead.phone)) {
    if (place.phone) patch.phone = place.phone;
  }
  if (overwrite || isBlank(lead.website)) {
    if (place.website) {
      patch.website = place.website;
      patch.has_website = true;
    }
  }

  return patch;
}

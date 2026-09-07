"use client";

import { useState } from "react";
import type { GooglePlaceSnapshot } from "@/lib/google-places/client";

type FillPayload = {
  google_place_id?: string;
  google_rating?: string;
  google_reviews_count?: string;
  google_maps_url?: string;
  salon_name?: string;
  city?: string;
  phone?: string;
  website?: string;
  has_website?: boolean;
};

type Props = {
  mapsUrl: string;
  salonName: string;
  city: string;
  onFill: (payload: FillPayload) => void;
};

export function GoogleEnrichPreviewButton({
  mapsUrl,
  salonName,
  city,
  onFill,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GooglePlaceSnapshot[] | null>(
    null,
  );

  function applyPlace(place: GooglePlaceSnapshot) {
    onFill({
      google_place_id: place.placeId,
      google_rating: place.rating != null ? String(place.rating) : "",
      google_reviews_count:
        place.reviewsCount != null ? String(place.reviewsCount) : "",
      google_maps_url: place.mapsUrl || mapsUrl,
      salon_name: place.name || undefined,
      city: place.city || undefined,
      phone: place.phone || undefined,
      website: place.website || undefined,
      has_website: place.website ? true : undefined,
    });
    setCandidates(null);
    setError(null);
  }

  async function lookup() {
    setLoading(true);
    setError(null);
    setCandidates(null);

    const response = await fetch("/api/admin/leads/enrich-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mapsUrl: mapsUrl || undefined,
        salonName: salonName || undefined,
        city: city || undefined,
        query:
          !mapsUrl && (salonName || city)
            ? [salonName, city, "kadeřnictví"].filter(Boolean).join(" ")
            : undefined,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      place?: GooglePlaceSnapshot;
      candidates?: GooglePlaceSnapshot[];
    };

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Vyhledávání se nepovedlo.");
      return;
    }

    if (data.candidates && data.candidates.length > 1) {
      setCandidates(data.candidates);
      return;
    }

    if (data.place) applyPlace(data.place);
  }

  return (
    <div className="sm:col-span-2">
      <button
        type="button"
        disabled={loading}
        onClick={lookup}
        className="border border-line bg-mist px-3 py-2 text-sm hover:border-ink disabled:opacity-60"
      >
        {loading ? "Hledám v Google…" : "Načíst z Google Places"}
      </button>
      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {candidates ? (
        <div className="mt-2 space-y-2">
          {candidates.map((candidate) => (
            <button
              key={candidate.placeId}
              type="button"
              onClick={() => applyPlace(candidate)}
              className="flex w-full flex-col border border-line bg-foam px-3 py-2 text-left text-sm hover:border-ink"
            >
              <span className="font-medium">
                {candidate.name || candidate.placeId}
              </span>
              <span className="text-xs text-ink-soft">
                {candidate.formattedAddress}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

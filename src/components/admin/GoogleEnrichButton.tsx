"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GooglePlaceSnapshot } from "@/lib/google-places/client";
import type { Lead } from "@/lib/leads/types";

type Props = {
  lead: Lead;
};

export function GoogleEnrichButton({ lead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GooglePlaceSnapshot[] | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  async function enrich(placeId?: string) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/leads/${lead.id}/enrich-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId,
        mapsUrl: lead.google_maps_url || undefined,
        overwrite,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      ok?: boolean;
      needsSelection?: boolean;
      place?: GooglePlaceSnapshot;
      candidates?: GooglePlaceSnapshot[];
      scores?: { lead_score?: number | null };
    };

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Enrichment se nepovedl.");
      return;
    }

    if (data.needsSelection && data.candidates?.length) {
      setCandidates(data.candidates);
      setMessage("Vyber správný salon ze seznamu.");
      return;
    }

    setCandidates(null);
    setMessage(
      data.place
        ? `Doplněno: ${data.place.name || data.place.placeId}` +
            (data.scores?.lead_score != null
              ? ` · Lead Score ${data.scores.lead_score}`
              : "")
        : "Uloženo.",
    );
    router.refresh();
  }

  return (
    <div className="border border-line bg-mist p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Google Places
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Doplní rating, recenze a Maps URL
            {lead.google_place_id
              ? ` · Place ID ${lead.google_place_id}`
              : ""}
            {lead.last_enriched_at
              ? ` · naposledy ${new Date(lead.last_enriched_at).toLocaleString("cs-CZ")}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => enrich()}
          className="bg-ink px-4 py-2 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
        >
          {loading ? "Načítám…" : "Doplnit z Google"}
        </button>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
        />
        Přepsat i existující název / město / telefon / web
      </label>

      {lead.enrichment_status === "error" && lead.enrichment_error ? (
        <p className="mt-2 text-sm text-copper-deep">{lead.enrichment_error}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink">{message}</p> : null}

      {candidates && candidates.length > 1 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Více výsledků — vyber správný
          </p>
          {candidates.map((candidate) => (
            <button
              key={candidate.placeId}
              type="button"
              disabled={loading}
              onClick={() => enrich(candidate.placeId)}
              className="flex w-full flex-col border border-line bg-foam px-3 py-2 text-left text-sm hover:border-ink"
            >
              <span className="font-medium">{candidate.name || candidate.placeId}</span>
              <span className="text-xs text-ink-soft">
                {[
                  candidate.formattedAddress,
                  candidate.rating != null
                    ? `${candidate.rating.toFixed(1)} ★`
                    : null,
                  candidate.reviewsCount != null
                    ? `${candidate.reviewsCount} rec.`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

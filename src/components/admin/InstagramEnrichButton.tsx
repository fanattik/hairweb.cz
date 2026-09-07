"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InstagramSnapshot } from "@/lib/instagram/client";
import { INSTAGRAM_QUALITY_LABELS, type Lead } from "@/lib/leads/types";

type Props = {
  lead: Lead;
};

export function InstagramEnrichButton({ lead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function enrich() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(
      `/api/admin/leads/${lead.id}/enrich-instagram`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: lead.instagram_handle || undefined,
          url: lead.instagram_url || undefined,
          overwrite,
          requireGraph: true,
        }),
      },
    );

    const data = (await response.json()) as {
      error?: string;
      profile?: InstagramSnapshot;
      scores?: { lead_score?: number | null };
    };

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Instagram enrichment se nepovedl.");
      return;
    }

    const profile = data.profile;
    setMessage(
      profile
        ? `Doplněno @${profile.handle}` +
            (profile.followers != null ? ` · ${profile.followers} followers` : "") +
            (profile.suggestedQuality
              ? ` · návrh ${INSTAGRAM_QUALITY_LABELS[profile.suggestedQuality]}`
              : "") +
            (data.scores?.lead_score != null
              ? ` · Lead Score ${data.scores.lead_score}`
              : "")
        : "Uloženo.",
    );
    router.refresh();
  }

  const canRun = Boolean(lead.instagram_handle || lead.instagram_url);

  return (
    <div className="border border-line bg-mist p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Instagram
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Doplní followers, aktivitu a návrh kvality (Meta Business Discovery)
            {lead.instagram_handle ? ` · @${lead.instagram_handle}` : ""}
            {lead.instagram_media_count != null
              ? ` · ${lead.instagram_media_count} postů`
              : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={loading || !canRun}
          onClick={enrich}
          className="bg-ink px-4 py-2 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
        >
          {loading ? "Načítám…" : "Doplnit z Instagramu"}
        </button>
      </div>

      {!canRun ? (
        <p className="mt-2 text-xs text-ink-soft">
          Nejdřív vyplň Instagram URL nebo handle v editoru níže.
        </p>
      ) : null}

      <label className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
        />
        Přepsat i existující active / quality / web z IG
      </label>

      {lead.instagram_suggested_quality ? (
        <p className="mt-2 text-xs text-ink-soft">
          Poslední návrh kvality:{" "}
          {INSTAGRAM_QUALITY_LABELS[lead.instagram_suggested_quality]}
        </p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink">{message}</p> : null}
    </div>
  );
}

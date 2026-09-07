"use client";

import { useState } from "react";
import type { InstagramSnapshot } from "@/lib/instagram/client";
import { INSTAGRAM_QUALITY_LABELS, type InstagramQuality } from "@/lib/leads/types";

type FillPayload = {
  instagram_handle?: string;
  instagram_url?: string;
  instagram_followers?: string;
  instagram_active?: boolean | null;
  instagram_quality?: InstagramQuality | "";
  website?: string;
  has_website?: boolean;
};

type Props = {
  handle: string;
  url: string;
  onFill: (payload: FillPayload) => void;
};

export function InstagramEnrichPreviewButton({ handle, url, onFill }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function lookup() {
    setLoading(true);
    setError(null);
    setInfo(null);

    const response = await fetch("/api/admin/leads/enrich-instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: handle || undefined,
        url: url || undefined,
        requireGraph: false,
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      profile?: InstagramSnapshot;
      graphConfigured?: boolean;
    };

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Vyhledávání se nepovedlo.");
      return;
    }

    const profile = data.profile;
    if (!profile) {
      setError("Profil se nepodařilo načíst.");
      return;
    }

    onFill({
      instagram_handle: profile.handle,
      instagram_url: profile.url,
      instagram_followers:
        profile.followers != null ? String(profile.followers) : undefined,
      instagram_active: profile.suggestedActive,
      instagram_quality: profile.suggestedQuality,
      website: profile.website || undefined,
      has_website: profile.website ? true : undefined,
    });

    if (profile.source === "normalize_only") {
      setInfo(
        data.graphConfigured
          ? "Handle normalizován."
          : "Handle normalizován. Pro followers nastav Meta Graph credentials.",
      );
    } else {
      setInfo(
        `@${profile.handle}` +
          (profile.followers != null ? ` · ${profile.followers} followers` : "") +
          ` · návrh ${INSTAGRAM_QUALITY_LABELS[profile.suggestedQuality]}`,
      );
    }
  }

  return (
    <div className="sm:col-span-2">
      <button
        type="button"
        disabled={loading || (!handle && !url)}
        onClick={lookup}
        className="border border-line bg-mist px-3 py-2 text-sm hover:border-ink disabled:opacity-60"
      >
        {loading ? "Načítám Instagram…" : "Načíst z Instagramu"}
      </button>
      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {info ? <p className="mt-2 text-sm text-ink-soft">{info}</p> : null}
    </div>
  );
}

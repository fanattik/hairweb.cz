"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lead } from "@/lib/leads/types";

export function OpportunityActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function rescore() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(
      `/api/admin/leads/${lead.id}/rescore-opportunity`,
      { method: "POST" },
    );
    const data = (await response.json()) as {
      error?: string;
      opportunity?: { opportunityScore: number };
    };
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Rescore selhal.");
      return;
    }
    setMessage(
      `Opportunity score: ${data.opportunity?.opportunityScore ?? "—"}`,
    );
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={rescore}
        className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-60"
      >
        Recalculate score
      </button>
      {lead.google_maps_url ? (
        <a
          href={lead.google_maps_url}
          target="_blank"
          rel="noreferrer"
          className="border border-line px-3 py-2 text-sm hover:border-ink"
        >
          Open Google Maps
        </a>
      ) : null}
      {lead.website && lead.website !== "—" ? (
        <a
          href={
            /^https?:\/\//i.test(lead.website)
              ? lead.website
              : `https://${lead.website}`
          }
          target="_blank"
          rel="noreferrer"
          className="border border-line px-3 py-2 text-sm hover:border-ink"
        >
          Open website
        </a>
      ) : null}
      {lead.instagram_url ? (
        <a
          href={lead.instagram_url}
          target="_blank"
          rel="noreferrer"
          className="border border-line px-3 py-2 text-sm hover:border-ink"
        >
          Open Instagram
        </a>
      ) : null}
      {message ? (
        <p className="w-full text-sm text-ink-soft">{message}</p>
      ) : null}
    </div>
  );
}

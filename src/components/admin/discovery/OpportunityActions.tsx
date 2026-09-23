"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui";
import type { Lead } from "@/lib/leads/types";

const linkClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 bg-transparent px-5 text-[14px] font-medium tracking-tight text-ink transition duration-300 hover:border-ink/35";

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
      <AdminButton
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={rescore}
      >
        Recalculate score
      </AdminButton>
      {lead.google_maps_url ? (
        <a
          href={lead.google_maps_url}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
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
          className={linkClass}
        >
          Open website
        </a>
      ) : null}
      {lead.instagram_url ? (
        <a
          href={lead.instagram_url}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
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

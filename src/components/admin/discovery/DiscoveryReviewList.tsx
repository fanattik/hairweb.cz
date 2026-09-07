"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewRow = {
  id: string;
  match_reason: string | null;
  matched_lead_id: string | null;
  candidate: {
    name?: string;
    city?: string | null;
    rating?: number | null;
    reviewsCount?: number | null;
    website?: string | null;
  };
};

export function DiscoveryReviewList({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, action: "accept" | "reject") {
    setBusy(id);
    await fetch(`/api/admin/discovery/review/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    router.refresh();
  }

  if (!reviews.length) {
    return (
      <p className="text-sm text-ink-soft">Žádné položky ke kontrole.</p>
    );
  }

  return (
    <ul className="grid gap-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-foam p-4"
        >
          <div>
            <p className="font-medium">
              {review.candidate?.name || "Neznámý salon"}
            </p>
            <p className="text-sm text-ink-soft">
              {review.candidate?.city || "—"}
              {review.candidate?.rating != null
                ? ` · ${review.candidate.rating}★`
                : ""}
              {review.candidate?.reviewsCount != null
                ? ` · ${review.candidate.reviewsCount} recenzí`
                : ""}
            </p>
            <p className="mt-1 text-xs text-copper-deep">
              {review.match_reason}
              {review.matched_lead_id
                ? ` → lead ${review.matched_lead_id.slice(0, 8)}…`
                : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy === review.id}
              onClick={() => act(review.id, "accept")}
              className="bg-ink px-3 py-1.5 text-xs text-foam"
            >
              Přijmout
            </button>
            <button
              type="button"
              disabled={busy === review.id}
              onClick={() => act(review.id, "reject")}
              className="border border-line px-3 py-1.5 text-xs"
            >
              Zamítnout
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

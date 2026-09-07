import type { InstagramQuality } from "@/lib/leads/types";

/**
 * Suggest Instagram quality for admin review.
 * Based on followers + media volume — not a final score.
 */
export function suggestInstagramQuality(input: {
  followers: number | null;
  mediaCount: number | null;
}): InstagramQuality {
  const followers = input.followers ?? 0;
  const media = input.mediaCount ?? 0;

  if (followers >= 8000 && media >= 40) return "excellent";
  if (followers >= 2500 && media >= 20) return "good";
  if (followers >= 800 || media >= 40) return "good";
  if (followers >= 250 || media >= 15) return "average";
  return "poor";
}

export function suggestInstagramActive(input: {
  followers: number | null;
  mediaCount: number | null;
}): boolean {
  const followers = input.followers ?? 0;
  const media = input.mediaCount ?? 0;
  return media >= 8 || followers >= 300;
}

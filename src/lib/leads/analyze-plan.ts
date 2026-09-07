import type { Lead } from "@/lib/leads/types";

export type AnalyzePlan = {
  google: boolean;
  instagram: boolean;
  web: boolean;
};

export function planLeadAnalysis(
  lead: Pick<
    Lead,
    | "website"
    | "instagram_handle"
    | "instagram_url"
    | "google_place_id"
    | "google_maps_url"
    | "salon_name"
    | "city"
  >,
): AnalyzePlan {
  const hasWebsite = Boolean(
    lead.website?.trim() && lead.website.trim() !== "—",
  );
  const hasIg = Boolean(lead.instagram_handle || lead.instagram_url);
  const hasGoogleSignal = Boolean(
    lead.google_place_id ||
      lead.google_maps_url ||
      lead.salon_name?.trim() ||
      lead.city?.trim(),
  );

  return {
    google: hasGoogleSignal,
    instagram: hasIg,
    web: hasWebsite,
  };
}

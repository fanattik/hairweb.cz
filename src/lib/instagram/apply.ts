import type { InstagramSnapshot } from "@/lib/instagram/client";
import type { InstagramQuality, Lead } from "@/lib/leads/types";

export type InstagramEnrichPatch = {
  instagram_handle: string;
  instagram_url: string;
  instagram_followers: number | null;
  instagram_media_count: number | null;
  instagram_name: string | null;
  instagram_biography: string | null;
  instagram_suggested_quality: InstagramQuality;
  instagram_active?: boolean | null;
  instagram_quality?: InstagramQuality | null;
  website?: string | null;
  has_website?: boolean | null;
  enrichment_source: "instagram";
  enrichment_status: "done";
  enrichment_error: null;
  last_enriched_at: string;
};

function isBlank(value: string | null | undefined) {
  return value == null || value.trim() === "" || value.trim() === "—";
}

/**
 * Merge Instagram snapshot into lead fields.
 * Handle/url/followers/media always update from enrichment.
 * Active/quality: fill when empty, or always when overwrite.
 * Website from IG bio site: fill only when blank (unless overwrite).
 */
export function buildInstagramEnrichPatch(
  lead: Pick<
    Lead,
    | "instagram_active"
    | "instagram_quality"
    | "website"
    | "has_website"
  >,
  profile: InstagramSnapshot,
  options?: { overwrite?: boolean },
): InstagramEnrichPatch {
  const overwrite = options?.overwrite === true;

  const patch: InstagramEnrichPatch = {
    instagram_handle: profile.handle,
    instagram_url: profile.url,
    instagram_followers: profile.followers,
    instagram_media_count: profile.mediaCount,
    instagram_name: profile.name,
    instagram_biography: profile.biography,
    instagram_suggested_quality: profile.suggestedQuality,
    enrichment_source: "instagram",
    enrichment_status: "done",
    enrichment_error: null,
    last_enriched_at: new Date().toISOString(),
  };

  if (overwrite || lead.instagram_active == null) {
    patch.instagram_active = profile.suggestedActive;
  }

  if (overwrite || lead.instagram_quality == null) {
    patch.instagram_quality = profile.suggestedQuality;
  }

  if (profile.website && (overwrite || isBlank(lead.website))) {
    patch.website = profile.website;
    patch.has_website = true;
  }

  return patch;
}

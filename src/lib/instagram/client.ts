import {
  instagramProfileUrl,
  normalizeInstagramHandle,
  parseInstagramInput,
} from "@/lib/instagram/parse";
import {
  suggestInstagramActive,
  suggestInstagramQuality,
} from "@/lib/instagram/suggest";
import type { InstagramQuality } from "@/lib/leads/types";

export type InstagramSnapshot = {
  handle: string;
  url: string;
  name: string | null;
  biography: string | null;
  website: string | null;
  followers: number | null;
  mediaCount: number | null;
  suggestedActive: boolean;
  suggestedQuality: InstagramQuality;
  source: "meta_graph" | "normalize_only";
};

type BusinessDiscoveryPayload = {
  business_discovery?: {
    username?: string;
    name?: string | null;
    biography?: string | null;
    website?: string | null;
    followers_count?: number;
    media_count?: number;
  };
  error?: { message?: string; code?: number; error_subcode?: number };
};

function requireMetaConfig() {
  const token = process.env.META_GRAPH_ACCESS_TOKEN?.trim();
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
  if (!token || !igUserId) {
    return null;
  }
  return { token, igUserId };
}

export function isInstagramGraphConfigured() {
  return requireMetaConfig() != null;
}

async function fetchBusinessDiscovery(
  handle: string,
): Promise<InstagramSnapshot> {
  const config = requireMetaConfig();
  if (!config) {
    throw new Error(
      "Chybí META_GRAPH_ACCESS_TOKEN nebo INSTAGRAM_BUSINESS_ACCOUNT_ID.",
    );
  }

  const fields = [
    "username",
    "name",
    "biography",
    "website",
    "followers_count",
    "media_count",
  ].join(",");

  const url = new URL(`https://graph.facebook.com/v21.0/${config.igUserId}`);
  url.searchParams.set(
    "fields",
    `business_discovery.username(${handle}){${fields}}`,
  );
  url.searchParams.set("access_token", config.token);

  const response = await fetch(url, { cache: "no-store" });
  const json = (await response.json()) as BusinessDiscoveryPayload;

  if (!response.ok || json.error) {
    throw new Error(
      json.error?.message ||
        `Instagram Graph error (${response.status}). Účet musí být profesionální (Business/Creator).`,
    );
  }

  const discovery = json.business_discovery;
  if (!discovery) {
    throw new Error("Business Discovery nevrátilo data pro tento handle.");
  }

  const followers =
    typeof discovery.followers_count === "number"
      ? discovery.followers_count
      : null;
  const mediaCount =
    typeof discovery.media_count === "number" ? discovery.media_count : null;
  const resolvedHandle = normalizeInstagramHandle(discovery.username) || handle;

  return {
    handle: resolvedHandle,
    url: instagramProfileUrl(resolvedHandle),
    name: discovery.name?.trim() || null,
    biography: discovery.biography?.trim() || null,
    website: discovery.website?.trim() || null,
    followers,
    mediaCount,
    suggestedActive: suggestInstagramActive({ followers, mediaCount }),
    suggestedQuality: suggestInstagramQuality({ followers, mediaCount }),
    source: "meta_graph",
  };
}

/**
 * Resolve Instagram profile data.
 * With Meta credentials → Business Discovery.
 * Without → normalize handle/url only (admin fills the rest).
 */
export async function resolveInstagramProfile(input: {
  handle?: string | null;
  url?: string | null;
  requireGraph?: boolean;
}): Promise<InstagramSnapshot> {
  const parsed = parseInstagramInput({
    handle: input.handle,
    url: input.url,
  });
  if (!parsed) {
    throw new Error("Zadej platný Instagram handle nebo URL profilu.");
  }

  if (isInstagramGraphConfigured()) {
    return fetchBusinessDiscovery(parsed.handle);
  }

  if (input.requireGraph) {
    throw new Error(
      "Instagram Graph není nastavený. Přidej META_GRAPH_ACCESS_TOKEN a INSTAGRAM_BUSINESS_ACCOUNT_ID.",
    );
  }

  return {
    handle: parsed.handle,
    url: parsed.url,
    name: null,
    biography: null,
    website: null,
    followers: null,
    mediaCount: null,
    suggestedActive: true,
    suggestedQuality: "average",
    source: "normalize_only",
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizePhone,
  normalizeSalonName,
  normalizeWebsite,
} from "@/lib/leads/import/normalize";
import type { DiscoveredPlace, DuplicateMatchKind } from "@/lib/discovery/types";

export type DuplicateCandidate = {
  googlePlaceId?: string | null;
  phone?: string | null;
  website?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
};

export type DuplicateHit = {
  leadId: string;
  salonName: string | null;
  city: string | null;
  field: string;
};

export type DuplicateResult = {
  kind: DuplicateMatchKind;
  match: DuplicateHit | null;
  reason: string | null;
};

type LeadHit = {
  id: string;
  salon_name: string | null;
  city: string | null;
  google_place_id: string | null;
  website_domain: string | null;
  phone_normalized: string | null;
  salon_name_normalized: string | null;
  address: string | null;
};

function toHit(row: LeadHit, field: string): DuplicateHit {
  return {
    leadId: row.id,
    salonName: row.salon_name,
    city: row.city,
    field,
  };
}

function normalizeAddress(value: string | null | undefined) {
  if (!value) return null;
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Duplicate detection for discovery candidates.
 * exact_match → skip create
 * probable_match → review queue
 * no_match → create
 */
export async function findPotentialDuplicate(
  supabase: SupabaseClient,
  candidate: DuplicateCandidate,
): Promise<DuplicateResult> {
  const placeId = candidate.googlePlaceId?.trim() || null;
  const phone = normalizePhone(candidate.phone);
  const { domain } = normalizeWebsite(candidate.website);
  const nameNorm = normalizeSalonName(candidate.name);
  const addressNorm = normalizeAddress(candidate.address);

  if (placeId) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, salon_name_normalized, address",
      )
      .eq("google_place_id", placeId)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        kind: "exact_match",
        match: toHit(data as LeadHit, "google_place_id"),
        reason: "Stejné Google Place ID",
      };
    }
  }

  if (phone) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, salon_name_normalized, address",
      )
      .eq("phone_normalized", phone)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        kind: "exact_match",
        match: toHit(data as LeadHit, "phone_normalized"),
        reason: "Stejný telefon",
      };
    }
  }

  if (domain) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, salon_name_normalized, address",
      )
      .eq("website_domain", domain)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        kind: "exact_match",
        match: toHit(data as LeadHit, "website_domain"),
        reason: "Stejná doména webu",
      };
    }
  }

  if (nameNorm && addressNorm) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, salon_name_normalized, address",
      )
      .eq("salon_name_normalized", nameNorm)
      .limit(20);

    const rows = (data || []) as LeadHit[];
    const hit = rows.find((row) => {
      const existing = normalizeAddress(row.address);
      return existing && existing === addressNorm;
    });
    if (hit) {
      return {
        kind: "exact_match",
        match: toHit(hit, "name_address"),
        reason: "Stejný název + adresa",
      };
    }
  }

  // Probable: same normalized name + same city
  if (nameNorm && candidate.city) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, salon_name_normalized, address",
      )
      .eq("salon_name_normalized", nameNorm)
      .ilike("city", candidate.city)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        kind: "probable_match",
        match: toHit(data as LeadHit, "name_city"),
        reason: "Stejný název + město (pravděpodobná duplicita)",
      };
    }
  }

  return { kind: "no_match", match: null, reason: null };
}

export function discoveredToDuplicateCandidate(
  place: DiscoveredPlace,
): DuplicateCandidate {
  return {
    googlePlaceId: place.googlePlaceId,
    phone: place.phone,
    website: place.website,
    name: place.name,
    address: place.address,
    city: place.city,
  };
}

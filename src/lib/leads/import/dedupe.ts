import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DuplicateMatch,
  DuplicateResult,
  NormalizedLead,
} from "@/lib/leads/import/types";

type LeadHit = {
  id: string;
  salon_name: string | null;
  city: string | null;
  google_place_id: string | null;
  website_domain: string | null;
  phone_normalized: string | null;
  email_normalized: string | null;
  salon_name_normalized: string | null;
};

/**
 * Find an existing lead match. Order: place id → domain → phone → email → salon+city.
 */
export async function findDuplicateLead(
  supabase: SupabaseClient,
  lead: NormalizedLead,
): Promise<DuplicateResult> {
  if (lead.google_place_id) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
      )
      .eq("google_place_id", lead.google_place_id)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        match: toMatch(data as LeadHit, "google_place_id", "exact"),
      };
    }
  }

  if (lead.website_domain) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
      )
      .eq("website_domain", lead.website_domain)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        match: toMatch(data as LeadHit, "website_domain", "exact"),
      };
    }
  }

  if (lead.phone_normalized) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
      )
      .eq("phone_normalized", lead.phone_normalized)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        match: toMatch(data as LeadHit, "phone_normalized", "exact"),
      };
    }
  }

  if (lead.email_normalized) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
      )
      .eq("email_normalized", lead.email_normalized)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        match: toMatch(data as LeadHit, "email_normalized", "exact"),
      };
    }
  }

  if (lead.salon_name_normalized && lead.city) {
    const { data } = await supabase
      .from("leads")
      .select(
        "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
      )
      .eq("salon_name_normalized", lead.salon_name_normalized)
      .ilike("city", lead.city)
      .limit(1)
      .maybeSingle();
    if (data) {
      return {
        match: toMatch(data as LeadHit, "salon_city", "possible"),
      };
    }
  }

  return { match: null };
}

/**
 * Batch preload candidates for faster preview (domains/phones/emails/place ids).
 */
export async function preloadDuplicateIndex(
  supabase: SupabaseClient,
  leads: NormalizedLead[],
): Promise<Map<string, LeadHit>> {
  const index = new Map<string, LeadHit>();

  const placeIds = unique(leads.map((l) => l.google_place_id));
  const domains = unique(leads.map((l) => l.website_domain));
  const phones = unique(leads.map((l) => l.phone_normalized));
  const emails = unique(leads.map((l) => l.email_normalized));

  const chunks: Array<Promise<void>> = [];

  const load = async (column: string, values: string[]) => {
    for (let i = 0; i < values.length; i += 200) {
      const slice = values.slice(i, i + 200);
      const { data } = await supabase
        .from("leads")
        .select(
          "id, salon_name, city, google_place_id, website_domain, phone_normalized, email_normalized, salon_name_normalized",
        )
        .in(column, slice);
      for (const row of (data || []) as LeadHit[]) {
        if (row.google_place_id) index.set(`place:${row.google_place_id}`, row);
        if (row.website_domain) index.set(`domain:${row.website_domain}`, row);
        if (row.phone_normalized) index.set(`phone:${row.phone_normalized}`, row);
        if (row.email_normalized) index.set(`email:${row.email_normalized}`, row);
        if (row.salon_name_normalized && row.city) {
          index.set(
            `salon:${row.salon_name_normalized}|${row.city.toLowerCase()}`,
            row,
          );
        }
      }
    }
  };

  if (placeIds.length) chunks.push(load("google_place_id", placeIds));
  if (domains.length) chunks.push(load("website_domain", domains));
  if (phones.length) chunks.push(load("phone_normalized", phones));
  if (emails.length) chunks.push(load("email_normalized", emails));
  await Promise.all(chunks);

  return index;
}

export function matchFromIndex(
  lead: NormalizedLead,
  index: Map<string, LeadHit>,
): DuplicateResult {
  if (lead.google_place_id) {
    const hit = index.get(`place:${lead.google_place_id}`);
    if (hit) return { match: toMatch(hit, "google_place_id", "exact") };
  }
  if (lead.website_domain) {
    const hit = index.get(`domain:${lead.website_domain}`);
    if (hit) return { match: toMatch(hit, "website_domain", "exact") };
  }
  if (lead.phone_normalized) {
    const hit = index.get(`phone:${lead.phone_normalized}`);
    if (hit) return { match: toMatch(hit, "phone_normalized", "exact") };
  }
  if (lead.email_normalized) {
    const hit = index.get(`email:${lead.email_normalized}`);
    if (hit) return { match: toMatch(hit, "email_normalized", "exact") };
  }
  if (lead.salon_name_normalized && lead.city) {
    const hit = index.get(
      `salon:${lead.salon_name_normalized}|${lead.city.toLowerCase()}`,
    );
    if (hit) return { match: toMatch(hit, "salon_city", "possible") };
  }
  return { match: null };
}

function toMatch(
  hit: LeadHit,
  reason: DuplicateMatch["reason"],
  confidence: DuplicateMatch["confidence"],
): DuplicateMatch {
  return {
    leadId: hit.id,
    reason,
    confidence,
    salonName: hit.salon_name,
    city: hit.city,
  };
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

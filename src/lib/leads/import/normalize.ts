import { normalizeInstagramHandle } from "@/lib/instagram/parse";
import type { NormalizedLead } from "@/lib/leads/import/types";

export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length ? cleaned : null;
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const cleaned = cleanText(value)?.toLowerCase() ?? null;
  if (!cleaned) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return null;
  return cleaned;
}

export function normalizePhone(
  value: string | null | undefined,
  defaultCountry = "CZ",
): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  let digits = cleaned.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;

  const onlyDigits = digits.replace(/\D/g, "");

  if (digits.startsWith("+") && onlyDigits.length >= 10 && onlyDigits.length <= 15) {
    return `+${onlyDigits}`;
  }

  if (defaultCountry === "CZ") {
    if (onlyDigits.length === 9) return `+420${onlyDigits}`;
    if (onlyDigits.length === 12 && onlyDigits.startsWith("420")) {
      return `+${onlyDigits}`;
    }
  }

  // Ambiguous — keep cleaned original rather than inventing a country code.
  return cleaned;
}

export function normalizeWebsite(value: string | null | undefined): {
  website: string | null;
  domain: string | null;
} {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned === "—") return { website: null, domain: null };
  if (cleaned.startsWith("@") || /instagram\.com/i.test(cleaned)) {
    return { website: null, domain: null };
  }

  let raw = cleaned;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".")) return { website: null, domain: null };
    url.hash = "";
    const website = url.toString().replace(/\/$/, "");
    const domain = url.hostname.replace(/^www\./i, "").toLowerCase();
    return { website, domain };
  } catch {
    return { website: null, domain: null };
  }
}

export function normalizeSalonName(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  return cleaned
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeInstagram(value: string | null | undefined): {
  handle: string | null;
  url: string | null;
} {
  const cleaned = cleanText(value);
  if (!cleaned) return { handle: null, url: null };
  const handle = normalizeInstagramHandle(cleaned);
  if (!handle) return { handle: null, url: null };
  const normalized = handle.toLowerCase();
  return {
    handle: normalized,
    url: `https://www.instagram.com/${normalized}/`,
  };
}

export function normalizeFacebook(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/facebook\.com|fb\.com/i.test(cleaned)) return `https://${cleaned.replace(/^\/+/, "")}`;
  return `https://www.facebook.com/${cleaned.replace(/^@/, "")}`;
}

function parseNumber(value: string | null | undefined): number | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const n = Number(cleaned.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Map raw row + column mapping into a NormalizedLead.
 */
export function normalizeImportRow(
  raw: Record<string, string | null>,
  mapped: Partial<Record<string, string | null>>,
): NormalizedLead {
  const salon_name = cleanText(mapped.salon_name);
  const contact_person = cleanText(mapped.contact_person);
  const name =
    cleanText(mapped.name) ||
    contact_person ||
    salon_name ||
    "Neznámý kontakt";

  const email = normalizeEmail(mapped.email);
  const phoneRaw = cleanText(mapped.phone);
  const phone_normalized = normalizePhone(mapped.phone);
  const { website, domain } = normalizeWebsite(mapped.website);
  const ig = normalizeInstagram(mapped.instagram);

  const typeRaw = cleanText(mapped.type)?.toLowerCase();
  const type =
    typeRaw === "inbound" || typeRaw === "inbound lead"
      ? "inbound"
      : "outbound";

  return {
    salon_name,
    type,
    contact_person,
    name,
    email,
    email_normalized: email,
    phone: phone_normalized || phoneRaw,
    phone_normalized,
    website,
    website_domain: domain,
    has_website: website ? true : false,
    instagram_handle: ig.handle,
    instagram_url: ig.url,
    facebook_url: normalizeFacebook(mapped.facebook_url),
    address: cleanText(mapped.address),
    city: cleanText(mapped.city),
    postal_code: cleanText(mapped.postal_code),
    region: cleanText(mapped.region),
    country: cleanText(mapped.country) || "Česko",
    google_maps_url: cleanText(mapped.google_maps_url),
    google_place_id: cleanText(mapped.google_place_id),
    google_rating: parseNumber(mapped.google_rating),
    google_reviews_count: parseNumber(mapped.google_reviews_count)
      ? Math.round(parseNumber(mapped.google_reviews_count)!)
      : null,
    notes: cleanText(mapped.notes),
    source_detail: cleanText(mapped.source_detail),
    source_url: cleanText(mapped.source_url),
    salon_name_normalized: normalizeSalonName(salon_name),
    raw_import_data: raw,
  };
}

/** Apply header→field mapping to a raw object keyed by headers. */
export function applyColumnMapping(
  raw: Record<string, string | null>,
  mapping: Record<string, string>,
): Partial<Record<string, string | null>> {
  const out: Partial<Record<string, string | null>> = {};
  for (const [header, field] of Object.entries(mapping)) {
    if (!field || field === "ignore") continue;
    const value = raw[header] ?? null;
    // First mapped header wins if duplicates.
    if (out[field] == null || out[field] === "") {
      out[field] = value;
    }
  }
  return out;
}

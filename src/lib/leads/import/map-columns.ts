import {
  IMPORT_TARGET_FIELDS,
  type ImportTargetField,
} from "@/lib/leads/import/types";

const ALIASES: Record<ImportTargetField, string[]> = {
  ignore: [],
  salon_name: [
    "company",
    "company_name",
    "business",
    "business_name",
    "salon",
    "salon_name",
    "name",
    "nazev",
    "název",
    "firma",
    "title",
  ],
  type: ["type", "lead_type", "typ"],
  contact_person: [
    "contact",
    "contact_person",
    "contact_name",
    "person",
    "kontakt",
    "jmeno",
    "jméno",
  ],
  name: ["crm_name", "owner", "majitel"],
  email: ["email", "e-mail", "mail", "e_mail"],
  phone: [
    "phone",
    "telephone",
    "tel",
    "mobile",
    "telefon",
    "phone_number",
  ],
  website: [
    "website",
    "web",
    "url",
    "site",
    "homepage",
    "domain",
    "www",
  ],
  instagram: ["instagram", "ig", "insta", "instagram_url", "instagram_handle"],
  facebook_url: ["facebook", "fb", "facebook_url"],
  address: ["address", "adresa", "street", "ulice"],
  city: ["city", "mesto", "město", "town"],
  postal_code: ["postal_code", "zip", "psc", "psč", "postcode"],
  region: ["region", "kraj", "state", "county"],
  country: ["country", "zeme", "země"],
  google_maps_url: [
    "google_maps",
    "google_maps_url",
    "maps_url",
    "maps",
    "gmaps",
  ],
  google_place_id: ["google_place_id", "place_id", "placeid"],
  google_rating: ["google_rating", "rating", "stars", "hodnoceni", "hodnocení"],
  google_reviews_count: [
    "google_reviews",
    "reviews",
    "reviews_count",
    "recenze",
    "review_count",
  ],
  notes: ["notes", "note", "poznamka", "poznámka", "comment", "comments"],
  source_detail: ["source", "source_detail", "zdroj"],
  source_url: ["source_url", "listing_url", "origin_url"],
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Suggest target field mapping from CSV/XLSX headers.
 * First unused match wins; `name` alias prefers salon_name unless already taken.
 */
export function suggestColumnMapping(
  headers: string[],
): Record<string, ImportTargetField> {
  const used = new Set<ImportTargetField>();
  const mapping: Record<string, ImportTargetField> = {};

  for (const header of headers) {
    const key = normalizeHeader(header);
    let matched: ImportTargetField = "ignore";

    for (const field of IMPORT_TARGET_FIELDS) {
      if (field === "ignore" || used.has(field)) continue;
      if (ALIASES[field].includes(key) || key === field) {
        matched = field;
        break;
      }
    }

    // Prefer salon_name over CRM name for generic "name"
    if (matched === "name" && !used.has("salon_name") && key === "name") {
      matched = "salon_name";
    }

    if (matched !== "ignore") used.add(matched);
    mapping[header] = matched;
  }

  return mapping;
}

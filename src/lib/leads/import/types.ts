/**
 * Bulk lead import — shared types (UI + pipeline).
 */

export const IMPORT_METHODS = ["csv", "xlsx", "paste"] as const;
export type ImportMethod = (typeof IMPORT_METHODS)[number];

export const LEAD_SOURCE_TYPES = [
  "google_maps",
  "firmy_cz",
  "instagram",
  "manual",
  "csv",
  "xlsx",
  "other",
] as const;
export type LeadSourceType = (typeof LEAD_SOURCE_TYPES)[number];

export const LEAD_GRADES = ["A", "B", "C", "D"] as const;
export type LeadGrade = (typeof LEAD_GRADES)[number];

export const IMPORT_SESSION_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;
export type ImportSessionStatus = (typeof IMPORT_SESSION_STATUSES)[number];

export const IMPORT_ROW_STATUSES = [
  "new",
  "duplicate",
  "possible_duplicate",
  "invalid",
] as const;
export type ImportRowStatus = (typeof IMPORT_ROW_STATUSES)[number];

export const IMPORT_ITEM_STATUSES = [
  "created",
  "updated",
  "duplicate",
  "skipped",
  "invalid",
  "failed",
] as const;
export type ImportItemStatus = (typeof IMPORT_ITEM_STATUSES)[number];

export const DUPLICATE_ACTIONS = [
  "skip",
  "update",
  "fill_blank",
] as const;
export type DuplicateAction = (typeof DUPLICATE_ACTIONS)[number];

/** Mappable target fields for column mapping UI. */
export const IMPORT_TARGET_FIELDS = [
  "ignore",
  "salon_name",
  "type",
  "contact_person",
  "name",
  "email",
  "phone",
  "website",
  "instagram",
  "facebook_url",
  "address",
  "city",
  "postal_code",
  "region",
  "country",
  "google_maps_url",
  "google_place_id",
  "google_rating",
  "google_reviews_count",
  "notes",
  "source_detail",
  "source_url",
] as const;
export type ImportTargetField = (typeof IMPORT_TARGET_FIELDS)[number];

export const IMPORT_TARGET_LABELS: Record<ImportTargetField, string> = {
  ignore: "Ignorovat",
  salon_name: "Název firmy / salonu",
  type: "Typ leadu",
  contact_person: "Jméno kontaktní osoby",
  name: "Jméno (CRM)",
  email: "E-mail",
  phone: "Telefon",
  website: "Web",
  instagram: "Instagram",
  facebook_url: "Facebook",
  address: "Adresa",
  city: "Město",
  postal_code: "PSČ",
  region: "Kraj / region",
  country: "Země",
  google_maps_url: "Google Maps URL",
  google_place_id: "Google Place ID",
  google_rating: "Google rating",
  google_reviews_count: "Počet Google recenzí",
  notes: "Poznámka",
  source_detail: "Zdroj (detail)",
  source_url: "URL zdroje",
};

export type ImportRow = {
  rowNumber: number;
  raw: Record<string, string | null>;
};

export type NormalizedLead = {
  salon_name: string | null;
  type: "inbound" | "outbound";
  contact_person: string | null;
  name: string;
  email: string | null;
  email_normalized: string | null;
  phone: string | null;
  phone_normalized: string | null;
  website: string | null;
  website_domain: string | null;
  has_website: boolean | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  country: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  notes: string | null;
  source_detail: string | null;
  source_url: string | null;
  salon_name_normalized: string | null;
  raw_import_data: Record<string, string | null>;
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  fieldErrors: Partial<Record<keyof NormalizedLead, string>>;
};

export type DuplicateMatch = {
  leadId: string;
  reason:
    | "google_place_id"
    | "website_domain"
    | "phone_normalized"
    | "email_normalized"
    | "salon_city";
  confidence: "exact" | "possible";
  salonName: string | null;
  city: string | null;
};

export type DuplicateResult = {
  match: DuplicateMatch | null;
};

export type PreparedImportRow = {
  rowNumber: number;
  raw: Record<string, string | null>;
  normalized: NormalizedLead;
  validation: ValidationResult;
  duplicate: DuplicateResult;
  status: ImportRowStatus;
  suggestedAction: DuplicateAction | "create";
};

export type ImportPreviewSummary = {
  total: number;
  newCount: number;
  duplicateCount: number;
  possibleDuplicateCount: number;
  invalidCount: number;
};

export type ImportExecuteResult = {
  importId: string;
  total: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  failedCount: number;
};

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: string[][];
};

export type ParsedImportPayload = {
  method: ImportMethod;
  fileName: string | null;
  sheets: ParsedSheet[];
  activeSheet: string;
  headers: string[];
  /** First ~ preview rows as objects keyed by header */
  previewRows: ImportRow[];
  allRows: ImportRow[];
  delimiter?: string;
};

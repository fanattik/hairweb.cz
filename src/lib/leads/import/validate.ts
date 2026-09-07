import type { NormalizedLead, ValidationResult } from "@/lib/leads/import/types";

export function validateNormalizedLead(
  lead: NormalizedLead,
): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: ValidationResult["fieldErrors"] = {};

  if (!lead.salon_name) {
    errors.push("Chybí název firmy / salonu");
    fieldErrors.salon_name = "Povinné";
  }

  const hasIdentifier = Boolean(
    lead.website ||
      lead.phone ||
      lead.email ||
      lead.google_place_id ||
      lead.google_maps_url ||
      lead.instagram_handle,
  );

  if (!hasIdentifier) {
    errors.push(
      "Chybí identifikátor (web, telefon, e-mail, Google Place/Maps nebo Instagram)",
    );
  }

  // Soft field issues — strip bad values rather than fail whole row when other IDs exist.
  if (lead.raw_import_data) {
    // email already null if invalid via normalizer
  }

  return {
    ok: errors.length === 0,
    errors,
    fieldErrors,
  };
}

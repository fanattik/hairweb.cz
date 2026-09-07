import {
  applyColumnMapping,
  normalizeImportRow,
} from "@/lib/leads/import/normalize";
import { matchFromIndex, preloadDuplicateIndex } from "@/lib/leads/import/dedupe";
import { validateNormalizedLead } from "@/lib/leads/import/validate";
import type {
  DuplicateAction,
  ImportPreviewSummary,
  ImportRow,
  ImportRowStatus,
  PreparedImportRow,
} from "@/lib/leads/import/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function prepareImportRows(
  supabase: SupabaseClient,
  rows: ImportRow[],
  mapping: Record<string, string>,
  defaultDuplicateAction: DuplicateAction = "fill_blank",
): Promise<{ rows: PreparedImportRow[]; summary: ImportPreviewSummary }> {
  const normalizedRows = rows.map((row) => {
    const mapped = applyColumnMapping(row.raw, mapping);
    const normalized = normalizeImportRow(row.raw, mapped);
    const validation = validateNormalizedLead(normalized);
    return { row, normalized, validation };
  });

  const index = await preloadDuplicateIndex(
    supabase,
    normalizedRows.map((item) => item.normalized),
  );

  const prepared: PreparedImportRow[] = normalizedRows.map((item) => {
    if (!item.validation.ok) {
      return {
        rowNumber: item.row.rowNumber,
        raw: item.row.raw,
        normalized: item.normalized,
        validation: item.validation,
        duplicate: { match: null },
        status: "invalid" as ImportRowStatus,
        suggestedAction: "create",
      };
    }

    const duplicate = matchFromIndex(item.normalized, index);
    let status: ImportRowStatus = "new";
    let suggestedAction: DuplicateAction | "create" = "create";

    if (duplicate.match) {
      status =
        duplicate.match.confidence === "possible"
          ? "possible_duplicate"
          : "duplicate";
      suggestedAction = defaultDuplicateAction;
    }

    return {
      rowNumber: item.row.rowNumber,
      raw: item.row.raw,
      normalized: item.normalized,
      validation: item.validation,
      duplicate,
      status,
      suggestedAction,
    };
  });

  const summary: ImportPreviewSummary = {
    total: prepared.length,
    newCount: prepared.filter((r) => r.status === "new").length,
    duplicateCount: prepared.filter((r) => r.status === "duplicate").length,
    possibleDuplicateCount: prepared.filter(
      (r) => r.status === "possible_duplicate",
    ).length,
    invalidCount: prepared.filter((r) => r.status === "invalid").length,
  };

  return { rows: prepared, summary };
}

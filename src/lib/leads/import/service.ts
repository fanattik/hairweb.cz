import type { SupabaseClient } from "@supabase/supabase-js";
import { findDuplicateLead } from "@/lib/leads/import/dedupe";
import type {
  DuplicateAction,
  ImportExecuteResult,
  ImportMethod,
  LeadSourceType,
  NormalizedLead,
  PreparedImportRow,
} from "@/lib/leads/import/types";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import { leadGradeFromScore } from "@/lib/leads/scoring";
import type { Lead } from "@/lib/leads/types";

const BATCH = 40;

function isBlank(value: unknown) {
  if (value == null) return true;
  if (typeof value === "string") {
    const t = value.trim();
    return !t || t === "—";
  }
  return false;
}

function leadInsertFromNormalized(
  lead: NormalizedLead,
  meta: {
    sourceType: LeadSourceType;
    sourceName: string | null;
    sourceUrl: string | null;
    importMethod: ImportMethod;
  },
) {
  const website = lead.website || "—";
  const email = lead.email || "—";

  const base = {
    type: lead.type,
    name: lead.name,
    salon_name: lead.salon_name,
    email,
    phone: lead.phone,
    website,
    notes: lead.notes,
    status: "new" as const,
    source: meta.importMethod,
    source_detail: lead.source_detail,
    source_type: meta.sourceType,
    source_name: meta.sourceName,
    source_url: lead.source_url || meta.sourceUrl,
    contact_person: lead.contact_person,
    city: lead.city,
    region: lead.region,
    address: lead.address,
    postal_code: lead.postal_code,
    country: lead.country,
    facebook_url: lead.facebook_url,
    website_domain: lead.website_domain,
    phone_normalized: lead.phone_normalized,
    email_normalized: lead.email_normalized,
    salon_name_normalized: lead.salon_name_normalized,
    has_website: lead.has_website ?? (lead.website ? true : false),
    google_maps_url: lead.google_maps_url,
    google_place_id: lead.google_place_id,
    google_rating: lead.google_rating,
    google_reviews_count: lead.google_reviews_count,
    instagram_handle: lead.instagram_handle,
    instagram_url: lead.instagram_url,
    raw_import_data: lead.raw_import_data,
  };

  const scores = scoredColumnsFromInput(leadToScoreInput(base as Partial<Lead>), {
    enrichmentSource: "import",
  });

  const grade =
    scores.lead_score != null ? leadGradeFromScore(scores.lead_score) : null;

  return { ...base, ...scores, lead_grade: grade };
}

function fillBlankPatch(existing: Lead, incoming: NormalizedLead) {
  const patch: Record<string, unknown> = {};
  const pairs: Array<[keyof Lead | string, unknown]> = [
    ["salon_name", incoming.salon_name],
    ["contact_person", incoming.contact_person],
    ["phone", incoming.phone],
    ["phone_normalized", incoming.phone_normalized],
    ["email", incoming.email],
    ["email_normalized", incoming.email_normalized],
    ["website", incoming.website],
    ["website_domain", incoming.website_domain],
    ["has_website", incoming.has_website],
    ["instagram_handle", incoming.instagram_handle],
    ["instagram_url", incoming.instagram_url],
    ["facebook_url", incoming.facebook_url],
    ["address", incoming.address],
    ["city", incoming.city],
    ["postal_code", incoming.postal_code],
    ["region", incoming.region],
    ["country", incoming.country],
    ["google_maps_url", incoming.google_maps_url],
    ["google_place_id", incoming.google_place_id],
    ["google_rating", incoming.google_rating],
    ["google_reviews_count", incoming.google_reviews_count],
    ["salon_name_normalized", incoming.salon_name_normalized],
  ];

  for (const [key, value] of pairs) {
    if (value == null || value === "") continue;
    const current = existing[key as keyof Lead];
    if (isBlank(current)) patch[key as string] = value;
  }

  // Never overwrite notes / status / opportunity_note / CRM history.
  if (!existing.raw_import_data && incoming.raw_import_data) {
    patch.raw_import_data = incoming.raw_import_data;
  }

  const merged = { ...existing, ...patch } as Lead;
  const scores = scoredColumnsFromInput(leadToScoreInput(merged), {
    enrichmentSource: existing.enrichment_source || "import",
  });
  Object.assign(patch, scores);
  if (scores.lead_score != null) {
    patch.lead_grade = leadGradeFromScore(scores.lead_score);
  }

  return patch;
}

function updateOverwritePatch(existing: Lead, incoming: NormalizedLead) {
  const patch: Record<string, unknown> = {
    salon_name: incoming.salon_name ?? existing.salon_name,
    contact_person: incoming.contact_person ?? existing.contact_person,
    phone: incoming.phone ?? existing.phone,
    phone_normalized: incoming.phone_normalized ?? existing.phone_normalized,
    website: incoming.website ?? existing.website,
    website_domain: incoming.website_domain ?? existing.website_domain,
    has_website: incoming.has_website ?? existing.has_website,
    instagram_handle: incoming.instagram_handle ?? existing.instagram_handle,
    instagram_url: incoming.instagram_url ?? existing.instagram_url,
    facebook_url: incoming.facebook_url ?? existing.facebook_url,
    address: incoming.address ?? existing.address,
    city: incoming.city ?? existing.city,
    postal_code: incoming.postal_code ?? existing.postal_code,
    region: incoming.region ?? existing.region,
    country: incoming.country ?? existing.country,
    google_maps_url: incoming.google_maps_url ?? existing.google_maps_url,
    google_place_id: incoming.google_place_id ?? existing.google_place_id,
    google_rating: incoming.google_rating ?? existing.google_rating,
    google_reviews_count:
      incoming.google_reviews_count ?? existing.google_reviews_count,
    salon_name_normalized:
      incoming.salon_name_normalized ?? existing.salon_name_normalized,
  };

  if (incoming.email && incoming.email !== "—") {
    patch.email = incoming.email;
    patch.email_normalized = incoming.email_normalized;
  }

  const merged = { ...existing, ...patch } as Lead;
  const scores = scoredColumnsFromInput(leadToScoreInput(merged), {
    enrichmentSource: existing.enrichment_source || "import",
  });
  Object.assign(patch, scores);
  if (scores.lead_score != null) {
    patch.lead_grade = leadGradeFromScore(scores.lead_score);
  }
  return patch;
}

export type ExecuteImportInput = {
  rows: PreparedImportRow[];
  actions: Record<number, DuplicateAction | "create">;
  mapping: Record<string, string>;
  meta: {
    fileName: string | null;
    importMethod: ImportMethod;
    sourceType: LeadSourceType;
    sourceName: string | null;
    sourceUrl: string | null;
    createdBy: string | null;
  };
};

export async function executeLeadImport(
  supabase: SupabaseClient,
  input: ExecuteImportInput,
): Promise<ImportExecuteResult> {
  const { data: session, error: sessionError } = await supabase
    .from("lead_imports")
    .insert({
      created_by: input.meta.createdBy,
      file_name: input.meta.fileName,
      import_method: input.meta.importMethod,
      source_type: input.meta.sourceType,
      source_name: input.meta.sourceName,
      source_url: input.meta.sourceUrl,
      total_rows: input.rows.length,
      status: "processing",
      column_mapping: input.mapping,
      options: { actions: input.actions },
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(sessionError?.message || "Nelze vytvořit import session.");
  }

  const importId = session.id as string;
  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let invalidCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < input.rows.length; i += BATCH) {
      const chunk = input.rows.slice(i, i + BATCH);
      const itemRows: Record<string, unknown>[] = [];

      for (const row of chunk) {
        const action =
          input.actions[row.rowNumber] ?? row.suggestedAction ?? "create";

        try {
          if (row.status === "invalid") {
            invalidCount += 1;
            itemRows.push({
              import_id: importId,
              lead_id: null,
              row_number: row.rowNumber,
              status: "invalid",
              action,
              raw_data: row.raw,
              normalized_data: row.normalized,
              error: row.validation.errors.join("; "),
            });
            continue;
          }

          // Re-check duplicate at write time for safety.
          let match = row.duplicate.match;
          const live = await findDuplicateLead(supabase, row.normalized);
          if (live.match) match = live.match;

          if (match && (action === "skip" || row.status !== "new")) {
            if (action === "skip") {
              skippedCount += 1;
              itemRows.push({
                import_id: importId,
                lead_id: match.leadId,
                row_number: row.rowNumber,
                status: "skipped",
                match_reason: match.reason,
                action: "skip",
                raw_data: row.raw,
                normalized_data: row.normalized,
              });
              continue;
            }

            const { data: existing } = await supabase
              .from("leads")
              .select("*")
              .eq("id", match.leadId)
              .maybeSingle();

            if (!existing) {
              // Fall through to create
            } else {
              const patch =
                action === "update"
                  ? updateOverwritePatch(existing as Lead, row.normalized)
                  : fillBlankPatch(existing as Lead, row.normalized);

              const { error: updateError } = await supabase
                .from("leads")
                .update(patch)
                .eq("id", match.leadId);

              if (updateError) throw new Error(updateError.message);

              updatedCount += 1;
              itemRows.push({
                import_id: importId,
                lead_id: match.leadId,
                row_number: row.rowNumber,
                status: "updated",
                match_reason: match.reason,
                action,
                raw_data: row.raw,
                normalized_data: row.normalized,
              });
              continue;
            }
          }

          if (match && action === "skip") {
            skippedCount += 1;
            itemRows.push({
              import_id: importId,
              lead_id: match.leadId,
              row_number: row.rowNumber,
              status: "duplicate",
              match_reason: match.reason,
              action: "skip",
              raw_data: row.raw,
              normalized_data: row.normalized,
            });
            continue;
          }

          const insertPayload = leadInsertFromNormalized(row.normalized, {
            sourceType: input.meta.sourceType,
            sourceName: input.meta.sourceName,
            sourceUrl: input.meta.sourceUrl,
            importMethod: input.meta.importMethod,
          });

          const { data: created, error: insertError } = await supabase
            .from("leads")
            .insert(insertPayload as Record<string, unknown>)
            .select("id")
            .single();

          if (insertError || !created) {
            throw new Error(insertError?.message || "Insert failed");
          }

          newCount += 1;
          itemRows.push({
            import_id: importId,
            lead_id: created.id,
            row_number: row.rowNumber,
            status: "created",
            action: "create",
            raw_data: row.raw,
            normalized_data: row.normalized,
          });
        } catch (error) {
          failedCount += 1;
          itemRows.push({
            import_id: importId,
            lead_id: null,
            row_number: row.rowNumber,
            status: "failed",
            action,
            raw_data: row.raw,
            normalized_data: row.normalized,
            error: error instanceof Error ? error.message : "Row failed",
          });
        }
      }

      if (itemRows.length) {
        const { error: itemsError } = await supabase
          .from("lead_import_items")
          .insert(itemRows);
        if (itemsError) {
          console.error("[import] items insert", itemsError);
        }
      }
    }

    await supabase
      .from("lead_imports")
      .update({
        status: "completed",
        new_count: newCount,
        updated_count: updatedCount,
        duplicate_count: skippedCount,
        skipped_count: skippedCount,
        invalid_count: invalidCount + failedCount,
        total_rows: input.rows.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", importId);

    return {
      importId,
      total: input.rows.length,
      newCount,
      updatedCount,
      skippedCount,
      invalidCount: invalidCount + failedCount,
      failedCount,
    };
  } catch (error) {
    await supabase
      .from("lead_imports")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : "Import failed",
        new_count: newCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
        invalid_count: invalidCount + failedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", importId);
    throw error;
  }
}

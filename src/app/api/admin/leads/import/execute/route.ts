import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { executeLeadImport } from "@/lib/leads/import/service";
import {
  DUPLICATE_ACTIONS,
  IMPORT_METHODS,
  LEAD_SOURCE_TYPES,
  type PreparedImportRow,
} from "@/lib/leads/import/types";

const bodySchema = z.object({
  rows: z.array(z.any()).min(1).max(10_000),
  actions: z.record(z.string(), z.enum([...DUPLICATE_ACTIONS, "create"] as const)),
  mapping: z.record(z.string(), z.string()),
  fileName: z.string().nullable().optional(),
  importMethod: z.enum(IMPORT_METHODS),
  sourceType: z.enum(LEAD_SOURCE_TYPES),
  sourceName: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const actions: Record<number, (typeof DUPLICATE_ACTIONS)[number] | "create"> =
    {};
  for (const [key, value] of Object.entries(parsed.data.actions)) {
    actions[Number(key)] = value;
  }

  try {
    const result = await executeLeadImport(supabase, {
      rows: parsed.data.rows as PreparedImportRow[],
      actions,
      mapping: parsed.data.mapping,
      meta: {
        fileName: parsed.data.fileName ?? null,
        importMethod: parsed.data.importMethod,
        sourceType: parsed.data.sourceType,
        sourceName: parsed.data.sourceName ?? null,
        sourceUrl: parsed.data.sourceUrl ?? null,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Import failed";
    console.error("[admin] import execute", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prepareImportRows } from "@/lib/leads/import/prepare";
import { DUPLICATE_ACTIONS } from "@/lib/leads/import/types";

const bodySchema = z.object({
  rows: z
    .array(
      z.object({
        rowNumber: z.number().int().positive(),
        raw: z.record(z.string(), z.string().nullable()),
      }),
    )
    .min(1)
    .max(10_000),
  mapping: z.record(z.string(), z.string()),
  defaultDuplicateAction: z.enum(DUPLICATE_ACTIONS).optional(),
});

/** Normalize + validate + dedupe preview (no writes). */
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

  try {
    const result = await prepareImportRows(
      supabase,
      parsed.data.rows,
      parsed.data.mapping,
      parsed.data.defaultDuplicateAction ?? "fill_blank",
    );

    return NextResponse.json({
      ok: true,
      summary: result.summary,
      rows: result.rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preview failed";
    console.error("[admin] import preview", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

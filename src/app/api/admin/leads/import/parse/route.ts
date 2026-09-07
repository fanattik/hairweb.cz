import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { suggestColumnMapping } from "@/lib/leads/import/map-columns";
import {
  parseCsvText,
  parsePasteText,
  parseXlsxArrayBuffer,
  selectSheet,
} from "@/lib/leads/import/parse";

/**
 * Parse uploaded CSV/XLSX (multipart) or pasted text (JSON).
 * Returns headers, preview rows, suggested mapping — full rows for client session.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const sheetName = String(form.get("sheet") || "");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Chybí soubor." }, { status: 400 });
      }

      const lower = file.name.toLowerCase();
      let payload =
        lower.endsWith(".xlsx") || lower.endsWith(".xls")
          ? parseXlsxArrayBuffer(await file.arrayBuffer(), file.name)
          : parseCsvText(await file.text(), file.name);

      if (sheetName) payload = selectSheet(payload, sheetName);

      return NextResponse.json({
        ok: true,
        payload: {
          ...payload,
          // Cap transferred rows for V1 safety (10k)
          allRows: payload.allRows.slice(0, 10_000),
        },
        suggestedMapping: suggestColumnMapping(payload.headers),
      });
    }

    const bodySchema = z.object({
      paste: z.string().min(1).optional(),
      sheet: z.string().optional(),
      // Re-select sheet from previously parsed sheets
      sheets: z
        .array(
          z.object({
            name: z.string(),
            headers: z.array(z.string()),
            rows: z.array(z.array(z.string())),
          }),
        )
        .optional(),
      method: z.enum(["csv", "xlsx", "paste"]).optional(),
      fileName: z.string().nullable().optional(),
    });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (parsed.data.sheets && parsed.data.sheet) {
      const base = {
        method: parsed.data.method || ("xlsx" as const),
        fileName: parsed.data.fileName ?? null,
        sheets: parsed.data.sheets,
        activeSheet: parsed.data.sheets[0]?.name || "",
        headers: parsed.data.sheets[0]?.headers || [],
        previewRows: [],
        allRows: [],
      };
      const payload = selectSheet(base, parsed.data.sheet);
      return NextResponse.json({
        ok: true,
        payload: {
          ...payload,
          allRows: payload.allRows.slice(0, 10_000),
        },
        suggestedMapping: suggestColumnMapping(payload.headers),
      });
    }

    if (!parsed.data.paste) {
      return NextResponse.json({ error: "Chybí data." }, { status: 400 });
    }

    const payload = parsePasteText(parsed.data.paste);
    return NextResponse.json({
      ok: true,
      payload: {
        ...payload,
        allRows: payload.allRows.slice(0, 10_000),
      },
      suggestedMapping: suggestColumnMapping(payload.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Parse failed";
    console.error("[admin] import parse", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

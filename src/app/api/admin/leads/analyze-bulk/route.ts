import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { analyzeAndPersistLead } from "@/lib/leads/analyze-persist";
import type { Lead } from "@/lib/leads/types";

export const maxDuration = 300;

const bodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(15),
  overwrite: z.boolean().optional(),
});

/**
 * Bulk analyze a small batch of leads (client loops for larger sets).
 * Cap keeps the request under typical serverless timeouts.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ids, overwrite } = parsed.data;

  const { data: rows, error } = await supabase
    .from("leads")
    .select("*")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byId = new Map((rows || []).map((row) => [row.id as string, row as Lead]));
  const results = [];

  for (const id of ids) {
    const lead = byId.get(id);
    if (!lead) {
      results.push({
        id,
        name: id,
        status: "failed" as const,
        error: "Lead nenalezen.",
      });
      continue;
    }

    const result = await analyzeAndPersistLead(supabase, lead, { overwrite });
    results.push(result);

    // Light pause between Places / PSI / IG calls.
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    needs_selection: results.filter((r) => r.status === "needs_selection")
      .length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  return NextResponse.json({ results, summary });
}

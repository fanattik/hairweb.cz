import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { runWebAudit } from "@/lib/web-audit/run-audit";
import { summarizeLighthouse } from "@/lib/web-audit/apply";

const bodySchema = z.object({
  website: z.string().trim().min(1),
});

/** Preview web audit without writing to DB. */
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
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const audit = await runWebAudit(parsed.data.website);
    return NextResponse.json({
      ok: true,
      url: audit.url,
      finalUrl: audit.finalUrl,
      scores: audit.scores,
      lighthouse: summarizeLighthouse(audit.lighthouse),
      aiSource: audit.aiSource,
      aiConfigured: audit.aiConfigured,
      warnings: audit.warnings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Web audit failed";
    console.error("[admin] enrich-web-audit preview", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

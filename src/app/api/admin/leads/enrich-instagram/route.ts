import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  isInstagramGraphConfigured,
  resolveInstagramProfile,
} from "@/lib/instagram/client";

const bodySchema = z.object({
  handle: z.string().trim().min(1).optional(),
  url: z.string().trim().min(1).optional(),
  requireGraph: z.boolean().optional(),
});

/** Preview Instagram profile without writing to DB. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const profile = await resolveInstagramProfile({
      handle: parsed.data.handle,
      url: parsed.data.url,
      requireGraph: parsed.data.requireGraph,
    });

    return NextResponse.json({
      ok: true,
      profile,
      graphConfigured: isInstagramGraphConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Instagram lookup failed";
    console.error("[admin] enrich-instagram preview", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

/**
 * Hard-delete multiple leads. Related rows cascade (activities, emails).
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
      { error: "Neplatná data.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ids } = parsed.data;
  const uniqueIds = [...new Set(ids)];

  const { data, error } = await supabase
    .from("leads")
    .delete()
    .in("id", uniqueIds)
    .select("id");

  if (error) {
    console.error("[admin] bulk lead delete", error);
    return NextResponse.json({ error: "Smazání selhalo." }, { status: 500 });
  }

  const deletedIds = (data || []).map((row) => row.id as string);

  return NextResponse.json({
    ok: true,
    deleted: deletedIds.length,
    ids: deletedIds,
  });
}

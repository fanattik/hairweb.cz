import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { outboundLeadSchema } from "@/lib/leads/schema";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = outboundLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("leads")
    .insert({
      type: "outbound",
      status: "new",
      name: input.name.trim(),
      salon_name: input.salonName?.trim() || null,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      website: input.website.trim(),
      score: input.score ?? null,
      notes: input.notes?.trim() || null,
      source: "manual",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[admin] outbound create", error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

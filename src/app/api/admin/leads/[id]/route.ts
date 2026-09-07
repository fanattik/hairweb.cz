import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadCrmUpdateSchema } from "@/lib/leads/schema";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";
import type { Lead } from "@/lib/leads/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = leadCrmUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: existing, error: loadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = existing as Lead;
  const patch = parsed.data;

  const merged: Lead = {
    ...current,
    ...patch,
    email: patch.email !== undefined ? patch.email : current.email,
    phone: patch.phone !== undefined ? patch.phone : current.phone,
    website:
      patch.website !== undefined
        ? patch.website || current.website
        : current.website,
    salon_name:
      patch.salon_name !== undefined ? patch.salon_name : current.salon_name,
  };

  const scores = scoredColumnsFromInput(leadToScoreInput(merged));

  const { error } = await supabase
    .from("leads")
    .update({ ...patch, ...scores })
    .eq("id", id);

  if (error) {
    console.error("[admin] lead update", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scores });
}

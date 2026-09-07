import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recalculateOpportunityForLead } from "@/lib/discovery/create-lead";

export async function POST(
  _request: Request,
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

  try {
    const opportunity = await recalculateOpportunityForLead(supabase, id);
    return NextResponse.json({ ok: true, opportunity });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Rescore failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

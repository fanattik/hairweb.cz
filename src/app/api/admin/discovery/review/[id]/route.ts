import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createLeadFromDiscoveredPlace } from "@/lib/discovery/create-lead";
import type { DiscoveredPlace } from "@/lib/discovery/types";

const bodySchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export async function POST(
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

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: review, error } = await supabase
    .from("lead_discovery_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (review.status !== "pending") {
    return NextResponse.json({ error: "Už vyřízeno." }, { status: 400 });
  }

  if (parsed.data.action === "reject") {
    await supabase
      .from("lead_discovery_reviews")
      .update({
        status: "rejected",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  const place = review.candidate as DiscoveredPlace;
  const leadId = await createLeadFromDiscoveredPlace(supabase, place, {
    jobId: review.job_id || "",
    runId: review.run_id || "",
    discoverySource: place.provider || "google_places",
  });

  await supabase
    .from("leads")
    .update({ discovery_status: "ready" })
    .eq("id", leadId);

  await supabase
    .from("lead_discovery_reviews")
    .update({
      status: "accepted",
      resolved_at: new Date().toISOString(),
      resolved_lead_id: leadId,
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, status: "accepted", leadId });
}

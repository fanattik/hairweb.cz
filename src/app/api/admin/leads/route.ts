import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { outboundLeadSchema } from "@/lib/leads/schema";
import {
  emptyToNull,
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";

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
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const website =
    emptyToNull(input.website) ??
    (input.has_website === false ? "—" : null) ??
    "—";

  const row = {
    type: "outbound" as const,
    status: "new" as const,
    name: input.name.trim(),
    salon_name: emptyToNull(input.salonName),
    email: input.email.trim().toLowerCase(),
    phone: emptyToNull(input.phone),
    website,
    notes: emptyToNull(input.notes),
    source: "manual",
    contact_person: emptyToNull(input.contact_person),
    city: emptyToNull(input.city),
    region: emptyToNull(input.region),
    google_rating: input.google_rating ?? null,
    google_reviews_count: input.google_reviews_count ?? null,
    google_maps_url: emptyToNull(input.google_maps_url),
    instagram_url: emptyToNull(input.instagram_url),
    instagram_handle: emptyToNull(input.instagram_handle),
    instagram_active: input.instagram_active ?? null,
    instagram_followers: input.instagram_followers ?? null,
    instagram_quality: input.instagram_quality ?? null,
    has_online_booking: input.has_online_booking ?? null,
    booking_provider: emptyToNull(input.booking_provider),
    booking_url: emptyToNull(input.booking_url),
    business_size: input.business_size ?? null,
    premium_impression: input.premium_impression ?? null,
    professional_photos: input.professional_photos ?? null,
    professional_branding: input.professional_branding ?? null,
    paid_marketing: input.paid_marketing ?? null,
    has_website: input.has_website ?? (website !== "—" ? true : false),
    website_design_score: input.website_design_score ?? null,
    website_mobile_score: input.website_mobile_score ?? null,
    website_cta_score: input.website_cta_score ?? null,
    website_content_score: input.website_content_score ?? null,
    website_trust_score: input.website_trust_score ?? null,
    website_seo_score: input.website_seo_score ?? null,
    website_performance_score: input.website_performance_score ?? null,
    website_outdated: input.website_outdated ?? null,
    website_mobile_problem: input.website_mobile_problem ?? null,
    website_clear_booking_cta: input.website_clear_booking_cta ?? null,
    website_has_prices: input.website_has_prices ?? null,
    website_has_gallery: input.website_has_gallery ?? null,
    website_has_team: input.website_has_team ?? null,
    website_has_reviews: input.website_has_reviews ?? null,
    website_audit: emptyToNull(input.website_audit),
    opportunity_note: emptyToNull(input.opportunity_note),
  };

  const scores = scoredColumnsFromInput(
    leadToScoreInput({
      ...row,
      email: row.email,
      phone: row.phone,
    }),
  );

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...row, ...scores })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[admin] outbound create", error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

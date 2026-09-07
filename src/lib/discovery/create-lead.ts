import type { SupabaseClient } from "@supabase/supabase-js";
import { LeadScoringService } from "@/lib/discovery/opportunity-scoring";
import type { DiscoveredPlace } from "@/lib/discovery/types";
import {
  normalizePhone,
  normalizeSalonName,
  normalizeWebsite,
} from "@/lib/leads/import/normalize";
import {
  leadToScoreInput,
  scoredColumnsFromInput,
} from "@/lib/leads/persist-scores";

export async function createLeadFromDiscoveredPlace(
  supabase: SupabaseClient,
  place: DiscoveredPlace,
  meta: {
    jobId?: string | null;
    runId?: string | null;
    discoverySource: string;
  },
): Promise<string> {
  const { website, domain } = normalizeWebsite(place.website);
  const hasWebsite = Boolean(website);
  const phoneNormalized = normalizePhone(place.phone);
  const salonNameNormalized = normalizeSalonName(place.name);

  const opportunity = LeadScoringService.calculate({
    googleRating: place.rating,
    googleReviewsCount: place.reviewsCount,
    hasWebsite,
    website,
    instagramActive: false,
    hasFacebook: false,
  });

  const row = {
    type: "outbound" as const,
    status: "new" as const,
    name: place.name,
    salon_name: place.name,
    email: null,
    phone: place.phone,
    website: website || "—",
    notes: null,
    source: "discovery",
    source_type: place.provider === "google_places" ? "google_places" : "discovery",
    source_name: place.provider,
    city: place.city,
    region: place.region,
    address: place.address,
    postal_code: place.postalCode,
    country: "CZ",
    google_place_id: place.googlePlaceId,
    google_rating: place.rating,
    google_reviews_count: place.reviewsCount,
    google_maps_url: place.mapsUrl,
    latitude: place.latitude,
    longitude: place.longitude,
    has_website: hasWebsite,
    website_domain: domain,
    phone_normalized: phoneNormalized,
    salon_name_normalized: salonNameNormalized,
    business_status: place.businessStatus,
    primary_type: place.primaryType,
    google_types: place.types,
    opening_hours: place.openingHours,
    cover_photo_url: place.coverPhotoUrl,
    discovery_status: "ready" as const,
    discovery_source: meta.discoverySource,
    discovery_job_id: meta.jobId || null,
    discovery_run_id: meta.runId || null,
    enrichment_status: "completed" as const,
    enrichment_source: place.provider,
    last_enriched_at: new Date().toISOString(),
    opportunity_score: opportunity.opportunityScore,
    opportunity_grade: opportunity.opportunityGrade,
    opportunity_summary: opportunity.summary,
    recommended_pitch: opportunity.recommendedPitch,
    recommended_channel: opportunity.recommendedChannel,
    suggested_service: opportunity.suggestedService,
    opportunity_reasons: opportunity.reasons,
    lead_grade: opportunity.opportunityGrade,
  };

  const hairwebScores = scoredColumnsFromInput(
    leadToScoreInput({
      email: null,
      phone: row.phone,
      google_rating: row.google_rating,
      google_reviews_count: row.google_reviews_count,
      has_website: row.has_website,
    }),
  );

  const { data, error } = await supabase
    .from("leads")
    .insert({
      ...row,
      ...hairwebScores,
      // Discovery opportunity grade takes precedence for discovered leads.
      lead_grade: opportunity.opportunityGrade,
      enrichment_source: place.provider,
      last_enriched_at: row.last_enriched_at,
      opportunity_score: opportunity.opportunityScore,
      opportunity_grade: opportunity.opportunityGrade,
      opportunity_summary: opportunity.summary,
      recommended_pitch: opportunity.recommendedPitch,
      recommended_channel: opportunity.recommendedChannel,
      suggested_service: opportunity.suggestedService,
      opportunity_reasons: opportunity.reasons,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (opportunity.signals.length) {
    await supabase.from("lead_opportunity_signals").insert(
      opportunity.signals.map((signal) => ({
        lead_id: data.id,
        type: signal.type,
        severity: signal.severity,
        score: signal.score,
        message: signal.message,
        source: "discovery",
        active: true,
      })),
    );
  }

  return data.id as string;
}

export async function recalculateOpportunityForLead(
  supabase: SupabaseClient,
  leadId: string,
) {
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) throw new Error(error?.message || "Lead not found");

  const opportunity = LeadScoringService.calculate({
    googleRating: lead.google_rating,
    googleReviewsCount: lead.google_reviews_count,
    hasWebsite: lead.has_website,
    website: lead.website,
    hasBooking: lead.has_online_booking,
    mobileFriendly:
      lead.website_mobile_problem == null
        ? null
        : !lead.website_mobile_problem,
    weakWebsite: lead.website_outdated === true,
    websiteScore: lead.web_score,
    instagramActive: lead.instagram_active,
    hasFacebook: Boolean(lead.facebook_url),
    instagramStrong:
      lead.instagram_quality === "good" ||
      lead.instagram_quality === "excellent",
  });

  await supabase
    .from("leads")
    .update({
      opportunity_score: opportunity.opportunityScore,
      opportunity_grade: opportunity.opportunityGrade,
      opportunity_summary: opportunity.summary,
      recommended_pitch: opportunity.recommendedPitch,
      recommended_channel: opportunity.recommendedChannel,
      suggested_service: opportunity.suggestedService,
      opportunity_reasons: opportunity.reasons,
      lead_grade: opportunity.opportunityGrade,
    })
    .eq("id", leadId);

  await supabase
    .from("lead_opportunity_signals")
    .update({ active: false })
    .eq("lead_id", leadId)
    .eq("active", true);

  if (opportunity.signals.length) {
    await supabase.from("lead_opportunity_signals").insert(
      opportunity.signals.map((signal) => ({
        lead_id: leadId,
        type: signal.type,
        severity: signal.severity,
        score: signal.score,
        message: signal.message,
        source: "rescore",
        active: true,
      })),
    );
  }

  return opportunity;
}

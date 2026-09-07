import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOutreachDraft,
  distinctiveHighlights,
  inferWebsiteShape,
  suggestHairwebPackage,
  suggestOutreachTemplate,
} from "@/lib/leads/outreach-templates";
import type { Lead } from "@/lib/leads/types";

function baseLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: "outbound",
    name: "Hair Lab",
    salon_name: "Václav Pražák Hair Design",
    email: "a@b.cz",
    phone: null,
    website: "—",
    message: null,
    package: null,
    source: "discovery",
    source_detail: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    referrer: null,
    landing_page: null,
    status: "new",
    score: null,
    notes: null,
    last_contact_at: null,
    next_followup_at: null,
    won_value: null,
    lost_reason: null,
    city: "Praha",
    region: null,
    contact_person: "Jana Nováková",
    google_rating: 4.9,
    google_reviews_count: 120,
    google_maps_url: null,
    google_place_id: null,
    instagram_url: null,
    instagram_handle: null,
    instagram_active: null,
    instagram_followers: null,
    instagram_quality: null,
    instagram_media_count: null,
    instagram_name: null,
    instagram_biography: null,
    instagram_suggested_quality: null,
    has_online_booking: null,
    booking_provider: null,
    booking_url: null,
    business_size: null,
    premium_impression: null,
    professional_photos: null,
    professional_branding: null,
    paid_marketing: null,
    has_website: false,
    website_design_score: null,
    website_mobile_score: null,
    website_cta_score: null,
    website_content_score: null,
    website_trust_score: null,
    website_seo_score: null,
    website_performance_score: null,
    web_score: null,
    website_outdated: null,
    website_mobile_problem: null,
    website_clear_booking_cta: null,
    website_has_prices: null,
    website_has_gallery: null,
    website_has_team: null,
    website_has_reviews: null,
    website_audit: null,
    opportunity_note: null,
    facebook_url: null,
    address: null,
    postal_code: null,
    country: null,
    website_domain: null,
    phone_normalized: null,
    email_normalized: null,
    salon_name_normalized: null,
    raw_import_data: null,
    source_type: null,
    source_name: null,
    source_url: null,
    lead_grade: null,
    lighthouse_performance: null,
    lighthouse_accessibility: null,
    lighthouse_seo: null,
    lighthouse_best_practices: null,
    latitude: null,
    longitude: null,
    business_score: null,
    web_opportunity_score: null,
    purchase_intent_score: null,
    contactability_score: null,
    lead_score: null,
    enrichment_source: null,
    last_enriched_at: null,
    enrichment_status: null,
    enrichment_error: null,
    discovery_status: null,
    discovery_source: null,
    discovery_job_id: null,
    discovery_run_id: null,
    business_status: null,
    primary_type: null,
    google_types: null,
    opening_hours: null,
    cover_photo_url: null,
    opportunity_score: null,
    opportunity_grade: null,
    opportunity_summary: null,
    recommended_pitch: "Vlastní web pro salon s online rezervací.",
    recommended_channel: null,
    suggested_service: null,
    opportunity_reasons: null,
    ...overrides,
  };
}

describe("outreach templates", () => {
  it("suggests no_website when salon has no site", () => {
    assert.equal(suggestOutreachTemplate(baseLead()), "no_website");
  });

  it("keeps one-pager redesign on START even with team + many reviews", () => {
    const lead = baseLead({
      has_website: true,
      website: "https://example.cz",
      website_has_prices: true,
      website_has_gallery: true,
      website_has_team: true,
      google_reviews_count: 200,
    });
    assert.equal(inferWebsiteShape(lead), "one_pager");
    assert.equal(suggestHairwebPackage(lead, "redesign"), "start");
  });

  it("extracts distinctive highlights like K-SCAN", () => {
    const highlights = distinctiveHighlights(
      baseLead({
        website_audit:
          "Salon nabízí široký rozsah služeb a technologii K-SCAN pro diagnostiku vlasů.",
      }),
    );
    assert.ok(highlights.some((h) => /k-scan/i.test(h)));
  });

  it("builds redesign mail in the Hairweb prose style", () => {
    const draft = buildOutreachDraft(
      baseLead({
        has_website: true,
        website: "https://example.cz",
        website_has_prices: true,
        website_has_gallery: true,
        website_has_team: true,
        website_audit:
          "Zaujal rozsah služeb a technologie K-SCAN. Web působí zastarale.",
        contact_person: null,
      }),
      "redesign",
    );

    assert.equal(draft.packageId, "start");
    assert.match(draft.body, /^Dobrý den,/m);
    assert.match(draft.body, /narazil jsem na web Vašeho salonu Václav Pražák Hair Design/);
    assert.match(draft.body, /K-SCAN/);
    assert.match(
      draft.body,
      /současný web už vizuálně úplně neodpovídá úrovni salonu/,
    );
    assert.match(draft.body, /velmi dobrý základ/);
    assert.match(draft.body, /kompletní redesign současného webu za 9 900 Kč/);
    assert.match(draft.body, /Součástí by byl nový individuální vzhled/);
    assert.match(draft.body, /responzivní zpracování/);
    assert.doesNotMatch(draft.body, /balíček START/);
    assert.doesNotMatch(draft.body, /^– /m);
    assert.match(draft.body, /„na papíře“/);
    assert.match(draft.body, /odpovědět „ANO“/);
    assert.match(draft.body, /Weby pro kadeřnictví, barber shopy a vlasová studia/);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HAIRWEB_PACKAGES,
  buildOutreachDraft,
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
    salon_name: "Hair Lab Praha",
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

  it("treats existing salon sites as one-pager by default (even with team section)", () => {
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

  it("suggests PRO only for multi-page / local SEO need", () => {
    assert.equal(suggestHairwebPackage(baseLead(), "local_seo"), "pro");
    assert.equal(
      suggestHairwebPackage(
        baseLead({
          has_website: true,
          website: "https://example.cz",
          website_audit: "Vícestránkový web se slabou strukturou pro SEO.",
        }),
        "redesign",
      ),
      "pro",
    );
    assert.equal(
      suggestHairwebPackage(baseLead({ business_size: "large" }), "no_website"),
      "pro",
    );
  });

  it("builds redesign mail around concrete problems + START for one-pager", () => {
    const draft = buildOutreachDraft(
      baseLead({
        has_website: true,
        website: "https://example.cz",
        website_has_prices: true,
        website_has_gallery: true,
        website_mobile_problem: true,
        website_outdated: true,
        contact_person: null,
      }),
      "redesign",
    );
    assert.equal(draft.packageId, "start");
    assert.match(draft.subject, /jednostránkového/);
    assert.match(draft.body, /mobilu/);
    assert.match(draft.body, /zastarale/);
    assert.match(draft.body, /9 900 Kč/);
    assert.match(draft.body, /ne komplikovat zbytečně na více stránek/);
    assert.match(draft.body, /„ANO“/);
    assert.match(draft.body, /Lukáš Ptáčník/);
  });

  it("builds PRO mail with full feature list when forced", () => {
    const draft = buildOutreachDraft(baseLead(), "no_website", "pro");
    assert.equal(draft.packageId, "pro");
    assert.match(draft.body, /balíček PRO/);
    for (const feature of HAIRWEB_PACKAGES.pro.features) {
      assert.match(
        draft.body,
        new RegExp(feature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
  });
});

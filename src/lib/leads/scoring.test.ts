import { calculateLeadScores } from "@/lib/leads/scoring";
import type { LeadScoreInput } from "@/lib/leads/scoring";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const excellentLead: LeadScoreInput = {
  email: "owner@hairlab.cz",
  phone: "+420777000111",
  contact_person: "Jana",
  google_rating: 4.9,
  google_reviews_count: 250,
  instagram_active: true,
  instagram_quality: "excellent",
  instagram_url: "https://instagram.com/hairlab",
  premium_impression: true,
  has_website: true,
  website_design_score: 4,
  website_mobile_score: 3,
  website_cta_score: 2,
  website_content_score: 4,
  website_trust_score: 2,
  website_seo_score: 3,
  website_performance_score: 2,
  website_mobile_problem: true,
  website_clear_booking_cta: false,
  website_has_prices: false,
  website_has_gallery: false,
  has_online_booking: true,
  paid_marketing: true,
  professional_branding: true,
  professional_photos: true,
  business_size: "medium",
};

run("excellent lead is HOT", () => {
  const scores = calculateLeadScores(excellentLead);
  assert(scores.businessScore === 30, `business ${scores.businessScore}`);
  assert(scores.webScore === 20, `web ${scores.webScore}`);
  assert(scores.webOpportunityScore === 40, `opp ${scores.webOpportunityScore}`);
  assert(scores.purchaseIntentScore === 20, `purchase ${scores.purchaseIntentScore}`);
  assert(scores.contactabilityScore === 10, `contact ${scores.contactabilityScore}`);
  assert(scores.leadScore === 100, `lead ${scores.leadScore}`);
  assert(scores.priority === "hot", scores.priority);
});

run("weak business is LOW", () => {
  const scores = calculateLeadScores({
    email: "a@b.cz",
    google_rating: 4.1,
    google_reviews_count: 8,
    instagram_active: false,
    has_online_booking: false,
    has_website: true,
    website_design_score: 2,
    website_mobile_score: 2,
    website_cta_score: 1,
    website_content_score: 2,
    website_trust_score: 1,
    website_seo_score: 1,
    website_performance_score: 1,
  });
  assert(scores.businessScore === 0, `business ${scores.businessScore}`);
  assert(scores.priority === "low" || scores.leadScore < 50, scores.priority);
  assert(scores.leadScore < 50, `lead ${scores.leadScore}`);
});

run("strong salon + strong web lowers opportunity", () => {
  const scores = calculateLeadScores({
    email: "a@b.cz",
    phone: "123",
    contact_person: "X",
    google_rating: 4.9,
    google_reviews_count: 220,
    instagram_active: true,
    instagram_quality: "excellent",
    instagram_handle: "salon",
    premium_impression: true,
    has_website: true,
    website_design_score: 18,
    website_mobile_score: 14,
    website_cta_score: 14,
    website_content_score: 14,
    website_trust_score: 9,
    website_seo_score: 14,
    website_performance_score: 9,
    website_clear_booking_cta: true,
    website_has_prices: true,
    website_has_gallery: true,
    has_online_booking: true,
    paid_marketing: true,
    professional_branding: true,
    professional_photos: true,
    business_size: "large",
  });
  assert(scores.webScore === 92, `web ${scores.webScore}`);
  assert(scores.webOpportunityScore === 2, `opp ${scores.webOpportunityScore}`);
  assert(scores.leadScore < 80, `lead should not be hot solely on web: ${scores.leadScore}`);
});

run("no website yields high web opportunity", () => {
  const scores = calculateLeadScores({
    email: "a@b.cz",
    google_rating: 4.9,
    google_reviews_count: 120,
    has_website: false,
    website_mobile_problem: true,
    website_clear_booking_cta: false,
    website_has_prices: false,
    website_has_gallery: false,
  });
  assert(scores.webScore === 0, `web ${scores.webScore}`);
  assert(scores.webOpportunityScore === 40, `opp ${scores.webOpportunityScore}`);
});

run("caps never exceed maxima", () => {
  const scores = calculateLeadScores(excellentLead);
  assert(scores.businessScore <= 30, "business cap");
  assert(scores.webOpportunityScore <= 40, "opp cap");
  assert(scores.purchaseIntentScore <= 20, "purchase cap");
  assert(scores.contactabilityScore <= 10, "contact cap");
  assert(scores.leadScore <= 100, "lead cap");
  assert(scores.webScore <= 100, "web cap");
});

console.log("All scoring tests passed.");

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeSocial } from "@/lib/audit/analyzers/booking-social-customers-marketing";
import type { AnalyzerContext } from "@/lib/audit/analyzers/types";
import type { AuditAnswers, AuditCheck } from "@/lib/audit/types";
import type { InstagramSnapshot } from "@/lib/instagram/client";
import type { PageSignals } from "@/lib/web-audit/fetch-page";

function baseAnswers(patch: Partial<AuditAnswers> = {}): AuditAnswers {
  return {
    salonName: "Test Salon",
    city: "Praha",
    hasWebsite: true,
    directoryPlatforms: [],
    bookingMethods: ["phone"],
    socialPlatforms: ["instagram"],
    instagramHandle: "@testsalon",
    name: "Test",
    email: "test@example.com",
    consent: true,
    ...patch,
  };
}

function pageWithIg(links: string[]): PageSignals {
  return {
    url: "https://salon.cz",
    finalUrl: "https://salon.cz",
    title: null,
    metaDescription: null,
    h1: [],
    textSample: "",
    linkCount: 0,
    imageCount: 0,
    hasViewportMeta: false,
    clearBookingCta: null,
    hasPrices: null,
    hasGallery: null,
    hasTeam: null,
    hasReviews: null,
    looksOutdated: null,
    fetchError: null,
    phones: [],
    emails: [],
    hasOpeningHours: null,
    openingHoursSnippet: null,
    hasAddressMention: null,
    hasServicesMention: null,
    instagramLinks: links,
    facebookLinks: [],
    jsonLdTypes: [],
    hasLocalBusinessSchema: false,
    hasFaqSchema: false,
    hasOpenGraph: false,
    directoryLinks: {},
  };
}

function ctx(partial: {
  answers?: Partial<AuditAnswers>;
  instagram?: InstagramSnapshot | null;
  pageLinks?: string[];
}): AnalyzerContext {
  return {
    answers: baseAnswers(partial.answers),
    place: null,
    page: partial.pageLinks ? pageWithIg(partial.pageLinks) : null,
    websiteProbe: null,
    lighthouse: null,
    directoryProbes: null,
    llmsTxt: null,
    instagram: partial.instagram ?? null,
  };
}

function snapshot(
  patch: Partial<InstagramSnapshot> &
    Pick<InstagramSnapshot, "followers" | "mediaCount" | "suggestedQuality">,
): InstagramSnapshot {
  return {
    handle: "testsalon",
    url: "https://www.instagram.com/testsalon/",
    name: "Test Salon",
    biography: null,
    website: null,
    suggestedActive: true,
    source: "meta_graph",
    ...patch,
  };
}

function run(partial: Parameters<typeof ctx>[0]): AuditCheck[] {
  return analyzeSocial(ctx(partial)) as AuditCheck[];
}

describe("analyzeSocial", () => {
  it("fails when salon claims no social and nothing found", () => {
    const checks = run({
      answers: { socialPlatforms: ["none"], instagramHandle: undefined },
    });
    assert.equal(checks.length, 1);
    assert.equal(checks[0]?.checkId, "social_presence");
    assert.equal(checks[0]?.status, "fail");
  });

  it("scores followers, posts and quality from Graph snapshot", () => {
    const checks = run({
      instagram: snapshot({
        followers: 1200,
        mediaCount: 48,
        suggestedQuality: "good",
        suggestedActive: true,
      }),
    });

    const byId = Object.fromEntries(checks.map((c) => [c.checkId, c]));
    assert.equal(byId.social_instagram?.status, "pass");
    assert.match(byId.social_instagram?.description || "", /1\s?200/);
    assert.match(byId.social_instagram?.description || "", /48/);

    assert.equal(byId.social_instagram_followers?.status, "pass");
    assert.equal(byId.social_instagram_followers?.value, 1200);

    assert.equal(byId.social_instagram_posts?.status, "pass");
    assert.equal(byId.social_instagram_posts?.value, 48);

    assert.equal(byId.social_instagram_quality?.status, "pass");
    assert.equal(byId.social_instagram_quality?.value, "good");
    assert.equal(byId.social_instagram_metrics, undefined);
  });

  it("marks poor profiles as fail on followers/posts/quality", () => {
    const checks = run({
      instagram: snapshot({
        followers: 40,
        mediaCount: 3,
        suggestedQuality: "poor",
        suggestedActive: false,
      }),
    });
    const byId = Object.fromEntries(checks.map((c) => [c.checkId, c]));
    assert.equal(byId.social_instagram_followers?.status, "fail");
    assert.equal(byId.social_instagram_posts?.status, "fail");
    assert.equal(byId.social_instagram_quality?.status, "fail");
  });

  it("uses unknown metrics when handle exists but Graph snapshot missing", () => {
    const checks = run({
      answers: { socialPlatforms: ["instagram"], instagramHandle: "@salon" },
      instagram: null,
    });
    const metrics = checks.find((c) => c.checkId === "social_instagram_metrics");
    assert.ok(metrics);
    assert.equal(metrics?.status, "unknown");
    assert.match(metrics?.description || "", /neověřili/i);
  });

  it("partial presence when answers say none but IG found on web", () => {
    const checks = run({
      answers: { socialPlatforms: ["none"], instagramHandle: undefined },
      pageLinks: ["https://www.instagram.com/foundsalon/"],
      instagram: snapshot({
        handle: "foundsalon",
        followers: 300,
        mediaCount: 12,
        suggestedQuality: "average",
      }),
    });
    const presence = checks.find((c) => c.checkId === "social_presence");
    assert.equal(presence?.status, "partial");
    assert.ok(checks.some((c) => c.checkId === "social_instagram_followers"));
  });
});

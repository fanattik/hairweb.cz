import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWebAuditEnrichPatch } from "@/lib/web-audit/apply";
import { normalizeAuditUrl } from "@/lib/web-audit/normalize-url";
import {
  detectMobileProblem,
  mapMobileFromLighthouse,
  mapPerformanceToScore,
  mapSeoToScore,
} from "@/lib/web-audit/pagespeed";
import type { MergedWebAuditScores } from "@/lib/web-audit/apply";

describe("normalizeAuditUrl", () => {
  it("adds https and keeps host", () => {
    assert.equal(normalizeAuditUrl("salon.cz"), "https://salon.cz/");
    assert.equal(
      normalizeAuditUrl("https://www.salon.cz/path"),
      "https://www.salon.cz/path",
    );
  });

  it("rejects blank and instagram", () => {
    assert.equal(normalizeAuditUrl(""), null);
    assert.equal(normalizeAuditUrl("—"), null);
    assert.equal(normalizeAuditUrl("@salon"), null);
    assert.equal(normalizeAuditUrl("https://instagram.com/salon"), null);
  });
});

describe("pagespeed score mapping", () => {
  it("maps performance 0-100 to 0-10", () => {
    assert.equal(mapPerformanceToScore(null), 0);
    assert.equal(mapPerformanceToScore(0), 0);
    assert.equal(mapPerformanceToScore(55), 6);
    assert.equal(mapPerformanceToScore(100), 10);
  });

  it("maps seo to 0-15", () => {
    assert.equal(mapSeoToScore(null), 0);
    assert.equal(mapSeoToScore(100), 15);
    assert.equal(mapSeoToScore(50), 8);
  });

  it("detects mobile problems", () => {
    assert.equal(detectMobileProblem({ performance: 40, lcpMs: 2000 }), true);
    assert.equal(detectMobileProblem({ performance: 80, lcpMs: 5000 }), true);
    assert.equal(detectMobileProblem({ performance: 80, lcpMs: 2000 }), false);
  });

  it("caps mobile score", () => {
    assert.equal(
      mapMobileFromLighthouse({
        performance: 100,
        accessibility: 100,
        lcpMs: 1000,
      }),
      15,
    );
    assert.ok(
      mapMobileFromLighthouse({
        performance: 100,
        accessibility: 100,
        lcpMs: 5000,
      }) < 15,
    );
  });
});

describe("buildWebAuditEnrichPatch", () => {
  const audit: MergedWebAuditScores = {
    website_design_score: 12,
    website_mobile_score: 8,
    website_cta_score: 5,
    website_content_score: 7,
    website_trust_score: 4,
    website_seo_score: 9,
    website_performance_score: 6,
    website_outdated: true,
    website_mobile_problem: true,
    website_clear_booking_cta: false,
    website_has_prices: true,
    website_has_gallery: false,
    website_has_team: true,
    website_has_reviews: false,
    website_audit: "Audit text delší než čtyřicet znaků pro validaci schema.",
    opportunity_note: "Příležitost: nový web s rezervací.",
  };

  it("fills booking when empty", () => {
    const patch = buildWebAuditEnrichPatch(
      { has_online_booking: null, opportunity_note: null },
      audit,
    );
    assert.equal(patch.has_online_booking, false);
    assert.equal(patch.enrichment_source, "ai_audit");
    assert.equal(patch.website_performance_score, 6);
  });

  it("appends opportunity when not overwrite", () => {
    const patch = buildWebAuditEnrichPatch(
      {
        has_online_booking: true,
        opportunity_note: "Původní poznámka",
      },
      audit,
    );
    assert.equal(patch.has_online_booking, undefined);
    assert.match(patch.opportunity_note, /Původní poznámka/);
    assert.match(patch.opportunity_note, /\[Web audit\]/);
  });
});

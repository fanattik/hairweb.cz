import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  scoresToWebFlags,
  webFlagsToScores,
} from "@/lib/leads/web-flags";
import { WEB_SCORE_MAX } from "@/lib/leads/types";

describe("web flags", () => {
  it("maps high scores to Ano and low to Ne", () => {
    const flags = scoresToWebFlags({
      website_design_score: WEB_SCORE_MAX.design,
      website_mobile_score: 1,
      website_cta_score: null,
    });
    assert.equal(flags.website_design_ok, true);
    assert.equal(flags.website_mobile_ok, false);
    assert.equal(flags.website_cta_ok, null);
  });

  it("converts Ano/Ne back to numeric scores", () => {
    const scores = webFlagsToScores({
      website_design_ok: true,
      website_mobile_ok: false,
      website_cta_ok: null,
      website_content_ok: true,
      website_trust_ok: false,
      website_seo_ok: true,
      website_performance_ok: false,
    });
    assert.equal(scores.website_design_score, WEB_SCORE_MAX.design);
    assert.equal(scores.website_mobile_score, Math.round(WEB_SCORE_MAX.mobile * 0.2));
    assert.equal(scores.website_cta_score, null);
  });
});

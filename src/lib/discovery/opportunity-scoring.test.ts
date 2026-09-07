import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LeadScoringService } from "@/lib/discovery/opportunity-scoring";

describe("opportunity scoring", () => {
  it("scores hot no-website salon highly", () => {
    const result = LeadScoringService.calculate({
      googleRating: 4.9,
      googleReviewsCount: 150,
      hasWebsite: false,
      website: null,
      instagramActive: true,
    });
    assert.equal(result.opportunityGrade, "A");
    assert.ok(result.opportunityScore >= 80);
    assert.ok(result.signals.some((s) => s.type === "NO_WEBSITE"));
  });

  it("scores weak opportunity lower", () => {
    const result = LeadScoringService.calculate({
      googleRating: 3.5,
      googleReviewsCount: 3,
      hasWebsite: true,
      website: "https://example.cz",
      weakWebsite: false,
      mobileFriendly: true,
      httpsEnabled: true,
    });
    assert.ok(result.opportunityScore < 45);
    assert.equal(result.opportunityGrade, "D");
  });
});

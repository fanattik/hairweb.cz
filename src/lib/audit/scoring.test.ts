import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeScores,
  extractQuickWins,
  extractRecommendations,
} from "@/lib/audit/scoring";
import type { AuditCheck } from "@/lib/audit/types";

function makeCheck(
  partial: Partial<AuditCheck> &
    Pick<
      AuditCheck,
      "checkId" | "category" | "status" | "points" | "maxPoints"
    >,
): AuditCheck {
  return {
    severity: "none",
    title: partial.checkId,
    description: "",
    recommendation: null,
    source: "test",
    ...partial,
  };
}

describe("audit scoring", () => {
  it("ignores unknown checks in category score", () => {
    const checks: AuditCheck[] = [
      makeCheck({
        checkId: "a",
        category: "web",
        status: "pass",
        points: 10,
        maxPoints: 10,
      }),
      makeCheck({
        checkId: "b",
        category: "web",
        status: "unknown",
        points: 0,
        maxPoints: 50,
      }),
    ];
    const scores = computeScores(checks);
    const web = scores.categories.find((c) => c.category === "web");
    assert.equal(web?.score, 100);
  });

  it("is deterministic", () => {
    const checks: AuditCheck[] = [
      makeCheck({
        checkId: "web1",
        category: "web",
        status: "fail",
        points: 0,
        maxPoints: 20,
        severity: "high",
        recommendation: "Fix web",
        impact: 5,
        ease: 4,
      }),
      makeCheck({
        checkId: "book1",
        category: "booking",
        status: "pass",
        points: 18,
        maxPoints: 18,
      }),
    ];
    const a = computeScores(checks);
    const b = computeScores(checks);
    assert.equal(a.overall, b.overall);
    assert.ok(a.overall > 0 && a.overall < 100);
  });

  it("orders quick wins by impact × ease", () => {
    const checks: AuditCheck[] = [
      makeCheck({
        checkId: "hard",
        category: "web",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "high",
        recommendation: "Hard fix",
        title: "Hard",
        impact: 5,
        ease: 1,
      }),
      makeCheck({
        checkId: "easy",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "medium",
        recommendation: "Easy fix",
        title: "Easy",
        impact: 4,
        ease: 5,
      }),
    ];
    const recs = extractRecommendations(checks);
    const wins = extractQuickWins(recs);
    assert.equal(wins[0]?.checkId, "easy");
  });
});

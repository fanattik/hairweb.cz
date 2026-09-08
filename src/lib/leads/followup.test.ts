import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addBusinessDays,
  calculateNextFollowup,
  deriveFollowupStatus,
  followupBadgeLabel,
  getPragueParts,
  pragueWallTimeToUtc,
  snoozeNextFollowup,
  startOfPragueDay,
} from "@/lib/leads/followup";

describe("followup business days (Europe/Prague)", () => {
  it("Friday 11.9.2026 + 4 business days → Thursday 17.9.2026", () => {
    // Friday contact
    const friday = pragueWallTimeToUtc(2026, 9, 11, 10, 31, 0);
    assert.equal(getPragueParts(friday).weekday, 5);

    const next = addBusinessDays(friday, 4);
    const parts = getPragueParts(next);
    assert.equal(parts.dateKey, "2026-09-17");
    assert.equal(parts.weekday, 4); // Thursday
    assert.equal(parts.hour, 9);
  });

  it("does not count Saturday/Sunday", () => {
    const friday = pragueWallTimeToUtc(2026, 9, 11, 12, 0, 0);
    const plus1 = addBusinessDays(friday, 1);
    assert.equal(getPragueParts(plus1).dateKey, "2026-09-14"); // Monday
  });

  it("respects optional holidays", () => {
    const thursday = pragueWallTimeToUtc(2026, 9, 10, 9, 0, 0);
    // Pretend Friday is a holiday → +1 BD = Monday
    const next = addBusinessDays(thursday, 1, ["2026-09-11"]);
    assert.equal(getPragueParts(next).dateKey, "2026-09-14");
  });
});

describe("calculateNextFollowup sequence", () => {
  const contact = pragueWallTimeToUtc(2026, 9, 11, 10, 0, 0);

  it("count 0 → +4 business days", () => {
    const next = calculateNextFollowup({
      lastContactAt: contact,
      followupCount: 0,
    });
    assert.ok(next);
    assert.equal(getPragueParts(next).dateKey, "2026-09-17");
  });

  it("count 1 → +7 business days", () => {
    const afterFu1 = pragueWallTimeToUtc(2026, 9, 17, 9, 0, 0);
    const next = calculateNextFollowup({
      lastContactAt: afterFu1,
      followupCount: 1,
    });
    assert.ok(next);
    // 17 Thu +7 BD: 18,21,22,23,24,25,28 → Mon 28.9.
    assert.equal(getPragueParts(next).dateKey, "2026-09-28");
  });

  it("count 2 → +14 calendar days", () => {
    const afterFu2 = pragueWallTimeToUtc(2026, 9, 28, 9, 0, 0);
    const next = calculateNextFollowup({
      lastContactAt: afterFu2,
      followupCount: 2,
    });
    assert.ok(next);
    assert.equal(getPragueParts(next).dateKey, "2026-10-12");
  });

  it("count >= 3 → null", () => {
    assert.equal(
      calculateNextFollowup({ lastContactAt: contact, followupCount: 3 }),
      null,
    );
  });
});

describe("deriveFollowupStatus + snooze", () => {
  const now = pragueWallTimeToUtc(2026, 9, 17, 12, 0, 0);

  it("marks overdue / due / scheduled", () => {
    assert.equal(
      deriveFollowupStatus({
        nextFollowupAt: pragueWallTimeToUtc(2026, 9, 16, 9, 0, 0),
        followupCount: 0,
        now,
      }),
      "OVERDUE",
    );
    assert.equal(
      deriveFollowupStatus({
        nextFollowupAt: pragueWallTimeToUtc(2026, 9, 17, 9, 0, 0),
        followupCount: 0,
        now,
      }),
      "DUE",
    );
    assert.equal(
      deriveFollowupStatus({
        nextFollowupAt: pragueWallTimeToUtc(2026, 9, 18, 9, 0, 0),
        followupCount: 0,
        now,
      }),
      "SCHEDULED",
    );
  });

  it("stops on won/lost and pause", () => {
    assert.equal(
      deriveFollowupStatus({
        nextFollowupAt: pragueWallTimeToUtc(2026, 9, 17, 9, 0, 0),
        followupCount: 1,
        leadStatus: "won",
        now,
      }),
      "STOPPED",
    );
    assert.equal(
      deriveFollowupStatus({
        nextFollowupAt: pragueWallTimeToUtc(2026, 9, 17, 9, 0, 0),
        followupCount: 1,
        followupPaused: true,
        now,
      }),
      "PAUSED",
    );
  });

  it("snooze tomorrow does not change count semantics", () => {
    const snoozed = snoozeNextFollowup("tomorrow", now);
    assert.equal(getPragueParts(snoozed).dateKey, "2026-09-18");
  });

  it("badge labels", () => {
    assert.equal(
      followupBadgeLabel(pragueWallTimeToUtc(2026, 9, 17, 9, 0, 0).toISOString(), {
        now,
      }).label,
      "Dnes",
    );
    assert.equal(
      followupBadgeLabel(pragueWallTimeToUtc(2026, 9, 15, 9, 0, 0).toISOString(), {
        now,
      }).label,
      "2 dny po termínu",
    );
  });

  it("startOfPragueDay is timezone-safe", () => {
    const instant = new Date("2026-09-17T22:30:00.000Z"); // already 18.9. in Prague (CEST)
    const start = startOfPragueDay(instant);
    assert.equal(getPragueParts(start).dateKey, "2026-09-18");
  });
});

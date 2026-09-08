import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeLeadSubmit } from "@/lib/leads/normalize";
import {
  leadMarketingChannel,
  resolveMarketingChannel,
} from "@/lib/marketing-channel";

describe("marketing channel helper", () => {
  it("maps facebook paid_social to Meta Ads", () => {
    assert.equal(
      resolveMarketingChannel({
        first_touch_source: "facebook",
        first_touch_medium: "paid_social",
      }),
      "meta_ads",
    );
  });

  it("maps fbclid to Meta Ads", () => {
    assert.equal(
      resolveMarketingChannel({ fbclid: "IwAR0test" }),
      "meta_ads",
    );
  });

  it("maps google cpc to Google Ads", () => {
    assert.equal(
      resolveMarketingChannel({
        utm_source: "google",
        utm_medium: "cpc",
      }),
      "google_ads",
    );
  });

  it("maps empty attribution to Direct", () => {
    assert.equal(resolveMarketingChannel({}), "direct");
  });

  it("maps outbound type to Outbound", () => {
    assert.equal(
      leadMarketingChannel({ type: "outbound", leadSource: "manual" }),
      "outbound",
    );
  });
});

describe("normalizeLeadSubmit attribution", () => {
  it("stores first and last touch from attribution payload", () => {
    const row = normalizeLeadSubmit({
      name: "Jan Novák",
      email: "jan@example.com",
      website: "https://salon.cz",
      attribution: {
        firstTouchAt: "2026-09-08T12:32:00.000Z",
        lastTouchAt: "2026-09-10T08:00:00.000Z",
        first: {
          utm_source: "facebook",
          utm_medium: "paid_social",
          utm_campaign: "test",
          utm_content: "ad01",
          fbclid: "abc",
          landing_page: "/?utm_source=facebook",
          referrer: "https://facebook.com/",
          at: "2026-09-08T12:32:00.000Z",
        },
        last: {
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "brand",
          utm_content: null,
          fbclid: null,
          landing_page: "/cenik",
          referrer: null,
          at: "2026-09-10T08:00:00.000Z",
        },
      },
    });

    assert.equal(row.first_touch_source, "facebook");
    assert.equal(row.first_touch_campaign, "test");
    assert.equal(row.utm_source, "facebook");
    assert.equal(row.fbclid, "abc");
    assert.equal(row.last_touch_source, "google");
    assert.equal(row.last_touch_campaign, "brand");
    assert.equal(
      leadMarketingChannel({
        type: "inbound",
        first_touch_source: row.first_touch_source,
        first_touch_medium: row.first_touch_medium,
        fbclid: row.fbclid,
      }),
      "meta_ads",
    );
  });

  it("marks empty inbound as direct-capable", () => {
    const row = normalizeLeadSubmit({
      name: "Jan Novák",
      email: "jan@example.com",
      website: "salon.cz",
    });
    assert.equal(row.first_touch_source, null);
    assert.equal(
      leadMarketingChannel({
        type: "inbound",
        first_touch_source: row.first_touch_source,
        utm_source: row.utm_source,
      }),
      "direct",
    );
  });
});

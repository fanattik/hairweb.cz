import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInstagramEnrichPatch } from "@/lib/instagram/apply";
import {
  normalizeInstagramHandle,
  parseInstagramInput,
} from "@/lib/instagram/parse";
import {
  suggestInstagramActive,
  suggestInstagramQuality,
} from "@/lib/instagram/suggest";
import type { InstagramSnapshot } from "@/lib/instagram/client";

describe("instagram parse", () => {
  it("normalizes handles and urls", () => {
    assert.equal(normalizeInstagramHandle("@HairLab.cz"), "hairlab.cz");
    assert.equal(
      normalizeInstagramHandle("https://www.instagram.com/hairlab.cz/"),
      "hairlab.cz",
    );
    assert.equal(
      normalizeInstagramHandle("instagram.com/hairlab.cz/?hl=cs"),
      "hairlab.cz",
    );
    assert.equal(normalizeInstagramHandle("https://instagram.com/p/ABC"), null);
  });

  it("builds canonical profile url", () => {
    const parsed = parseInstagramInput({ url: "https://instagram.com/StudioNora" });
    assert.deepEqual(parsed, {
      handle: "studionora",
      url: "https://www.instagram.com/studionora/",
    });
  });
});

describe("instagram suggest", () => {
  it("maps followers/media to quality bands", () => {
    assert.equal(
      suggestInstagramQuality({ followers: 12000, mediaCount: 80 }),
      "excellent",
    );
    assert.equal(
      suggestInstagramQuality({ followers: 3000, mediaCount: 25 }),
      "good",
    );
    assert.equal(
      suggestInstagramQuality({ followers: 300, mediaCount: 20 }),
      "average",
    );
    assert.equal(
      suggestInstagramQuality({ followers: 40, mediaCount: 3 }),
      "poor",
    );
  });

  it("suggests active flag", () => {
    assert.equal(suggestInstagramActive({ followers: 500, mediaCount: 2 }), true);
    assert.equal(suggestInstagramActive({ followers: 10, mediaCount: 2 }), false);
  });
});

describe("instagram enrich merge", () => {
  const profile: InstagramSnapshot = {
    handle: "hairlab",
    url: "https://www.instagram.com/hairlab/",
    name: "Hair Lab",
    biography: "Salon",
    website: "https://hairlab.cz",
    followers: 4200,
    mediaCount: 120,
    suggestedActive: true,
    suggestedQuality: "good",
    source: "meta_graph",
  };

  it("fills blank quality/active and always updates followers", () => {
    const patch = buildInstagramEnrichPatch(
      {
        instagram_active: null,
        instagram_quality: null,
        website: "—",
        has_website: null,
      },
      profile,
    );
    assert.equal(patch.instagram_followers, 4200);
    assert.equal(patch.instagram_active, true);
    assert.equal(patch.instagram_quality, "good");
    assert.equal(patch.website, "https://hairlab.cz");
  });

  it("keeps existing quality without overwrite", () => {
    const patch = buildInstagramEnrichPatch(
      {
        instagram_active: false,
        instagram_quality: "excellent",
        website: "https://manual.cz",
        has_website: true,
      },
      profile,
    );
    assert.equal(patch.instagram_quality, undefined);
    assert.equal(patch.instagram_active, undefined);
    assert.equal(patch.website, undefined);
    assert.equal(patch.instagram_followers, 4200);
  });
});

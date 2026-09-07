import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGoogleEnrichPatch } from "@/lib/google-places/apply";
import {
  cityFromFormattedAddress,
  extractPlaceId,
  extractQueryFromMapsUrl,
} from "@/lib/google-places/parse-url";
import type { GooglePlaceSnapshot } from "@/lib/google-places/client";

describe("google places url parsing", () => {
  it("extracts ChIJ place ids", () => {
    assert.equal(extractPlaceId("ChIJE2C9cNiPEkcR5YwZ1R0m3xA"), "ChIJE2C9cNiPEkcR5YwZ1R0m3xA");
    assert.equal(
      extractPlaceId(
        "https://www.google.com/maps/place/Hair+Lab/@50.1,14.4,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d50!4d14!16s%2Fg%2F11",
      ),
      null,
    );
    assert.equal(
      extractPlaceId(
        "https://www.google.com/maps/place/?q=place_id:ChIJE2C9cNiPEkcR5YwZ1R0m3xA",
      ),
      "ChIJE2C9cNiPEkcR5YwZ1R0m3xA",
    );
  });

  it("extracts query from /maps/place/Name", () => {
    assert.equal(
      extractQueryFromMapsUrl(
        "https://www.google.com/maps/place/Hair+Lab+Praha/@50.1,14.4,17z",
      ),
      "Hair Lab Praha",
    );
  });

  it("parses city from formatted address", () => {
    assert.equal(
      cityFromFormattedAddress("Janovského 20, 170 00 Praha 7, Česko"),
      "Praha 7",
    );
  });
});

describe("google enrich merge", () => {
  const place: GooglePlaceSnapshot = {
    placeId: "ChIJtest",
    name: "Hair Lab",
    rating: 4.9,
    reviewsCount: 210,
    mapsUrl: "https://maps.google.com/?cid=1",
    formattedAddress: "Ulice 1, 110 00 Praha 1, Česko",
    city: "Praha 1",
    phone: "+420111222333",
    website: "https://hairlab.cz",
  };

  it("always updates rating fields and fills blanks", () => {
    const patch = buildGoogleEnrichPatch(
      {
        salon_name: null,
        city: null,
        phone: null,
        website: "—",
        has_website: false,
      },
      place,
    );
    assert.equal(patch.google_rating, 4.9);
    assert.equal(patch.google_reviews_count, 210);
    assert.equal(patch.salon_name, "Hair Lab");
    assert.equal(patch.city, "Praha 1");
    assert.equal(patch.phone, "+420111222333");
    assert.equal(patch.website, "https://hairlab.cz");
    assert.equal(patch.has_website, true);
    assert.equal(patch.enrichment_source, "google_places");
  });

  it("does not overwrite existing contact fields without flag", () => {
    const patch = buildGoogleEnrichPatch(
      {
        salon_name: "Manual Name",
        city: "Brno",
        phone: "+420999",
        website: "https://manual.cz",
        has_website: true,
      },
      place,
    );
    assert.equal(patch.salon_name, undefined);
    assert.equal(patch.city, undefined);
    assert.equal(patch.phone, undefined);
    assert.equal(patch.website, undefined);
    assert.equal(patch.google_rating, 4.9);
  });

  it("overwrites when requested", () => {
    const patch = buildGoogleEnrichPatch(
      {
        salon_name: "Manual Name",
        city: "Brno",
        phone: "+420999",
        website: "https://manual.cz",
        has_website: true,
      },
      place,
      { overwrite: true },
    );
    assert.equal(patch.salon_name, "Hair Lab");
    assert.equal(patch.city, "Praha 1");
  });
});

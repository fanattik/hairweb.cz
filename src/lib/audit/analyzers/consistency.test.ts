import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addressTokensAppearOnPage,
  normalizeHost,
  normalizePhone,
} from "@/lib/audit/analyzers/consistency";

describe("consistency helpers", () => {
  it("normalizes czech phones", () => {
    assert.equal(normalizePhone("+420 777 123 456"), "777123456");
    assert.equal(normalizePhone("777 123 456"), "777123456");
    assert.equal(normalizePhone("00420777123456"), "777123456");
  });

  it("normalizes website hosts", () => {
    assert.equal(normalizeHost("https://www.salon.cz/kontakt"), "salon.cz");
    assert.equal(normalizeHost("salon.cz"), "salon.cz");
    assert.equal(normalizeHost("https://Salon.CZ"), "salon.cz");
  });

  it("matches Google address tokens on English page text", () => {
    assert.equal(
      addressTokensAppearOnPage(
        "Korunovační 18, 170 00 Praha 7-Bubeneč, Česko",
        "Korunovacni 18, Letna, Prague 7",
      ),
      true,
    );
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { suggestColumnMapping } from "@/lib/leads/import/map-columns";
import {
  normalizeEmail,
  normalizePhone,
  normalizeWebsite,
  normalizeInstagram,
} from "@/lib/leads/import/normalize";
import { parsePasteText, parseCsvText } from "@/lib/leads/import/parse";
import { validateNormalizedLead } from "@/lib/leads/import/validate";
import { normalizeImportRow } from "@/lib/leads/import/normalize";
import { leadGradeFromScore } from "@/lib/leads/scoring";

describe("import normalize", () => {
  it("normalizes websites and domains", () => {
    assert.equal(normalizeWebsite("www.salonbella.cz").domain, "salonbella.cz");
    assert.equal(
      normalizeWebsite("salonbella.cz/").website,
      "https://salonbella.cz",
    );
  });

  it("normalizes CZ phones", () => {
    assert.equal(normalizePhone("777 123 456"), "+420777123456");
    assert.equal(normalizePhone("+420 777 123 456"), "+420777123456");
    assert.equal(normalizePhone("00420 777123456"), "+420777123456");
  });

  it("normalizes emails and instagram", () => {
    assert.equal(normalizeEmail("  Foo@Bar.CZ "), "foo@bar.cz");
    assert.equal(normalizeInstagram("@SalonBella").handle, "salonbella");
    assert.equal(
      normalizeInstagram("https://www.instagram.com/salonbella/").handle,
      "salonbella",
    );
  });
});

describe("import mapping + parse", () => {
  it("suggests column mapping", () => {
    const mapping = suggestColumnMapping([
      "Company",
      "Website",
      "Phone",
      "City",
    ]);
    assert.equal(mapping.Company, "salon_name");
    assert.equal(mapping.Website, "website");
    assert.equal(mapping.Phone, "phone");
    assert.equal(mapping.City, "city");
  });

  it("parses paste and csv", () => {
    const paste = parsePasteText(
      "Salon Bella\thttps://salonbella.cz\tPraha\t+420777111222\nSalon Jana\thttps://salonjana.cz\tBrno\t+420777222333",
    );
    assert.ok(paste.allRows.length >= 1);

    const csv = parseCsvText(
      "company;website;city\nSalon X;https://x.cz;Praha\n",
    );
    assert.equal(csv.delimiter, ";");
    assert.equal(csv.allRows.length, 1);
    assert.equal(csv.allRows[0].raw.company, "Salon X");
  });
});

describe("import validate + grade", () => {
  it("requires salon + identifier", () => {
    const lead = normalizeImportRow(
      { Company: "Salon" },
      { salon_name: "Salon" },
    );
    const result = validateNormalizedLead(lead);
    assert.equal(result.ok, false);

    const ok = normalizeImportRow(
      { Company: "Salon", Phone: "777123456" },
      { salon_name: "Salon", phone: "777123456" },
    );
    assert.equal(validateNormalizedLead(ok).ok, true);
  });

  it("maps lead grades", () => {
    assert.equal(leadGradeFromScore(80), "A");
    assert.equal(leadGradeFromScore(50), "B");
    assert.equal(leadGradeFromScore(25), "C");
    assert.equal(leadGradeFromScore(10), "D");
  });
});

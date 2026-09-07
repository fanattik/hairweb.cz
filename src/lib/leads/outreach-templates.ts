import type { Lead } from "@/lib/leads/types";

export const OUTREACH_TEMPLATES = [
  {
    key: "no_website",
    label: "Bez webu — nabídka",
    description: "Salon bez vlastního webu / jen IG + booking",
  },
  {
    key: "redesign",
    label: "Redesign webu",
    description: "Má web, ale působí zastarale / slabě",
  },
  {
    key: "local_seo",
    label: "Lokální SEO",
    description: "Dobrý salon, slabá viditelnost online",
  },
  {
    key: "follow_up",
    label: "Follow-up",
    description: "Krátké navázání po předchozí zprávě",
  },
  {
    key: "blank",
    label: "Prázdný draft",
    description: "Jen oslovení a podpis — doplníš sám",
  },
] as const;

export type OutreachTemplateKey = (typeof OUTREACH_TEMPLATES)[number]["key"];

function greetingName(lead: Pick<Lead, "contact_person" | "salon_name" | "name">) {
  const person = lead.contact_person?.trim();
  if (person) {
    const first = person.split(/\s+/)[0];
    return first || person;
  }
  return null;
}

function salonLabel(lead: Pick<Lead, "salon_name" | "name">) {
  return lead.salon_name?.trim() || lead.name.trim() || "váš salon";
}

function cityLine(lead: Pick<Lead, "city">) {
  return lead.city?.trim() || null;
}

function ratingLine(
  lead: Pick<Lead, "google_rating" | "google_reviews_count">,
) {
  if (lead.google_rating == null) return null;
  const rating = Number(lead.google_rating).toFixed(1);
  if (lead.google_reviews_count != null && lead.google_reviews_count > 0) {
    return `${rating}★ z ${lead.google_reviews_count} Google recenzí`;
  }
  return `${rating}★ na Googlu`;
}

function signature() {
  return ["Lukáš", "Hairweb.cz", "https://hairweb.cz"].join("\n");
}

function open(lead: Pick<Lead, "contact_person" | "salon_name" | "name">) {
  const name = greetingName(lead);
  if (name) return `Dobrý den ${name},`;
  return "Dobrý den,";
}

export type OutreachDraft = {
  subject: string;
  body: string;
  templateKey: OutreachTemplateKey;
};

export function buildOutreachDraft(
  lead: Lead,
  templateKey: OutreachTemplateKey,
): OutreachDraft {
  const salon = salonLabel(lead);
  const city = cityLine(lead);
  const rating = ratingLine(lead);
  const pitch =
    lead.recommended_pitch?.trim() ||
    "jednoduchý prezentační web napojený na rezervace";

  if (templateKey === "blank") {
    return {
      templateKey,
      subject: `${salon} — web pro salon`,
      body: [open(lead), "", "", signature()].join("\n"),
    };
  }

  if (templateKey === "follow_up") {
    return {
      templateKey,
      subject: `Ještě jednou k webu pro ${salon}`,
      body: [
        open(lead),
        "",
        `jen krátce navazuju na předchozí zprávu ohledně webu pro ${salon}.`,
        "",
        "Máte prostor se na to podívat, nebo to teď není aktuální?",
        "",
        "Klidně napište i jednou větou — ať vím, jestli to má smysl řešit.",
        "",
        signature(),
      ].join("\n"),
    };
  }

  if (templateKey === "redesign") {
    return {
      templateKey,
      subject: `${salon} — návrh modernějšího webu`,
      body: [
        open(lead),
        "",
        `píšu kvůli ${salon}${city ? ` v ${city}` : ""}.`,
        rating
          ? `Na Googlu vypadáte skvěle (${rating}) — klienty už máte.`
          : "Působíte jako zavedený salon s dobrou reputací.",
        "",
        "Současný web ale podle mě neodpovídá úrovni salonu — a právě to často stojí mezi vámi a novými rezervacemi z vyhledávání.",
        "",
        `Umím připravit ${pitch.toLowerCase()}. Bez zbytečné složitosti, mobilně, s jasnou rezervací.`,
        "",
        "Mám vám poslat krátký návrh, jak by to mohlo vypadat?",
        "",
        signature(),
      ].join("\n"),
    };
  }

  if (templateKey === "local_seo") {
    return {
      templateKey,
      subject: `${salon}${city ? ` ${city}` : ""} — víc klientů z Googlu`,
      body: [
        open(lead),
        "",
        `díval jsem se na ${salon}${city ? ` (${city})` : ""}.`,
        rating ? `Hodnocení ${rating} je výborné.` : null,
        "",
        "Co často chybí salonům s dobrou reputací, je web nastavený na lokální vyhledávání — aby vás lidé našli, když hledají kadeřnictví / barbera ve vašem okolí.",
        "",
        `Mohu připravit ${pitch.toLowerCase()} a nastavit stránku tak, aby lépe táhla organickou návštěvnost.`,
        "",
        "Chcete krátký audit, co by šlo u vás zlepšit?",
        "",
        signature(),
      ]
        .filter((line) => line != null)
        .join("\n"),
    };
  }

  // no_website (default)
  return {
    templateKey,
    subject: `${salon} — vlastní web místo jen Instagramu`,
    body: [
      open(lead),
      "",
      `píšu vám ohledně ${salon}${city ? ` v ${city}` : ""}.`,
      rating
        ? `Na Googlu máte ${rating} — to je silná pozice.`
        : "Působíte jako salon, který už má dobrou reputaci.",
      "",
      "Postrádám ale vlastní web — a právě tam často mizí rezervace od lidí, kteří vás hledají na Googlu a nechtějí řešit jen Instagram nebo třetí platformu.",
      "",
      `Umím dodat ${pitch.toLowerCase()}. Jednoduše, mobilně, s vaším stylem.`,
      "",
      "Mám vám poslat 2–3 konkrétní tipy, jak by to mohlo vypadat pro váš salon?",
      "",
      signature(),
    ].join("\n"),
  };
}

/** Pick best default template from lead signals. */
export function suggestOutreachTemplate(lead: Lead): OutreachTemplateKey {
  const hasWeb = lead.has_website !== false && lead.website && lead.website !== "—";
  if (!hasWeb) return "no_website";
  if (lead.website_outdated || (lead.web_score != null && lead.web_score < 50)) {
    return "redesign";
  }
  if (lead.recommended_pitch?.toLowerCase().includes("seo")) return "local_seo";
  return "redesign";
}

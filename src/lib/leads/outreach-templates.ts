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

export type HairwebPackageId = "start" | "pro";

/** Same packages as public pricing — used in CRM outreach. */
export const HAIRWEB_PACKAGES: Record<
  HairwebPackageId,
  {
    id: HairwebPackageId;
    name: string;
    price: string;
    summary: string;
    features: string[];
  }
> = {
  start: {
    id: "start",
    name: "START",
    price: "9 900 Kč",
    summary: "jednostránkový web",
    features: [
      "Jednostránkový web",
      "Design na míru",
      "Mobilní verze",
      "Služby a ceník",
      "Galerie",
      "Online rezervace",
      "Kontakty + mapa",
      "Základní SEO",
      "Spuštění webu",
    ],
  },
  pro: {
    id: "pro",
    name: "PRO",
    price: "14 900 Kč",
    summary: "kompletní vícestránkový web",
    features: [
      "Kompletní vícestránkový web",
      "Vše ze START",
      "Samostatné stránky služeb",
      "Tým",
      "Pokročilejší galerie",
      "Google recenze",
      "Lepší struktura pro SEO",
      "Lokální SEO",
      "Analytics",
      "Pokročilejší obsah",
    ],
  },
};

export const OUTREACH_PRICE_START = HAIRWEB_PACKAGES.start.price;
export const OUTREACH_PRICE_PRO = HAIRWEB_PACKAGES.pro.price;

export type WebsiteShape = "none" | "one_pager" | "multi_page" | "unknown";

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
  return [
    "S pozdravem",
    "",
    "Lukáš Ptáčník",
    "HAIRWEB.cz",
    "Weby pro kadeřnictví, barber shopy a vlasová studia",
  ].join("\n");
}

function open() {
  return "Dobrý den,";
}

function hasOwnWebsite(lead: Lead): boolean {
  return (
    lead.has_website !== false && Boolean(lead.website && lead.website !== "—")
  );
}

function textBlob(lead: Lead): string {
  return [
    lead.website_audit,
    lead.opportunity_summary,
    lead.opportunity_note,
    lead.recommended_pitch,
    lead.suggested_service,
    lead.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Infer current site shape so we offer like-for-like (one-pager → START, multi → PRO).
 */
export function inferWebsiteShape(lead: Lead): WebsiteShape {
  if (!hasOwnWebsite(lead)) return "none";

  const blob = textBlob(lead);
  if (
    /jednostrán|one[\s-]?page|single[\s-]?page|landing\s*page|vše na jedné stránce|vse na jedne strance/.test(
      blob,
    )
  ) {
    return "one_pager";
  }
  if (
    /vícestrán|vicestran|multi[\s-]?page|podstránk|samostatn\w* stránk|stránky služeb|stranky sluzeb|menu navigace|více stránek|vice stranek/.test(
      blob,
    )
  ) {
    return "multi_page";
  }

  if (
    lead.package === "pro" ||
    lead.suggested_service?.toLowerCase().includes("pro") ||
    /lokáln\w*\s*seo|local seo|struktura pro seo|samostatn/.test(blob)
  ) {
    return "multi_page";
  }

  return "one_pager";
}

/** Concrete problems for this lead — used in mail copy / AI (never invent). */
export function customerProblems(lead: Lead): string[] {
  const problems: string[] = [];
  const shape = inferWebsiteShape(lead);

  if (shape === "none") {
    problems.push("chybí vlastní web");
  }
  if (lead.website_outdated) {
    problems.push("web působí zastarale");
  }
  if (lead.website_mobile_problem) {
    problems.push("slabší mobilní verze");
  }
  if (lead.website_clear_booking_cta === false) {
    problems.push("nejasné objednání z webu");
  }
  if (lead.website_has_prices === false) {
    problems.push("chybí přehledný ceník");
  }
  if (lead.website_has_gallery === false && hasOwnWebsite(lead)) {
    problems.push("galerie není dostatečně vidět");
  }
  if (
    lead.website_seo_score != null &&
    lead.website_seo_score < 50 &&
    hasOwnWebsite(lead)
  ) {
    problems.push("slabší SEO");
  }

  return [...new Set(problems)].slice(0, 4);
}

/**
 * Distinctive phrases from audit/notes (e.g. K-SCAN) — never invent.
 */
export function distinctiveHighlights(lead: Lead): string[] {
  const source = [
    lead.website_audit,
    lead.opportunity_note,
    lead.opportunity_summary,
    lead.notes,
  ]
    .filter(Boolean)
    .join("\n");

  if (!source.trim()) return [];

  const found = new Set<string>();

  for (const match of source.matchAll(
    /\b(?:technologie\s+)?([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž0-9]*(?:-[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9]+)+)\b/g,
  )) {
    const value = match[1]?.trim();
    if (value && value.length >= 3 && value.length <= 32) found.add(value);
  }

  for (const match of source.matchAll(
    /\b(K-SCAN|Olaplex|Kerastase|Kérastase|Balayage|AirTouch|Nanoplastia|Nanoplastie|Great Lengths|HairTalk)\b/gi,
  )) {
    found.add(match[1]);
  }

  return [...found].slice(0, 3);
}

/**
 * Content the salon already presents — for prose lists in the mail.
 * Forms fit „základ – služby, tým, ceník i galerii“.
 */
export function contentStrengths(lead: Lead): string[] {
  const items: string[] = [];
  if (hasOwnWebsite(lead) || lead.website_has_prices || lead.website_has_gallery) {
    items.push("služby");
  }
  for (const highlight of distinctiveHighlights(lead)) {
    items.push(highlight);
  }
  if (lead.website_has_team) items.push("tým");
  if (lead.website_has_prices) items.push("ceník");
  if (lead.website_has_gallery) items.push("galerii");
  if (lead.website_has_reviews) items.push("recenze");
  if (lead.has_online_booking || lead.website_clear_booking_cta) {
    items.push(
      lead.booking_provider
        ? `online rezervaci (${lead.booking_provider})`
        : "online rezervaci",
    );
  }
  return items;
}

function joinCzechList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} i ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} i ${items[items.length - 1]}`;
}

/** „zaujal mě hlavně …“ — bez slova „hlavně“ (doplní šablona). */
function interestLine(lead: Lead, strengths: string[]): string {
  const distinctive = distinctiveHighlights(lead);
  if (distinctive.length && strengths.includes("služby")) {
    return distinctive.length === 1
      ? `rozsah služeb a technologie ${distinctive[0]}`
      : `rozsah služeb a ${joinCzechList(distinctive)}`;
  }
  if (distinctive.length) return joinCzechList(distinctive);
  if (strengths.length >= 2) return joinCzechList(strengths.slice(0, 3));
  if (strengths.length === 1) return strengths[0];
  const rating = ratingLine(lead);
  if (rating) return `úroveň salonu (${rating})`;
  return "prezentaci salonu";
}

function softCta(): string[] {
  return [
    "Aby pro Vás nabídka nebyla jen „na papíře“, rád Vám zdarma a nezávazně připravím ukázku, jak by mohla vypadat nová úvodní stránka Vašeho salonu.",
    "",
    "Pokud Vás to zaujalo, stačí mi odpovědět „ANO“ a návrh Vám připravím.",
    "Teprve pokud se Vám bude nový směr líbit, můžeme se bavit o samotné realizaci.",
  ];
}

/**
 * Prose „Součástí by byl…“ — jako v reálném outreach mailu.
 */
export function scopeSentence(
  _lead: Lead,
  pkgId: HairwebPackageId,
  strengths: string[],
): string {
  const bits = (strengths.length
    ? strengths
    : ["služby", "ceník", "galerie"]
  ).map((item) => {
    if (item === "galerii") return "galerie";
    if (item === "online rezervaci") return "online rezervace";
    if (item.startsWith("online rezervaci (")) {
      return item.replace("online rezervaci (", "online rezervace (");
    }
    return item;
  });

  // Example style: „prezentace služeb a K-SCAN, tým, ceník, galerie“
  let presentation: string;
  if (bits[0] === "služby" && bits.length >= 2) {
    presentation = `prezentace služeb a ${bits[1]}${bits.length > 2 ? `, ${bits.slice(2).join(", ")}` : ""}`;
  } else if (bits[0] === "služby") {
    presentation = "prezentace služeb";
  } else {
    presentation = bits.join(", ");
  }

  if (pkgId === "pro") {
    return `Součástí by byl kompletní vícestránkový web s individuálním vzhledem, responzivním zpracováním pro mobil i počítač, samostatnými stránkami služeb, přepracováním současného obsahu (${presentation}), kontakty a mapou, výraznými možnostmi objednání, lokálním SEO, Analytics a pokročilejším obsahem.`;
  }

  return `Součástí by byl nový individuální vzhled, responzivní zpracování pro mobil i počítač, přepracování současného obsahu, ${presentation}, kontakty a mapa, výrazné možnosti objednání a základní SEO.`;
}

function wantsExplicitPro(lead: Lead): boolean {
  return (
    lead.package === "pro" ||
    Boolean(lead.suggested_service?.toLowerCase().includes("pro")) ||
    Boolean(
      lead.recommended_pitch
        ?.toLowerCase()
        .match(/lokáln\w*\s*seo|vícestrán|vicestran|pro balíček|balíček pro/),
    )
  );
}

/**
 * Match package to situation:
 * - one-pager / first site → START
 * - multi-page need / local SEO → PRO
 */
export function suggestHairwebPackage(
  lead: Lead,
  templateKey: OutreachTemplateKey,
): HairwebPackageId {
  if (templateKey === "local_seo") return "pro";
  if (templateKey === "follow_up" || templateKey === "blank") {
    return suggestHairwebPackage(lead, suggestOutreachTemplate(lead));
  }
  if (wantsExplicitPro(lead)) return "pro";

  const shape = inferWebsiteShape(lead);

  if (templateKey === "redesign") {
    return shape === "multi_page" ? "pro" : "start";
  }

  if (shape === "none" || templateKey === "no_website") {
    if (lead.business_size === "medium" || lead.business_size === "large") {
      return "pro";
    }
    return "start";
  }

  return shape === "multi_page" ? "pro" : "start";
}

export type OutreachDraft = {
  subject: string;
  body: string;
  templateKey: OutreachTemplateKey;
  packageId: HairwebPackageId;
};

export function buildOutreachDraft(
  lead: Lead,
  templateKey: OutreachTemplateKey,
  packageId?: HairwebPackageId,
): OutreachDraft {
  const salon = salonLabel(lead);
  const city = cityLine(lead);
  const rating = ratingLine(lead);
  const strengths = contentStrengths(lead);
  const strengthsLine = joinCzechList(strengths);
  const pkgId = packageId ?? suggestHairwebPackage(lead, templateKey);
  const pkg = HAIRWEB_PACKAGES[pkgId];

  if (templateKey === "blank") {
    return {
      templateKey,
      packageId: pkgId,
      subject: `${salon} — nabídka webu`,
      body: [open(), "", "", signature()].join("\n"),
    };
  }

  if (templateKey === "follow_up") {
    return {
      templateKey,
      packageId: pkgId,
      subject: `Ještě jednou k webu pro ${salon}`,
      body: [
        open(),
        "",
        `jen krátce navazuji na předchozí zprávu ohledně webu pro ${salon} (nabídka za ${pkg.price}).`,
        "",
        "Máte prostor se na to podívat, nebo to teď není aktuální?",
        "",
        "Pokud Vás to zaujalo, stačí mi odpovědět „ANO“ a připravím Vám zdarma nezávaznou ukázku úvodní stránky.",
        "",
        signature(),
      ].join("\n"),
    };
  }

  if (templateKey === "redesign") {
    const interest = interestLine(lead, strengths);
    const foundation = strengthsLine || "služby i základní informace o salonu";

    return {
      templateKey,
      packageId: pkgId,
      subject: `${salon} — redesign webu`,
      body: [
        open(),
        "",
        `narazil jsem na web Vašeho salonu ${salon} a zaujal mě hlavně ${interest}.`,
        "",
        `Myslím si ale, že současný web už vizuálně úplně neodpovídá úrovni salonu a služeb, které nabízíte. Obsahově přitom máte velmi dobrý základ – ${foundation} – který by se dal prezentovat moderněji a především lépe na mobilních telefonech.`,
        "",
        pkgId === "pro"
          ? `Rád bych Vám proto nabídl kompletní redesign současného webu do vícestránkové podoby za ${pkg.price}.`
          : `Rád bych Vám proto nabídl kompletní redesign současného webu za ${pkg.price}.`,
        "",
        scopeSentence(lead, pkgId, strengths),
        "",
        ...softCta(),
        "",
        signature(),
      ].join("\n"),
    };
  }

  if (templateKey === "local_seo") {
    return {
      templateKey,
      packageId: "pro",
      subject: `${salon}${city ? ` ${city}` : ""} — web a lokální SEO`,
      body: [
        open(),
        "",
        `narazil jsem na ${salon}${city ? ` v ${city}` : ""}${rating ? ` (${rating})` : ""}.`,
        "",
        "Myslím si, že úroveň salonu už máte — co často chybí, je web připravený na lokální vyhledávání, aby Vás lidé snáz našli a rovnou se objednali.",
        "",
        `Rád bych Vám proto nabídl kompletní vícestránkový web s důrazem na lokální SEO za ${HAIRWEB_PACKAGES.pro.price}.`,
        "",
        scopeSentence(lead, "pro", strengths.length ? strengths : ["služby", "ceník", "galerii"]),
        "",
        ...softCta(),
        "",
        signature(),
      ].join("\n"),
    };
  }

  // no_website
  const bookingBit = lead.booking_provider
    ? ` a ${lead.booking_provider}`
    : lead.has_online_booking
      ? " a rezervační systém"
      : "";

  const intro = lead.instagram_handle || lead.instagram_url
    ? `narazil jsem na Váš salon ${salon}${city ? ` v ${city}` : ""}${rating ? ` (${rating})` : ""}. Na Instagramu${bookingBit ? ` / přes${bookingBit}` : ""} působíte dobře — chybí ale vlastní web, který by Vás reprezentoval na Googlu a převáděl zájem na rezervace.`
    : `narazil jsem na Váš salon ${salon}${city ? ` v ${city}` : ""}${rating ? ` (${rating})` : ""}. Chybí Vám ale vlastní web, který by salon reprezentoval na Googlu a převáděl návštěvy na rezervace.`;

  const noWebScope =
    pkgId === "pro"
      ? `Součástí by byl kompletní vícestránkový web s individuálním vzhledem, responzivním zpracováním, samostatnými stránkami služeb, týmem, galerií, Google recenzemi, ceníkem, kontakty a mapou, online rezervací, lokálním SEO, Analytics a pokročilejším obsahem.`
      : `Součástí by byl nový individuální vzhled, responzivní zpracování pro mobil i počítač, služby a ceník, galerie, online rezervace, kontakty a mapa a základní SEO.`;

  return {
    templateKey,
    packageId: pkgId,
    subject: `${salon} — nový web za ${pkg.price}`,
    body: [
      open(),
      "",
      intro,
      "",
      pkgId === "pro"
        ? `Rád bych Vám proto nabídl kompletní vícestránkový web za ${pkg.price}.`
        : `Rád bych Vám proto nabídl nový jednostránkový web za ${pkg.price}.`,
      "",
      noWebScope,
      "",
      ...softCta(),
      "",
      signature(),
    ].join("\n"),
  };
}

/** Pick best default template from lead signals. */
export function suggestOutreachTemplate(lead: Lead): OutreachTemplateKey {
  if (!hasOwnWebsite(lead)) return "no_website";
  if (
    lead.recommended_pitch?.toLowerCase().includes("seo") ||
    lead.opportunity_summary?.toLowerCase().includes("seo")
  ) {
    return "local_seo";
  }
  return "redesign";
}

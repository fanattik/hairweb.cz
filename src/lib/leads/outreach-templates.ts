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
  return ["S pozdravem", "Lukáš Ptáčník", "HAIRWEB.cz"].join("\n");
}

function open(lead: Pick<Lead, "contact_person" | "salon_name" | "name">) {
  const name = greetingName(lead);
  if (name) return `Dobrý den ${name},`;
  return "Dobrý den,";
}

function hasOwnWebsite(lead: Lead): boolean {
  return lead.has_website !== false && Boolean(lead.website && lead.website !== "—");
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

  // Audit crawl is homepage-only; team/gallery/prices usually = one-pager sections.
  // Multi-page only when SEO/structure need is explicit or lead already tagged PRO.
  if (
    lead.package === "pro" ||
    lead.suggested_service?.toLowerCase().includes("pro") ||
    /lokáln\w*\s*seo|local seo|struktura pro seo|samostatn/.test(blob)
  ) {
    return "multi_page";
  }

  return "one_pager";
}

/** Concrete problems for this lead — used in mail copy (never invent). */
export function customerProblems(lead: Lead): string[] {
  const problems: string[] = [];
  const shape = inferWebsiteShape(lead);

  if (shape === "none") {
    problems.push("chybí vlastní web (salon je vidět spíš jinde než na Googlu)");
  }
  if (lead.website_outdated) {
    problems.push("web působí zastarale a neodpovídá úrovni služeb");
  }
  if (lead.website_mobile_problem) {
    problems.push("na mobilu se web špatně používá / prohlíží");
  }
  if (lead.website_clear_booking_cta === false) {
    problems.push("z webu není jasné, jak se rychle objednat");
  }
  if (lead.website_has_prices === false) {
    problems.push("chybí přehledný ceník služeb");
  }
  if (lead.website_has_gallery === false && hasOwnWebsite(lead)) {
    problems.push("galerie / ukázky práce nejsou dostatečně vidět");
  }
  if (
    lead.website_seo_score != null &&
    lead.website_seo_score < 50 &&
    hasOwnWebsite(lead)
  ) {
    problems.push("slabší připravenost webu na vyhledávání (SEO)");
  }
  if (
    lead.web_score != null &&
    lead.web_score < 45 &&
    hasOwnWebsite(lead) &&
    !lead.website_outdated
  ) {
    problems.push("celkový dojem webu je slabší než reputace salonu");
  }
  if (
    lead.google_rating != null &&
    lead.google_rating >= 4.6 &&
    hasOwnWebsite(lead) &&
    (lead.web_score == null || lead.web_score < 55)
  ) {
    problems.push(
      "Google reputace je silná, ale web ji dostatečně neprodává",
    );
  }

  const note = lead.opportunity_summary?.trim() || lead.opportunity_note?.trim();
  if (note && note.length <= 160 && problems.length < 3) {
    problems.push(note);
  }

  return [...new Set(problems)].slice(0, 4);
}

/** What the salon already has — used to sound specific, not generic. */
export function contentStrengths(lead: Lead): string[] {
  const items: string[] = [];
  if (lead.website_has_prices) items.push("ceník");
  if (lead.website_has_gallery) items.push("galerii");
  if (lead.website_has_team) items.push("tým");
  if (lead.website_has_reviews) items.push("recenze");
  if (lead.has_online_booking || lead.website_clear_booking_cta) {
    items.push(
      lead.booking_provider
        ? `rezervace (${lead.booking_provider})`
        : "online rezervaci",
    );
  }
  if (lead.instagram_active || lead.instagram_handle || lead.instagram_url) {
    items.push("Instagram");
  }
  return items;
}

function joinCzechList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} i ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} i ${items[items.length - 1]}`;
}

function auditHook(lead: Lead): string | null {
  const audit = lead.website_audit?.trim();
  if (!audit) return null;
  const line = audit
    .split(/[\n.!?]/)
    .map((part) => part.trim())
    .find((part) => part.length >= 20 && part.length <= 140);
  return line || null;
}

function packageBlock(
  pkg: (typeof HAIRWEB_PACKAGES)[HairwebPackageId],
  whyThisPackage: string,
): string[] {
  return [
    `Proto dává smysl balíček ${pkg.name} — ${pkg.summary} za ${pkg.price}.`,
    whyThisPackage,
    "",
    "Součástí je:",
    ...pkg.features.map((feature) => `– ${feature}`),
  ];
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
 * Never upsell multi-page just because salon is popular.
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
    // Like-for-like: one-pager stays START; only multi_page → PRO.
    return shape === "multi_page" ? "pro" : "start";
  }

  // no_website — first site is usually START unless larger shop needs structure
  if (shape === "none" || templateKey === "no_website") {
    if (lead.business_size === "medium" || lead.business_size === "large") {
      return "pro";
    }
    return "start";
  }

  return shape === "multi_page" ? "pro" : "start";
}

function packageWhy(
  lead: Lead,
  templateKey: OutreachTemplateKey,
  pkgId: HairwebPackageId,
): string {
  const shape = inferWebsiteShape(lead);
  if (pkgId === "start") {
    if (templateKey === "no_website") {
      return "Nechci Vám hnát vícestránkový web — pro začátek stačí čistá jednostránka, která pokryje služby, ceník, galerii, rezervace i kontakty.";
    }
    if (shape === "one_pager" || templateKey === "redesign") {
      return "Když už máte (nebo potřebujete) jednostránkový formát, dává smysl ho modernizovat ve stejném rozsahu — ne komplikovat zbytečně na více stránek.";
    }
    return "START drží rozsah jednoduchý: jeden přehledný web, který prodá salon a dovede k rezervaci.";
  }

  if (templateKey === "local_seo") {
    return "U lokálního SEO potřebujete samostatné stránky a silnější strukturu — proto PRO, ne jen jednostránku.";
  }
  if (shape === "multi_page") {
    return "Když má smysl vícestránková struktura (služby, tým, SEO), je lepší jít rovnou do PRO než natahovat jednostránku.";
  }
  return "PRO dává smysl, pokud chcete růst přes Google a mít prostor pro služby, tým i obsah.";
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
  const problems = customerProblems(lead);
  const hook = auditHook(lead);
  const pkgId = packageId ?? suggestHairwebPackage(lead, templateKey);
  const pkg = HAIRWEB_PACKAGES[pkgId];
  const why = packageWhy(lead, templateKey, pkgId);

  if (templateKey === "blank") {
    return {
      templateKey,
      packageId: pkgId,
      subject: `${salon} — nabídka webu ${pkg.name}`,
      body: [open(lead), "", "", signature()].join("\n"),
    };
  }

  if (templateKey === "follow_up") {
    return {
      templateKey,
      packageId: pkgId,
      subject: `Ještě jednou k webu pro ${salon}`,
      body: [
        open(lead),
        "",
        `jen krátce navazuji na předchozí zprávu ohledně webu pro ${salon} (balíček ${pkg.name} za ${pkg.price}).`,
        "",
        "Máte prostor se na to podívat, nebo to teď není aktuální?",
        "",
        "Pokud Vás to zaujalo, stačí odpovědět „ANO“ a připravím Vám zdarma nezávaznou ukázku úvodní stránky.",
        "",
        signature(),
      ].join("\n"),
    };
  }

  const softCta = [
    "Aby to nebylo jen obecné, rád Vám zdarma a nezávazně připravím ukázku nové úvodní stránky přesně pro Váš salon.",
    "",
    "Pokud Vás to zaujalo, stačí mi odpovědět „ANO“ a návrh Vám připravím.",
    "Teprve pokud se Vám bude směr líbit, můžeme se bavit o realizaci.",
  ];

  const problemParagraph =
    problems.length > 0
      ? `Konkrétně u Vás vidím: ${joinCzechList(problems)}.`
      : null;

  if (templateKey === "redesign") {
    const noticed = hook
      ? `díval jsem se na web ${salon} — ${hook.charAt(0).toLowerCase()}${hook.slice(1)}.`
      : strengthsLine
        ? `díval jsem se na web ${salon}${city ? ` (${city})` : ""}. Obsahově máte základ — ${strengthsLine}.`
        : `díval jsem se na web ${salon}${city ? ` v ${city}` : ""}.`;

    const gap = rating
      ? `Problém je, že web už nepůsobí na úrovni salonu — přitom na Googlu máte ${rating}.`
      : "Problém je, že web už nepůsobí na úrovni salonu a služeb, které nabízíte.";

    return {
      templateKey,
      packageId: pkgId,
      subject:
        pkgId === "start"
          ? `${salon} — modernizace jednostránkového webu`
          : `${salon} — redesign vícestránkového webu`,
      body: [
        open(lead),
        "",
        noticed,
        "",
        gap,
        problemParagraph,
        strengthsLine && !hook
          ? `Nechci Vám říkat, že nic nemáte — naopak, ${strengthsLine} by se dal(y) prezentovat čistěji a hlavně lépe na mobilu.`
          : strengthsLine
            ? `To, co funguje (${strengthsLine}), bych nechal — jen to podat moderněji.`
            : null,
        "",
        ...packageBlock(pkg, why),
        "",
        ...softCta,
        "",
        signature(),
      ]
        .filter((line): line is string => line != null)
        .join("\n"),
    };
  }

  if (templateKey === "local_seo") {
    const pro = HAIRWEB_PACKAGES.pro;
    return {
      templateKey,
      packageId: "pro",
      subject: `${salon}${city ? ` ${city}` : ""} — web připravený na lokální SEO`,
      body: [
        open(lead),
        "",
        `díval jsem se na ${salon}${city ? ` v ${city}` : ""}.`,
        rating
          ? `Hodnocení ${rating} je silné — reputaci máte.`
          : "Působíte jako salon se silnou reputací.",
        "",
        problemParagraph ||
          "Co často brzdí podobné salony, je web bez struktury pro lokální vyhledávání — lidé Vás pak hůř najdou, i když služby jsou výborné.",
        "",
        ...packageBlock(
          pro,
          "Proto u Vás nedává smysl jen kosmetická jednostránka, ale PRO s lokálním SEO a samostatnými stránkami.",
        ),
        "",
        ...softCta,
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
    ? `narazil jsem na ${salon}${city ? ` v ${city}` : ""}${rating ? ` (${rating})` : ""}. Na Instagramu${bookingBit ? ` / přes${bookingBit}` : ""} působíte dobře — chybí ale vlastní web, který Vás podrží na Googlu a převede zájem na rezervace.`
    : `narazil jsem na ${salon}${city ? ` v ${city}` : ""}${rating ? ` (${rating})` : ""}. Chybí Vám vlastní web, který salon reprezentuje na Googlu a převádí návštěvy na rezervace.`;

  const extraProblems = problems.filter(
    (p) => !p.includes("chybí vlastní web"),
  );

  return {
    templateKey,
    packageId: pkgId,
    subject:
      pkgId === "start"
        ? `${salon} — jednostránkový web za ${pkg.price}`
        : `${salon} — vícestránkový web za ${pkg.price}`,
    body: [
      open(lead),
      "",
      intro,
      extraProblems.length
        ? `Navíc: ${joinCzechList(extraProblems)}.`
        : null,
      "",
      ...packageBlock(pkg, why),
      "",
      ...softCta,
      "",
      signature(),
    ]
      .filter((line): line is string => line != null)
      .join("\n"),
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
  if (
    lead.website_outdated ||
    lead.website_mobile_problem ||
    (lead.web_score != null && lead.web_score < 50)
  ) {
    return "redesign";
  }
  return "redesign";
}

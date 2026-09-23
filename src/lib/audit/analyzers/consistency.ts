import { check, type Analyzer } from "@/lib/audit/analyzers/types";

/** Normalize CZ phone numbers for comparison. */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("420") && digits.length > 9) {
    digits = digits.slice(3);
  }
  if (digits.length < 9) return null;
  return digits.slice(-9);
}

export function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;
  let raw = value.trim();
  if (!raw) return null;
  try {
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    if (!host.includes(".")) return null;
    return host;
  } catch {
    return null;
  }
}

function normalizeName(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** True when distinctive address tokens from Google appear in page text. */
export function addressTokensAppearOnPage(
  formattedAddress: string,
  pageText: string,
): boolean {
  const page = normalizeName(pageText);
  if (!page) return false;

  const tokens = normalizeName(formattedAddress)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 4 &&
        !/^\d+$/.test(token) &&
        ![
          "czech",
          "cesko",
          "czechia",
          "republic",
          "ceska",
          "republika",
        ].includes(token),
    );

  // Street / locality name present on the page
  if (tokens.some((token) => page.includes(token))) return true;

  // House number + city-ish token together
  const houseNumbers = formattedAddress.match(/\b\d{1,4}[a-zA-Z]?\b/g) || [];
  for (const num of houseNumbers) {
    const n = num.toLowerCase();
    if (page.includes(` ${n} `) || page.includes(` ${n},`) || page.endsWith(` ${n}`)) {
      if (tokens.some((token) => page.includes(token))) return true;
    }
  }
  return false;
}

function namesLooselyMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = new Set(left.split(" ").filter((t) => t.length > 2));
  const rightTokens = right.split(" ").filter((t) => t.length > 2);
  if (!rightTokens.length) return false;
  const overlap = rightTokens.filter((t) => leftTokens.has(t)).length;
  return overlap >= Math.min(2, rightTokens.length);
}

/**
 * Cross-channel consistency: Google ↔ website ↔ answers.
 * Flags small NAP / hours / services mismatches people actually need to fix.
 */
export const analyzeConsistency: Analyzer = (ctx) => {
  const { answers, place, page } = ctx;
  const checks = [];

  const googlePhone = normalizePhone(place?.phone);
  const websitePhones = (page?.phones || [])
    .map((p) => normalizePhone(p))
    .filter((p): p is string => Boolean(p));
  const googleHost = normalizeHost(place?.website);
  const answerHost = normalizeHost(answers.websiteUrl || answers.suggestedWebsite);
  const pageHost = normalizeHost(page?.finalUrl || page?.url);

  // --- Website URL consistency ---
  if (googleHost && answerHost) {
    const match = googleHost === answerHost;
    checks.push(
      check({
        checkId: "consistency_website_url",
        category: "google",
        status: match ? "pass" : "fail",
        points: match ? 6 : 0,
        maxPoints: 6,
        severity: match ? "none" : "high",
        title: match
          ? "Stejný web na Googlu i v auditu"
          : "Rozdílný web na Googlu a na webu salonu",
        description: match
          ? `Google i váš web ukazují stejnou doménu (${googleHost}).`
          : `Na Googlu je „${place?.website}“, v auditu „${answers.websiteUrl}“. Zákazník může skončit na špatném místě.`,
        recommendation: match
          ? null
          : "Sjednoťte odkaz na web v Google Business Profile se skutečnou adresou webu.",
        source: "consistency",
        value: `${googleHost} vs ${answerHost}`,
        ease: 5,
        impact: 4,
      }),
    );
  } else if (googleHost && pageHost && googleHost !== pageHost) {
    checks.push(
      check({
        checkId: "consistency_website_url",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 6,
        severity: "high",
        title: "Web na Googlu neodpovídá načtené stránce",
        description: `Google odkazuje na ${googleHost}, ale analyzovali jsme ${pageHost}.`,
        recommendation:
          "Zkontrolujte odkaz na web v Google profilu — měl by vést na aktuální stránky salonu.",
        source: "consistency",
        ease: 5,
        impact: 4,
      }),
    );
  } else if (place && !place.website && answers.hasWebsite && answers.websiteUrl) {
    checks.push(
      check({
        checkId: "consistency_website_url",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 6,
        severity: "medium",
        title: "Na Googlu chybí odkaz na web",
        description:
          "Salon má web, ale v Google Business Profile není uveden.",
        recommendation: "Doplňte URL webu do Google profilu.",
        source: "consistency",
        ease: 5,
        impact: 3,
      }),
    );
  }

  // --- Phone consistency ---
  if (googlePhone && websitePhones.length > 0) {
    const match = websitePhones.includes(googlePhone);
    checks.push(
      check({
        checkId: "consistency_phone",
        category: "google",
        status: match ? "pass" : "fail",
        points: match ? 6 : 0,
        maxPoints: 6,
        severity: match ? "none" : "high",
        title: match
          ? "Telefon na Googlu a webu sedí"
          : "Telefon na Googlu a webu se neshoduje",
        description: match
          ? "Zákazník najde stejné číslo na Googlu i na webu."
          : `Google: ${place?.phone}. Web: ${page?.phones?.[0] || "jiné číslo"}. Rozdílné kontakty snižují důvěru a mohou znamenat zmeškané hovory.`,
        recommendation: match
          ? null
          : "Sjednoťte telefon na webu, Googlu a dalších profilech na jedno aktuální číslo.",
        source: "consistency",
        ease: 5,
        impact: 5,
      }),
    );
  } else if (googlePhone && page && !page.fetchError && websitePhones.length === 0) {
    checks.push(
      check({
        checkId: "consistency_phone",
        category: "web",
        status: "partial",
        points: 2,
        maxPoints: 6,
        severity: "medium",
        title: "Telefon je na Googlu, na webu ho nevidíme",
        description:
          "Na webu jsme nenašli telefonní číslo (nebo není jako odkaz tel:).",
        recommendation:
          "Přidejte na web jasně viditelný telefon — ideálně jako klikací odkaz.",
        source: "consistency",
        ease: 4,
        impact: 4,
      }),
    );
  } else if (!googlePhone && websitePhones.length > 0 && place?.placeId) {
    checks.push(
      check({
        checkId: "consistency_phone",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 6,
        severity: "medium",
        title: "Telefon je na webu, na Googlu chybí",
        description: "Web telefon ukazuje, Google profil ne.",
        recommendation: "Doplňte stejné telefonní číslo do Google Business Profile.",
        source: "consistency",
        ease: 5,
        impact: 4,
      }),
    );
  }

  // --- Address / city ---
  if (place?.city && answers.city) {
    const cityMatch = namesLooselyMatch(place.city, answers.city);
    checks.push(
      check({
        checkId: "consistency_city",
        category: "google",
        status: cityMatch ? "pass" : "partial",
        points: cityMatch ? 3 : 1,
        maxPoints: 3,
        severity: cityMatch ? "none" : "medium",
        title: cityMatch
          ? "Město sedí s Google profilem"
          : "Město se neshoduje s Google profilem",
        description: cityMatch
          ? `Lokalita „${place.city}“ odpovídá údaji v auditu.`
          : `V auditu je „${answers.city}“, na Googlu „${place.city}“.`,
        recommendation: cityMatch
          ? null
          : "Ověřte adresu a město na Googlu i na webu — musí být stejné.",
        source: "consistency",
        ease: 4,
        impact: 3,
      }),
    );
  }

  if (place?.formattedAddress && page && !page.fetchError) {
    const addressOnPage =
      page.hasAddressMention === true ||
      addressTokensAppearOnPage(place.formattedAddress, page.textSample || "");
    if (!addressOnPage && page.hasAddressMention === false) {
      checks.push(
        check({
          checkId: "consistency_address_on_web",
          category: "web",
          status: "partial",
          points: 1,
          maxPoints: 4,
          severity: "medium",
          title: "Adresa je na Googlu, na webu ji nevidíme",
          description:
            "Google má adresu, ale na webu jsme nenašli jasnou zmínku o adrese / PSČ.",
          recommendation:
            "Doplňte na web kompletní adresu salonu (a ideálně mapu / odkaz na Google).",
          source: "consistency",
          ease: 4,
          impact: 3,
        }),
      );
    }
  }

  // --- Opening hours ---
  const googleHours = place?.openingHours?.weekdayDescriptions || [];
  if (googleHours.length > 0 && page && !page.fetchError) {
    if (page.hasOpeningHours) {
      checks.push(
        check({
          checkId: "consistency_hours_presence",
          category: "google",
          status: "pass",
          points: 5,
          maxPoints: 5,
          severity: "none",
          title: "Otevírací doba je na Googlu i na webu",
          description:
            "Otevírací dobu najdeme na Googlu i na webu. Po změně ji vždy upravte na obou místech.",
          recommendation: null,
          source: "consistency",
          value: googleHours.slice(0, 2).join(" · "),
        }),
      );
    } else {
      checks.push(
        check({
          checkId: "consistency_hours_presence",
          category: "web",
          status: "fail",
          points: 0,
          maxPoints: 5,
          severity: "high",
          title: "Otevírací doba je na Googlu, na webu chybí",
          description: `Google ukazuje např. „${googleHours[0]}“, na webu jsme otevírací dobu nenašli.`,
          recommendation:
            "Přidejte otevírací dobu na web a při každé změně ji sjednoťte s Googlem (ideálně přes HAIRWEB HUB).",
          source: "consistency",
          ease: 4,
          impact: 4,
        }),
      );
    }
  } else if (place?.placeId && googleHours.length === 0) {
    checks.push(
      check({
        checkId: "consistency_hours_presence",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 5,
        severity: "high",
        title: "Na Googlu chybí otevírací doba",
        description:
          "Bez otevírací doby na Google profilu ztrácíte důvěru i lokální relevanci.",
        recommendation: "Doplňte aktuální otevírací dobu do Google Business Profile.",
        source: "consistency",
        ease: 5,
        impact: 4,
      }),
    );
  } else if (
    page?.hasOpeningHours &&
    place?.placeId &&
    googleHours.length === 0
  ) {
    checks.push(
      check({
        checkId: "consistency_hours_presence",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 5,
        severity: "medium",
        title: "Otevírací doba je na webu, na Googlu ne",
        description: "Web dobu uvádí, Google profil ne — zákazníci z vyhledávání ji neuvidí.",
        recommendation: "Zkopírujte otevírací dobu z webu do Google profilu.",
        source: "consistency",
        ease: 5,
        impact: 4,
      }),
    );
  }

  // --- Services / ceník (only if listed website URL actually loads) ---
  const listedSiteOk = !ctx.websiteProbe || ctx.websiteProbe.ok;
  if (page && !page.fetchError && listedSiteOk) {
    if (page.hasServicesMention || page.hasPrices) {
      checks.push(
        check({
          checkId: "consistency_services_on_web",
          category: "web",
          status: "pass",
          points: 4,
          maxPoints: 4,
          severity: "none",
          title: "Služby nebo ceník na webu",
          description: page.hasPrices
            ? "Na webu jsou informace o cenách / ceníku."
            : "Na webu jsou zmíněny služby.",
          recommendation: null,
          source: "consistency",
        }),
      );
    } else if (answers.hasWebsite) {
      checks.push(
        check({
          checkId: "consistency_services_on_web",
          category: "web",
          status: "partial",
          points: 1,
          maxPoints: 4,
          severity: "medium",
          title: "Služby a ceník na webu nejsou jasné",
          description:
            "Na webu jsme nenašli zřetelný ceník ani přehled služeb.",
          recommendation:
            "Doplňte alespoň základní služby a orientační ceny — zákazníci je hledají před rezervací.",
          source: "consistency",
          ease: 3,
          impact: 4,
        }),
      );
    }
  }

  // --- Name consistency Google vs website title ---
  if (place?.name && page?.title) {
    const match =
      namesLooselyMatch(place.name, page.title) ||
      page.h1.some((h) => namesLooselyMatch(place.name!, h));
    checks.push(
      check({
        checkId: "consistency_salon_name",
        category: "web",
        status: match ? "pass" : "partial",
        points: match ? 3 : 1,
        maxPoints: 3,
        severity: match ? "none" : "low",
        title: match
          ? "Název salonu je konzistentní"
          : "Název na webu se liší od Google profilu",
        description: match
          ? "Název salonu na Googlu a webu působí jednotně."
          : `Google: „${place.name}“. Title webu: „${page.title}“.`,
        recommendation: match
          ? null
          : "Sjednoťte název značky na webu, Googlu a sociálních sítích.",
        source: "consistency",
        ease: 4,
        impact: 2,
      }),
    );
  }

  // --- Social: Instagram from answers vs website ---
  if (answers.instagramHandle && page && page.instagramLinks.length === 0 && !page.fetchError) {
    checks.push(
      check({
        checkId: "consistency_instagram_on_web",
        category: "social",
        status: "partial",
        points: 1,
        maxPoints: 3,
        severity: "low",
        title: "Instagram není propojený z webu",
        description: `Uvádíte ${answers.instagramHandle}, ale na webu jsme odkaz na Instagram nenašli.`,
        recommendation: "Přidejte na web odkaz na Instagram (patička / sociální ikony).",
        source: "consistency",
        ease: 5,
        impact: 2,
      }),
    );
  }

  // If we couldn't compare anything meaningful, don't invent a fail.
  if (checks.length === 0) {
    checks.push(
      check({
        checkId: "consistency_insufficient_data",
        category: "google",
        status: "unknown",
        points: 0,
        maxPoints: 4,
        severity: "none",
        title: "Konzistence údajů",
        description:
          "Nemáme dostatek ověřených údajů napříč kanály pro porovnání (web / Google).",
        recommendation: null,
        source: "consistency",
      }),
    );
  }

  return checks;
};

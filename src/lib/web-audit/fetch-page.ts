export type PageSignals = {
  url: string;
  finalUrl: string;
  title: string | null;
  metaDescription: string | null;
  h1: string[];
  textSample: string;
  linkCount: number;
  imageCount: number;
  hasViewportMeta: boolean;
  clearBookingCta: boolean | null;
  hasPrices: boolean | null;
  hasGallery: boolean | null;
  hasTeam: boolean | null;
  hasReviews: boolean | null;
  looksOutdated: boolean | null;
  fetchError: string | null;
  phones: string[];
  emails: string[];
  hasOpeningHours: boolean | null;
  openingHoursSnippet: string | null;
  hasAddressMention: boolean | null;
  hasServicesMention: boolean | null;
  instagramLinks: string[];
  facebookLinks: string[];
  /** JSON-LD @type values found on the page. */
  jsonLdTypes: string[];
  hasLocalBusinessSchema: boolean;
  hasFaqSchema: boolean;
  hasOpenGraph: boolean;
  /** Outbound links to Czech directories, keyed by platform id. */
  directoryLinks: Record<string, string[]>;
};

function emptySignals(
  url: string,
  finalUrl: string,
  fetchError: string | null,
): PageSignals {
  return {
    url,
    finalUrl,
    title: null,
    metaDescription: null,
    h1: [],
    textSample: "",
    linkCount: 0,
    imageCount: 0,
    hasViewportMeta: false,
    clearBookingCta: null,
    hasPrices: null,
    hasGallery: null,
    hasTeam: null,
    hasReviews: null,
    looksOutdated: null,
    fetchError,
    phones: [],
    emails: [],
    hasOpeningHours: null,
    openingHoursSnippet: null,
    hasAddressMention: null,
    hasServicesMention: null,
    instagramLinks: [],
    facebookLinks: [],
    jsonLdTypes: [],
    hasLocalBusinessSchema: false,
    hasFaqSchema: false,
    hasOpenGraph: false,
    directoryLinks: {},
  };
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function matchAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function extractPhones(html: string, text: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(/href=["']tel:([^"']+)["']/gi)) {
    const value = decodeEntities(match[1] || "").trim();
    if (value) found.add(value);
  }
  for (const match of text.matchAll(
    /(?:\+420\s*)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{9})/g,
  )) {
    const value = match[0].trim();
    if (value.replace(/\D/g, "").length >= 9) found.add(value);
  }
  return [...found].slice(0, 5);
}

function extractEmails(html: string, text: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(/href=["']mailto:([^"'?]+)/gi)) {
    const value = decodeEntities(match[1] || "").trim().toLowerCase();
    if (value.includes("@")) found.add(value);
  }
  for (const match of text.matchAll(
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  )) {
    found.add(match[0].toLowerCase());
  }
  return [...found].slice(0, 5);
}

function extractSocialLinks(html: string) {
  const instagram = new Set<string>();
  const facebook = new Set<string>();
  for (const match of html.matchAll(
    /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'#?]+)/gi,
  )) {
    instagram.add(match[1]);
  }
  for (const match of html.matchAll(
    /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'#?]+)/gi,
  )) {
    facebook.add(match[1]);
  }
  return {
    instagramLinks: [...instagram].slice(0, 3),
    facebookLinks: [...facebook].slice(0, 3),
  };
}

function extractDirectoryLinks(html: string): Record<string, string[]> {
  const buckets: Record<string, Set<string>> = {
    firmy_cz: new Set(),
    mapy_cz: new Set(),
    kdomestriha: new Set(),
    zlate_stranky: new Set(),
  };
  for (const match of html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)) {
    const href = match[1];
    try {
      const host = new URL(href).hostname.toLowerCase();
      if (host.includes("firmy.cz")) buckets.firmy_cz.add(href);
      else if (host.includes("mapy.cz") || host.includes("mapy.com"))
        buckets.mapy_cz.add(href);
      else if (host.includes("kdomestriha.cz")) buckets.kdomestriha.add(href);
      else if (host.includes("zlatestranky.cz"))
        buckets.zlate_stranky.add(href);
    } catch {
      /* ignore bad URLs */
    }
  }
  const out: Record<string, string[]> = {};
  for (const [key, set] of Object.entries(buckets)) {
    if (set.size) out[key] = [...set].slice(0, 3);
  }
  return out;
}

function extractJsonLd(html: string): {
  types: string[];
  hasLocalBusiness: boolean;
  hasFaq: boolean;
} {
  const types = new Set<string>();
  let hasLocalBusiness = false;
  let hasFaq = false;
  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (stack.length) {
        const node = stack.pop() as Record<string, unknown> | undefined;
        if (!node || typeof node !== "object") continue;
        const t = node["@type"];
        const typeList = Array.isArray(t) ? t : t ? [t] : [];
        for (const item of typeList) {
          if (typeof item !== "string") continue;
          types.add(item);
          if (
            /LocalBusiness|HairSalon|BeautySalon|HealthAndBeautyBusiness|Organization|Store/i.test(
              item,
            )
          ) {
            hasLocalBusiness = true;
          }
          if (/FAQPage/i.test(item)) hasFaq = true;
        }
        if (node["@graph"] && Array.isArray(node["@graph"])) {
          stack.push(...(node["@graph"] as unknown[]));
        }
      }
    } catch {
      // Some sites embed invalid JSON-LD — still detect by string
      if (/LocalBusiness|HairSalon|BeautySalon/i.test(raw)) {
        hasLocalBusiness = true;
      }
      if (/FAQPage/i.test(raw)) hasFaq = true;
    }
  }
  return { types: [...types].slice(0, 12), hasLocalBusiness, hasFaq };
}

export async function probeLlmsTxt(pageUrl: string): Promise<boolean | null> {
  try {
    const origin = new URL(pageUrl).origin;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    const response = await fetch(`${origin}/llms.txt`, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "HairwebWebAudit/1.0 (+https://www.hairweb.cz)",
        Accept: "text/plain,*/*",
      },
    });
    clearTimeout(timeout);
    if (!response.ok) return false;
    const text = await response.text();
    return text.trim().length >= 40;
  } catch {
    return null;
  }
}

function extractOpeningHoursSnippet(text: string): string | null {
  const patterns = [
    /otev[ií]rac[ií]\s+dob[ay][:\s]([^.!?]{8,120})/i,
    /opening\s+hours[:\s]([^.!?]{8,120})/i,
    /(?:po|út|st|čt|pá|so|ne|ponděl[ií]|úter[yý]|středa|čtvrtek|pátek|sobota|neděle)[^.!?]{0,40}\d{1,2}[:.]\d{2}/i,
    /(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)[^.!?]{0,40}\d{1,2}[:.]\d{2}/i,
    /(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?)\s*[-–—to]+\s*(?:fri(?:day)?|sun(?:day)?|sat(?:urday)?)[^.!?]{0,40}\d{1,2}[:.]\d{2}/i,
    /(?:po|út|st|čt|pá)\s*[-–—]\s*(?:pá|ne|so)[^.!?]{0,40}\d{1,2}[:.]\d{2}/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return (match[0] || "").trim().slice(0, 160);
  }
  return null;
}

function hasJsonLdOpeningHours(html: string): boolean {
  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (stack.length) {
        const node = stack.pop() as Record<string, unknown> | undefined;
        if (!node || typeof node !== "object") continue;
        const hours = node.openingHours ?? node.openingHoursSpecification;
        if (typeof hours === "string" && hours.trim().length >= 4) return true;
        if (Array.isArray(hours) && hours.length > 0) return true;
        if (hours && typeof hours === "object") return true;
        if (node["@graph"] && Array.isArray(node["@graph"])) {
          stack.push(...(node["@graph"] as unknown[]));
        }
      }
    } catch {
      /* ignore bad JSON-LD */
    }
  }
  return false;
}

function hasJsonLdAddress(html: string): boolean {
  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const stack: unknown[] = [parsed];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        if (Array.isArray(node)) {
          stack.push(...node);
          continue;
        }
        const record = node as Record<string, unknown>;
        const address = record.address;
        if (typeof address === "string" && address.trim().length >= 5) {
          return true;
        }
        if (address && typeof address === "object" && !Array.isArray(address)) {
          const addr = address as Record<string, unknown>;
          const parts = [
            addr.streetAddress,
            addr.addressLocality,
            addr.addressRegion,
            addr.postalCode,
          ]
            .filter((v) => typeof v === "string" && v.trim().length > 0)
            .join(" ");
          if (parts.trim().length >= 5) return true;
        }
        for (const key of ["streetAddress", "addressLocality", "postalCode"] as const) {
          const value = record[key];
          if (typeof value === "string" && value.trim().length >= 3) {
            return true;
          }
        }
        if (record["@graph"] && Array.isArray(record["@graph"])) {
          stack.push(...(record["@graph"] as unknown[]));
        }
      }
    } catch {
      if (
        /"streetAddress"\s*:\s*"[^"]{3,}"/i.test(raw) ||
        /"addressLocality"\s*:\s*"[^"]{2,}"/i.test(raw) ||
        /"postalCode"\s*:\s*"\d{3}\s?\d{2}"/i.test(raw) ||
        /"address"\s*:\s*"[^"]{5,}"/i.test(raw)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect visible / structured salon address mention.
 * Covers Czech + English forms (e.g. "Korunovacni 18, Letna, Prague 7").
 */
export function detectAddressMention(text: string, html = ""): boolean {
  if (hasJsonLdAddress(html)) return true;

  return matchAny(text, [
    /\bulice\b/i,
    /\bul\.\s*[A-ZÁ-Ž]/u,
    /\bnám(?:ěstí|\.)\b/i,
    /\btřída\b|\btrida\b/i,
    /\bps[čc]\b/i,
    /\b\d{3}\s?\d{2}\b/,
    /\bpraha(?:\s*\d{1,2})?\b/i,
    /\bprague(?:\s*\d{1,2})?\b/i,
    /\bbrno\b|\bostrava\b|\bplze[nň]\b|\bpilsen\b/i,
    /\bolomouc\b|\bliberec\b|\bhradec\b|\bceske\s+budejovice\b|\bčeské\s+budějovice\b/i,
    // Street name + house number, e.g. "Korunovacni 18" / "Korunovační 18a"
    /\b[A-ZÁ-Ž][A-Za-zÁ-Žá-ž-]{2,}\s+\d{1,4}[a-zA-Z]?\b/u,
    /\bstreet\b|\bavenue\b|\baddress\b/i,
  ]);
}

/** Exported for unit tests — detects visible / structured opening hours. */
export function detectOpeningHours(
  text: string,
  html = "",
): { hasOpeningHours: boolean; snippet: string | null } {
  const snippet = extractOpeningHoursSnippet(text);
  const hasOpeningHours =
    Boolean(snippet) ||
    matchAny(text, [
      /\botev[ií]rac[ií]\s+dob/i,
      /\botevřeno\b/i,
      /\bopening\s+hours\b/i,
      /\bbusiness\s+hours\b/i,
      /po[–-]pá|po[–-]ne|ponděl[ií].{0,20}pátek/i,
      /\bmon(?:day)?\s*[-–—to]+\s*fri(?:day)?\b/i,
      /\bmon(?:day)?\s*[-–—to]+\s*sun(?:day)?\b/i,
    ]) ||
    hasJsonLdOpeningHours(html);
  return { hasOpeningHours, snippet };
}


export async function fetchPageSignals(url: string): Promise<PageSignals> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "HairwebWebAudit/1.0 (+https://www.hairweb.cz)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    const html = await response.text();
    if (!response.ok) {
      return emptySignals(url, response.url || url, `HTTP ${response.status}`);
    }
    if (html.trim().length < 80) {
      return emptySignals(
        url,
        response.url || url,
        "Server vrátil prázdnou odpověď",
      );
    }
    const lower = html.toLowerCase();
    const text = stripTags(html).slice(0, 8000);

    const title =
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
    const metaDescription =
      html
        .match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
        )?.[1]
        ?.trim() ||
      html
        .match(
          /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
        )?.[1]
        ?.trim() ||
      null;

    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => stripTags(match[1] || ""))
      .filter(Boolean)
      .slice(0, 5);

    const linkCount = (html.match(/<a\b/gi) || []).length;
    const imageCount = (html.match(/<img\b/gi) || []).length;
    const hasViewportMeta = /name=["']viewport["']/i.test(html);

    const clearBookingCta = matchAny(text + " " + lower, [
      /\brezerv/i,
      /\bbook\s*now/i,
      /\bonline\s*booking/i,
      /\bobjednat\b/i,
      /reservio|fresha|bookio|noona|simplybook/i,
    ]);

    const hasPrices = matchAny(text, [
      /\bcen[ií]k\b/i,
      /\bcena\b/i,
      /\bkč\b/i,
      /\bprice\s*list\b/i,
    ]);

    const hasGallery = matchAny(text + " " + lower, [
      /\bgaler/i,
      /\bportfolio\b/i,
      /\bour\s*work\b/i,
      /instagram\.com/i,
    ]);

    const hasTeam = matchAny(text, [
      /\bt[ýy]m\b/i,
      /\bo\s+n[áa]s\b/i,
      /\bstylist/i,
      /\bteam\b/i,
    ]);

    const hasReviews = matchAny(text, [
      /\brecenze\b/i,
      /\breference\b/i,
      /\breviews?\b/i,
      /\bgoogle\b.*\bhv[ěe]zd/i,
    ]);

    const looksOutdated =
      matchAny(lower, [
        /jquery\/1\./i,
        /bootstrap\/3/i,
        /ua-compatible/i,
        /tables?\s+border=/i,
      ]) ||
      (!hasViewportMeta && imageCount < 2);

    const phones = extractPhones(html, text);
    const emails = extractEmails(html, text);
    const social = extractSocialLinks(html);
    const { hasOpeningHours, snippet: openingHoursSnippet } =
      detectOpeningHours(text, html);
    const hasAddressMention = detectAddressMention(text, html);
    const hasServicesMention =
      hasPrices ||
      matchAny(text, [
        /\bslu[zž]b/i,
        /\bstřih\b/i,
        /\bbarven/i,
        /\bbalayage\b/i,
        /\bkadeř/i,
      ]);

    const jsonLd = extractJsonLd(html);
    const hasOpenGraph =
      /property=["']og:(title|description|image)["']/i.test(html) ||
      /name=["']twitter:card["']/i.test(html);
    const directoryLinks = extractDirectoryLinks(html);

    return {
      url,
      finalUrl: response.url || url,
      title: title ? decodeEntities(title).slice(0, 200) : null,
      metaDescription: metaDescription
        ? decodeEntities(metaDescription).slice(0, 300)
        : null,
      h1,
      textSample: text,
      linkCount,
      imageCount,
      hasViewportMeta,
      clearBookingCta,
      hasPrices,
      hasGallery,
      hasTeam,
      hasReviews,
      looksOutdated,
      fetchError: null,
      phones,
      emails,
      hasOpeningHours,
      openingHoursSnippet,
      hasAddressMention,
      hasServicesMention,
      instagramLinks: social.instagramLinks,
      facebookLinks: social.facebookLinks,
      jsonLdTypes: jsonLd.types,
      hasLocalBusinessSchema: jsonLd.hasLocalBusiness,
      hasFaqSchema: jsonLd.hasFaq,
      hasOpenGraph,
      directoryLinks,
    };
  } catch (error) {
    return emptySignals(
      url,
      url,
      error instanceof Error ? error.message : "Fetch stránky selhal",
    );
  }
}

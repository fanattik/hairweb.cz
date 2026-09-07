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
};

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
    const lower = html.toLowerCase();
    const text = stripTags(html).slice(0, 6000);

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
      /reservio|fresha|bookio|simplybook/i,
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
      fetchError: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
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
      fetchError:
        error instanceof Error ? error.message : "Fetch stránky selhal",
    };
  }
}

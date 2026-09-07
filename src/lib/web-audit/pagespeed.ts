export type LighthouseSnapshot = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  source: "pagespeed";
  error: string | null;
};

function categoryScore(
  categories: Record<string, { score?: number | null } | undefined>,
  key: string,
) {
  const score = categories[key]?.score;
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return Math.round(score * 100);
}

function numericAudit(
  audits: Record<string, { numericValue?: number } | undefined>,
  key: string,
) {
  const value = audits[key]?.numericValue;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapPerformanceToScore(performance: number | null): number {
  if (performance == null) return 0;
  return Math.max(0, Math.min(10, Math.round(performance / 10)));
}

export function mapSeoToScore(seo: number | null): number {
  if (seo == null) return 0;
  return Math.max(0, Math.min(15, Math.round((seo / 100) * 15)));
}

export function mapMobileFromLighthouse(input: {
  performance: number | null;
  accessibility: number | null;
  lcpMs: number | null;
}): number {
  const perf = input.performance ?? 0;
  const a11y = input.accessibility ?? perf;
  const base = Math.round((((perf + a11y) / 2) / 100) * 15);
  const lcpPenalty =
    input.lcpMs != null && input.lcpMs > 4000
      ? 3
      : input.lcpMs != null && input.lcpMs > 2500
        ? 1
        : 0;
  return Math.max(0, Math.min(15, base - lcpPenalty));
}

export function detectMobileProblem(input: {
  performance: number | null;
  lcpMs: number | null;
}): boolean {
  if (input.performance != null && input.performance < 50) return true;
  if (input.lcpMs != null && input.lcpMs > 4000) return true;
  return false;
}

export async function fetchPageSpeedMobile(
  url: string,
): Promise<LighthouseSnapshot> {
  const apiKey =
    process.env.GOOGLE_PSI_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    "";

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.append("category", "seo");
  endpoint.searchParams.append("category", "accessibility");
  endpoint.searchParams.append("category", "best-practices");
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const json = (await response.json()) as {
      error?: { message?: string };
      lighthouseResult?: {
        categories?: Record<string, { score?: number | null }>;
        audits?: Record<string, { numericValue?: number }>;
      };
    };

    if (!response.ok || json.error) {
      return {
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        lcpMs: null,
        cls: null,
        tbtMs: null,
        source: "pagespeed",
        error:
          json.error?.message ||
          `PageSpeed API error (${response.status}). Přidej GOOGLE_PSI_API_KEY a povol PageSpeed Insights API.`,
      };
    }

    const categories = json.lighthouseResult?.categories || {};
    const audits = json.lighthouseResult?.audits || {};

    return {
      performance: categoryScore(categories, "performance"),
      seo: categoryScore(categories, "seo"),
      accessibility: categoryScore(categories, "accessibility"),
      bestPractices: categoryScore(categories, "best-practices"),
      lcpMs: numericAudit(audits, "largest-contentful-paint"),
      cls: numericAudit(audits, "cumulative-layout-shift"),
      tbtMs: numericAudit(audits, "total-blocking-time"),
      source: "pagespeed",
      error: null,
    };
  } catch (error) {
    return {
      performance: null,
      seo: null,
      accessibility: null,
      bestPractices: null,
      lcpMs: null,
      cls: null,
      tbtMs: null,
      source: "pagespeed",
      error: error instanceof Error ? error.message : "PageSpeed fetch failed",
    };
  }
}

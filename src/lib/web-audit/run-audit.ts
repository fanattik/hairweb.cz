import { runAiWebAudit, isAiAuditConfigured } from "@/lib/web-audit/ai-audit";
import { fetchPageSignals } from "@/lib/web-audit/fetch-page";
import { normalizeAuditUrl } from "@/lib/web-audit/normalize-url";
import {
  detectMobileProblem,
  fetchPageSpeedMobile,
  mapMobileFromLighthouse,
  mapPerformanceToScore,
  mapSeoToScore,
  type LighthouseSnapshot,
} from "@/lib/web-audit/pagespeed";
import type { MergedWebAuditScores } from "@/lib/web-audit/apply";

export type WebAuditResult = {
  url: string;
  finalUrl: string;
  lighthouse: LighthouseSnapshot;
  aiSource: "ai" | "heuristic";
  aiConfigured: boolean;
  scores: MergedWebAuditScores;
  warnings: string[];
};

/**
 * Run PageSpeed + HTML heuristics + AI (or heuristic fallback) for a website URL.
 */
export async function runWebAudit(rawUrl: string): Promise<WebAuditResult> {
  const url = normalizeAuditUrl(rawUrl);
  if (!url) {
    throw new Error(
      "Neplatná URL webu. Zadej salonový web (ne Instagram handle).",
    );
  }

  const warnings: string[] = [];

  const [signals, lighthouse] = await Promise.all([
    fetchPageSignals(url),
    fetchPageSpeedMobile(url),
  ]);

  if (signals.fetchError) {
    warnings.push(`HTML fetch: ${signals.fetchError}`);
  }
  if (lighthouse.error) {
    warnings.push(`PageSpeed: ${lighthouse.error}`);
  }

  const { result: ai, source: aiSource } = await runAiWebAudit({
    signals,
    lighthouse,
  });

  const performanceScore = mapPerformanceToScore(lighthouse.performance);
  const seoFromLh = mapSeoToScore(lighthouse.seo);
  const mobileFromLh = mapMobileFromLighthouse({
    performance: lighthouse.performance,
    accessibility: lighthouse.accessibility,
    lcpMs: lighthouse.lcpMs,
  });

  // Prefer Lighthouse for performance / SEO / mobile when available.
  const website_performance_score = performanceScore;
  const website_seo_score =
    lighthouse.seo != null
      ? Math.round((seoFromLh + ai.website_seo_score) / 2)
      : ai.website_seo_score;
  const website_mobile_score =
    lighthouse.performance != null
      ? Math.round((mobileFromLh + ai.website_mobile_score) / 2)
      : ai.website_mobile_score;

  const website_mobile_problem =
    detectMobileProblem({
      performance: lighthouse.performance,
      lcpMs: lighthouse.lcpMs,
    }) || ai.website_mobile_problem;

  const scores: MergedWebAuditScores = {
    ...ai,
    website_performance_score,
    website_seo_score: Math.max(0, Math.min(15, website_seo_score)),
    website_mobile_score: Math.max(0, Math.min(15, website_mobile_score)),
    website_mobile_problem,
  };

  if (aiSource === "heuristic") {
    warnings.push(
      isAiAuditConfigured()
        ? "AI audit spadl na heuristiky — zkontroluj AI Gateway."
        : "AI Gateway není nastavená — použity heuristiky. Přidej AI_GATEWAY_API_KEY (nebo nasaď na Vercel s OIDC).",
    );
  }

  return {
    url,
    finalUrl: signals.finalUrl || url,
    lighthouse,
    aiSource,
    aiConfigured: isAiAuditConfigured(),
    scores,
    warnings,
  };
}

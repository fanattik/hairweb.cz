import { analyzeAiDiscoverability } from "@/lib/audit/analyzers/ai-discoverability";
import { analyzeGoogle, analyzeReviews } from "@/lib/audit/analyzers/google";
import {
  analyzeBooking,
  analyzeCustomers,
  analyzeMarketing,
  analyzeSocial,
} from "@/lib/audit/analyzers/booking-social-customers-marketing";
import { analyzeConsistency } from "@/lib/audit/analyzers/consistency";
import { analyzeDirectories } from "@/lib/audit/analyzers/directories";
import { analyzePagespeed } from "@/lib/audit/analyzers/pagespeed";
import { analyzeWebsite } from "@/lib/audit/analyzers/website";
import type { AnalyzerContext } from "@/lib/audit/analyzers/types";
import { probeKeyDirectories } from "@/lib/audit/directories/probe";
import {
  buildDeterministicSummary,
  computeScores,
  extractQuickWins,
  extractRecommendations,
  extractStrengths,
  relevantServicesFromRecommendations,
} from "@/lib/audit/scoring";
import type { AuditAnswers, AuditResult } from "@/lib/audit/types";
import { probeWebsite, type WebsiteProbeResult } from "@/lib/audit/website-probe";
import {
  resolveGooglePlace,
  type GooglePlaceSnapshot,
} from "@/lib/google-places/client";
import { fetchPageSignals, probeLlmsTxt } from "@/lib/web-audit/fetch-page";
import { normalizeAuditUrl } from "@/lib/web-audit/normalize-url";
import {
  fetchPageSpeedMobile,
  type LighthouseSnapshot,
} from "@/lib/web-audit/pagespeed";

function hasPlacesApiKey() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

/** Use data already captured in the wizard when live Places resolve fails. */
function placeFromAnswers(
  answers: AuditAnswers,
): GooglePlaceSnapshot | null {
  const hasSignal =
    Boolean(answers.googlePlaceId) ||
    answers.googleRating != null ||
    answers.googleReviewsCount != null ||
    Boolean(answers.googleMapsUrl);

  if (!hasSignal) return null;

  return {
    placeId: answers.googlePlaceId || "",
    name: answers.salonName || null,
    rating: answers.googleRating ?? null,
    reviewsCount: answers.googleReviewsCount ?? null,
    mapsUrl: answers.googleMapsUrl || null,
    formattedAddress: answers.address || null,
    city: answers.city || null,
    region: null,
    phone: null,
    website: answers.suggestedWebsite || answers.websiteUrl || null,
    latitude: null,
    longitude: null,
    businessStatus: null,
    primaryType: null,
    primaryTypeDisplayName: null,
    types: [],
    openingHours: null,
  };
}

async function tryResolvePlace(
  answers: AuditAnswers,
): Promise<GooglePlaceSnapshot | null> {
  if (!hasPlacesApiKey()) {
    console.warn(
      "[audit] GOOGLE_PLACES_API_KEY chybí — Google/recenze se neověří automaticky.",
    );
    return placeFromAnswers(answers);
  }

  try {
    const { place } = await resolveGooglePlace({
      placeId: answers.googlePlaceId,
      mapsUrl: answers.googleMapsUrl,
      salonName: answers.salonName,
      city: answers.city,
      query: [answers.salonName, answers.city, "kadeřnictví"]
        .filter(Boolean)
        .join(" "),
    });
    return place;
  } catch (error) {
    console.warn("[audit] Places resolve failed, using answer fallback", error);
    return placeFromAnswers(answers);
  }
}

async function tryFetchWebsite(url: string | null | undefined) {
  if (!url) return null;
  try {
    const normalized = normalizeAuditUrl(url);
    if (!normalized) return null;
    return await fetchPageSignals(normalized);
  } catch (error) {
    console.warn("[audit] Website fetch skipped", error);
    return null;
  }
}

async function tryPageSpeed(
  url: string | null | undefined,
): Promise<LighthouseSnapshot | null> {
  if (!url) return null;
  try {
    const normalized = normalizeAuditUrl(url);
    if (!normalized) return null;
    const snapshot = await fetchPageSpeedMobile(normalized);
    if (snapshot.error) {
      console.warn("[audit] PageSpeed:", snapshot.error);
    }
    return snapshot;
  } catch (error) {
    console.warn("[audit] PageSpeed skipped", error);
    return null;
  }
}

/**
 * Runs modular analyzers and builds a deterministic AuditResult.
 * Never invents values for checks marked unknown / future_api.
 */
export async function runSalonAudit(
  answers: AuditAnswers,
): Promise<AuditResult> {
  const place = await tryResolvePlace(answers);

  const enriched: AuditAnswers = {
    ...answers,
    directoryPlatforms: answers.directoryPlatforms || [],
  };
  if (place?.website && !enriched.websiteUrl && enriched.hasWebsite !== false) {
    enriched.suggestedWebsite = place.website;
    if (enriched.hasWebsite == null) {
      enriched.hasWebsite = true;
      enriched.websiteUrl = place.website;
    } else if (enriched.hasWebsite && !enriched.websiteUrl) {
      enriched.websiteUrl = place.website;
    }
  }
  if (place?.website && !enriched.websiteUrl && enriched.hasWebsite === false) {
    enriched.suggestedWebsite = place.website;
  }
  if (place) {
    enriched.googlePlaceId = place.placeId;
    enriched.googleMapsUrl = place.mapsUrl || enriched.googleMapsUrl;
    enriched.googleRating = place.rating;
    enriched.googleReviewsCount = place.reviewsCount;
  }

  const listedWebsite =
    enriched.websiteUrl || place?.website || enriched.suggestedWebsite || null;

  let websiteProbe: WebsiteProbeResult | null = null;
  if (listedWebsite) {
    websiteProbe = await probeWebsite(listedWebsite);
  }

  // Content only from listed URL when it works.
  const fetchUrl =
    websiteProbe?.ok
      ? websiteProbe.normalizedUrl || listedWebsite
      : websiteProbe
        ? null
        : listedWebsite;

  // PageSpeed: listed URL first; if broken, still measure suggested ASCII for the UI.
  const psiUrl = fetchUrl || websiteProbe?.suggestedUrl || null;

  const [page, lighthouseForUi, directoryProbes, llmsTxt] = await Promise.all([
    fetchUrl ? tryFetchWebsite(fetchUrl) : Promise.resolve(null),
    psiUrl ? tryPageSpeed(psiUrl) : Promise.resolve(null),
    enriched.salonName.trim()
      ? probeKeyDirectories(enriched.salonName, enriched.city)
      : Promise.resolve(null),
    fetchUrl ? probeLlmsTxt(fetchUrl) : Promise.resolve(null),
  ]);

  const ctx: AnalyzerContext = {
    answers: enriched,
    place,
    page,
    websiteProbe,
    // Don't score PSI from a fallback host — only when listed URL itself works.
    lighthouse: websiteProbe?.ok ? lighthouseForUi : null,
    directoryProbes,
    llmsTxt,
  };

  const checkGroups = await Promise.all([
    analyzeWebsite(ctx),
    analyzePagespeed(ctx),
    analyzeAiDiscoverability(ctx),
    analyzeDirectories(ctx),
    analyzeGoogle(ctx),
    analyzeReviews(ctx),
    analyzeBooking(ctx),
    analyzeSocial(ctx),
    analyzeCustomers(ctx),
    analyzeMarketing(ctx),
    analyzeConsistency(ctx),
  ]);

  const checks = checkGroups.flat();
  const scores = computeScores(checks);

  const hasWebsiteSignal = Boolean(
    enriched.hasWebsite || listedWebsite || websiteProbe,
  );
  if (hasWebsiteSignal) {
    const usedFallbackUrl = Boolean(
      !fetchUrl && psiUrl && websiteProbe?.suggestedUrl === psiUrl,
    );
    if (lighthouseForUi) {
      scores.pagespeed = {
        performance: lighthouseForUi.performance,
        seo: lighthouseForUi.seo,
        accessibility: lighthouseForUi.accessibility,
        bestPractices: lighthouseForUi.bestPractices,
        lcpMs: lighthouseForUi.lcpMs,
        cls: lighthouseForUi.cls,
        tbtMs: lighthouseForUi.tbtMs,
        error: lighthouseForUi.error,
        strategy: "mobile",
        measuredUrl: psiUrl,
        usedFallbackUrl,
      };
    } else {
      scores.pagespeed = {
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        lcpMs: null,
        cls: null,
        tbtMs: null,
        error:
          websiteProbe && !websiteProbe.ok
            ? `Webová adresa nejde otevřít (${websiteProbe.error || "nedostupné"}) — rychlost webu nelze změřit, dokud odkaz na profilu nefunguje.`
            : "Rychlost webu se nepodařilo změřit.",
        strategy: "mobile",
        measuredUrl: psiUrl,
        usedFallbackUrl,
      };
    }
  } else {
    scores.pagespeed = null;
  }
  const strengths = extractStrengths(checks);
  const recommendations = extractRecommendations(checks);
  const quickWins = extractQuickWins(recommendations);
  const relevantServices =
    relevantServicesFromRecommendations(recommendations);
  const summary = buildDeterministicSummary(
    scores,
    strengths,
    recommendations,
  );

  return {
    overallScore: scores.overall,
    scores,
    checks,
    strengths,
    recommendations,
    quickWins,
    summary,
    relevantServices,
  };
}

/** Placeholder for future AI prose — must not change numeric scores. */
export async function maybeAiSummary(
  result: AuditResult,
): Promise<string> {
  return result.summary;
}

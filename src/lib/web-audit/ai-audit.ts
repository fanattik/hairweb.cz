import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { PageSignals } from "@/lib/web-audit/fetch-page";
import type { LighthouseSnapshot } from "@/lib/web-audit/pagespeed";
import { WEB_SCORE_MAX } from "@/lib/leads/types";

export const webAiAuditSchema = z.object({
  website_design_score: z.number().int().min(0).max(WEB_SCORE_MAX.design),
  website_mobile_score: z.number().int().min(0).max(WEB_SCORE_MAX.mobile),
  website_cta_score: z.number().int().min(0).max(WEB_SCORE_MAX.cta),
  website_content_score: z.number().int().min(0).max(WEB_SCORE_MAX.content),
  website_trust_score: z.number().int().min(0).max(WEB_SCORE_MAX.trust),
  website_seo_score: z.number().int().min(0).max(WEB_SCORE_MAX.seo),
  website_outdated: z.boolean(),
  website_mobile_problem: z.boolean(),
  website_clear_booking_cta: z.boolean(),
  website_has_prices: z.boolean(),
  website_has_gallery: z.boolean(),
  website_has_team: z.boolean(),
  website_has_reviews: z.boolean(),
  website_audit: z.string().min(40).max(1200),
  opportunity_note: z.string().min(20).max(800),
});

export type WebAiAuditResult = z.infer<typeof webAiAuditSchema>;

function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function hasAiGateway() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim() ||
      process.env.VERCEL === "1" ||
      process.env.VERCEL_ENV,
  );
}

/** Prefer direct OpenAI; Gateway only as optional fallback. */
export function isAiAuditConfigured() {
  return hasOpenAiKey() || hasAiGateway();
}

function resolveAuditModel() {
  if (hasOpenAiKey()) {
    // Direct OpenAI API — bypasses Vercel AI Gateway billing/card gate.
    return openai(process.env.OPENAI_WEB_AUDIT_MODEL?.trim() || "gpt-5.4");
  }
  return process.env.AI_GATEWAY_WEB_AUDIT_MODEL?.trim() || "openai/gpt-5.4";
}

function heuristicAiAudit(
  signals: PageSignals,
  lighthouse: LighthouseSnapshot,
): WebAiAuditResult {
  const design = Math.max(
    2,
    Math.min(
      20,
      Math.round(
        (signals.imageCount > 6 ? 10 : 5) +
          (signals.h1.length ? 3 : 0) +
          (signals.metaDescription ? 2 : 0) +
          (signals.looksOutdated ? -4 : 4),
      ),
    ),
  );

  const cta = signals.clearBookingCta ? 11 : 3;
  const content = Math.min(
    15,
    (signals.hasPrices ? 5 : 2) +
      (signals.hasGallery ? 4 : 1) +
      (signals.textSample.length > 800 ? 4 : 2),
  );
  const trust = Math.min(
    10,
    (signals.hasReviews ? 4 : 1) +
      (signals.hasTeam ? 3 : 1) +
      (signals.metaDescription ? 2 : 0),
  );

  return {
    website_design_score: design,
    website_mobile_score: signals.hasViewportMeta ? 9 : 4,
    website_cta_score: cta,
    website_content_score: content,
    website_trust_score: trust,
    website_seo_score: signals.metaDescription && signals.title ? 9 : 4,
    website_outdated: Boolean(signals.looksOutdated),
    website_mobile_problem:
      !signals.hasViewportMeta ||
      (lighthouse.performance != null && lighthouse.performance < 50),
    website_clear_booking_cta: Boolean(signals.clearBookingCta),
    website_has_prices: Boolean(signals.hasPrices),
    website_has_gallery: Boolean(signals.hasGallery),
    website_has_team: Boolean(signals.hasTeam),
    website_has_reviews: Boolean(signals.hasReviews),
    website_audit:
      "Heuristický audit (bez AI). " +
      `Stránka má ${signals.imageCount} obrázků a ${signals.linkCount} odkazů. ` +
      (signals.clearBookingCta
        ? "Rezervační CTA vypadá přítomné. "
        : "Rezervační CTA není zjevné. ") +
      (signals.looksOutdated
        ? "Web působí technicky zastarale."
        : "Technické signály zastaralosti jsou slabé."),
    opportunity_note: [
      !signals.clearBookingCta
        ? "Chybí jasná online rezervace — silný argument pro nový web."
        : null,
      signals.looksOutdated
        ? "Web vypadá zastarale — nabídnout moderní redesign."
        : null,
      !signals.hasGallery
        ? "Slabé portfolio/galerie — ukázat hodnotu vizuálů."
        : null,
      lighthouse.performance != null && lighthouse.performance < 50
        ? `Slabý mobile performance (${lighthouse.performance}) — zmínit rychlost webu.`
        : null,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 800) ||
      "Web má základní signály; ověř manuálně a nabídni konkrétní upgrade.",
  };
}

function buildAuditPrompt(input: {
  signals: PageSignals;
  lighthouse: LighthouseSnapshot;
}) {
  return `Jsi senior web auditor pro kadeřnické a barbershop weby v ČR (Hairweb.cz).
Ohodnoť web podle daných limitů skóre a vrať strukturovaný JSON.
Piš website_audit a opportunity_note česky, konkrétně, bez omáčky.

Limity skóre:
- design 0-20
- mobile 0-15
- cta/rezervace 0-15
- content 0-15
- trust 0-10
- seo 0-15

Lighthouse (mobile):
${JSON.stringify(input.lighthouse, null, 2)}

Page signals:
${JSON.stringify(
  {
    url: input.signals.finalUrl,
    title: input.signals.title,
    metaDescription: input.signals.metaDescription,
    h1: input.signals.h1,
    linkCount: input.signals.linkCount,
    imageCount: input.signals.imageCount,
    hasViewportMeta: input.signals.hasViewportMeta,
    heuristics: {
      clearBookingCta: input.signals.clearBookingCta,
      hasPrices: input.signals.hasPrices,
      hasGallery: input.signals.hasGallery,
      hasTeam: input.signals.hasTeam,
      hasReviews: input.signals.hasReviews,
      looksOutdated: input.signals.looksOutdated,
      fetchError: input.signals.fetchError,
    },
    textSample: input.signals.textSample.slice(0, 3500),
  },
  null,
  2,
)}`;
}

export async function runAiWebAudit(input: {
  signals: PageSignals;
  lighthouse: LighthouseSnapshot;
}): Promise<{
  result: WebAiAuditResult;
  source: "ai" | "heuristic";
  error?: string;
}> {
  if (!isAiAuditConfigured()) {
    return {
      result: heuristicAiAudit(input.signals, input.lighthouse),
      source: "heuristic",
      error:
        "Chybí OPENAI_API_KEY. Přidej ho do .env.local / Vercel env (Direct OpenAI).",
    };
  }

  try {
    const { output } = await generateText({
      model: resolveAuditModel(),
      output: Output.object({ schema: webAiAuditSchema }),
      prompt: buildAuditPrompt(input),
    });

    if (!output) {
      return {
        result: heuristicAiAudit(input.signals, input.lighthouse),
        source: "heuristic",
        error: "AI vrátila prázdný structured output.",
      };
    }

    return { result: output, source: "ai" };
  } catch (error) {
    console.error("[web-audit] ai failed", error);
    return {
      result: heuristicAiAudit(input.signals, input.lighthouse),
      source: "heuristic",
      error: explainAiError(error),
    };
  }
}

function explainAiError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Neznámá AI chyba";

  if (/credit card|customer_verification_required/i.test(message)) {
    return (
      "Vercel AI Gateway vyžaduje kartu. Přidej OPENAI_API_KEY " +
      "(platform.openai.com) do Vercel env — audit pak jde přímo přes OpenAI."
    );
  }
  if (/incorrect api key|invalid_api_key|401/i.test(message)) {
    return "OPENAI_API_KEY je neplatný. Zkontroluj klíč v Vercel env / .env.local.";
  }
  if (/insufficient_quota|billing|429/i.test(message)) {
    return "OpenAI účet nemá kredit / rate limit. Doplň billing na platform.openai.com.";
  }
  if (/quota_for_entity_exceeded|402/i.test(message)) {
    return "AI Gateway kredit / budget je vyčerpaný. Použij OPENAI_API_KEY nebo doplň kredity.";
  }
  return message.slice(0, 400);
}

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Lead } from "@/lib/leads/types";
import {
  HAIRWEB_PACKAGES,
  buildOutreachDraft,
  contentStrengths,
  customerProblems,
  inferWebsiteShape,
  suggestHairwebPackage,
  suggestOutreachTemplate,
  type HairwebPackageId,
  type OutreachDraft,
  type OutreachTemplateKey,
} from "@/lib/leads/outreach-templates";

function hasOpenAi() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function model() {
  return openai(process.env.OPENAI_OUTREACH_MODEL?.trim() || "gpt-5.4");
}

/**
 * AI-personalized outreach draft. Falls back to template if OpenAI missing.
 */
export async function generatePersonalizedOutreach(
  lead: Lead,
  options?: {
    templateKey?: OutreachTemplateKey;
    packageId?: HairwebPackageId;
  },
): Promise<OutreachDraft & { source: "ai" | "template" }> {
  const fallbackKey = options?.templateKey || suggestOutreachTemplate(lead);
  const packageId =
    options?.packageId || suggestHairwebPackage(lead, fallbackKey);
  const fallback = buildOutreachDraft(lead, fallbackKey, packageId);
  const pkg = HAIRWEB_PACKAGES[packageId];
  const shape = inferWebsiteShape(lead);
  const problems = customerProblems(lead);
  const strengths = contentStrengths(lead);

  if (!hasOpenAi()) {
    return { ...fallback, source: "template" };
  }

  const salon = lead.salon_name || lead.name;

  const prompt = [
    "Napiš personalizovaný cold e-mail v češtině majiteli kadeřnictví / beauty salonu.",
    "Odesílatel: Lukáš Ptáčník, HAIRWEB.cz (weby pro salony).",
    "",
    "HLAVNÍ PRAVIDLO: Mail musí sedět na KONKRÉTNÍ situaci tohoto salonu.",
    "- Piš o jejich problému (viz seznam níže), ne o obecném „moderním webu“.",
    "- Zmiň jen fakta z dat. Nic si nevymýšlej (žádné falešné detaily webu).",
    "- Balíček musí sedět na typ webu:",
    "  • mají / potřebují jednostránku → START (necpát vícestránkový PRO)",
    "  • potřebují strukturu / lokální SEO / vícestránku → PRO",
    `- Vybraný balíček pro tento mail: ${pkg.name} (${pkg.summary}, ${pkg.price}). Drž se ho.`,
    "",
    "STRUKTURA:",
    "1) Oslovení: „Dobrý den,“ nebo „Dobrý den [jméno],“",
    "2) Konkrétní hook: na co jsi narazil (salon, město, Google, IG, web) — jen z dat.",
    "3) Jejich problém (1–3 věty z uvedených problémů).",
    "4) Proč právě tento balíček (like-for-like: jednostránka→START, SEO/více stránek→PRO).",
    "5) Odrážky balíčku přesně:",
    ...pkg.features.map((f) => `   – ${f}`),
    "6) Soft CTA: zdarma ukázka nové úvodní stránky.",
    "7) „Pokud Vás to zaujalo, stačí mi odpovědět „ANO“ a návrh Vám připravím.“",
    "8) „Teprve pokud se Vám bude směr líbit, můžeme se bavit o realizaci.“",
    "9) Podpis:",
    "S pozdravem",
    "Lukáš Ptáčník",
    "HAIRWEB.cz",
    "",
    "Tón: zdvořilý, konkrétní, vykání. Bez emoji. Bez angličtiny. Max ~220 slov.",
    "Vrať POUZE JSON: {\"subject\":\"...\",\"body\":\"...\"}",
    "",
    `Salon: ${salon}`,
    `Kontakt: ${lead.contact_person || "—"}`,
    `Město: ${lead.city || "—"}`,
    `Google: ${lead.google_rating ?? "—"} / ${lead.google_reviews_count ?? "—"} recenzí`,
    `Web URL: ${lead.has_website === false || lead.website === "—" ? "nemá" : lead.website}`,
    `Typ webu (odhad): ${shape}`,
    `Problémy: ${problems.join("; ") || "—"}`,
    `Silné stránky obsahu: ${strengths.join(", ") || "—"}`,
    `Instagram: ${lead.instagram_handle || lead.instagram_url || "—"}`,
    `Booking: ${lead.booking_provider || (lead.has_online_booking ? "ano" : "ne/neznámo")}`,
    `Mobile problém: ${lead.website_mobile_problem == null ? "—" : lead.website_mobile_problem ? "ano" : "ne"}`,
    `Zastaralý web: ${lead.website_outdated == null ? "—" : lead.website_outdated ? "ano" : "ne"}`,
    `Web score: ${lead.web_score ?? "—"}`,
    `Audit: ${(lead.website_audit || "").slice(0, 500) || "—"}`,
    `Opportunity: ${lead.opportunity_summary || "—"}`,
    `Pitch: ${lead.recommended_pitch || "—"}`,
  ].join("\n");

  try {
    const { text } = await generateText({
      model: model(),
      prompt,
      temperature: 0.45,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ...fallback, source: "template" };
    const parsed = JSON.parse(match[0]) as { subject?: string; body?: string };
    if (!parsed.subject?.trim() || !parsed.body?.trim()) {
      return { ...fallback, source: "template" };
    }

    return {
      templateKey: fallbackKey,
      packageId,
      subject: parsed.subject.trim().slice(0, 200),
      body: parsed.body.trim().slice(0, 8000),
      source: "ai",
    };
  } catch (error) {
    console.error("[outreach] AI draft failed", error);
    return { ...fallback, source: "template" };
  }
}

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Lead } from "@/lib/leads/types";
import {
  HAIRWEB_PACKAGES,
  buildOutreachDraft,
  contentStrengths,
  customerProblems,
  distinctiveHighlights,
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
  const highlights = distinctiveHighlights(lead);

  if (!hasOpenAi()) {
    return { ...fallback, source: "template" };
  }

  const salon = lead.salon_name || lead.name;

  const prompt = [
    "Napiš personalizovaný cold e-mail v češtině majiteli kadeřnictví / beauty salonu.",
    "Odesílatel: Lukáš Ptáčník, HAIRWEB.cz.",
    "",
    "DRŽ SE TÉTO STRUKTURY A TÓNU (jako vzor):",
    "",
    "Dobrý den,",
    "",
    "narazil jsem na web Vašeho salonu [NÁZEV] a zaujal mě hlavně [konkrétní věc z dat].",
    "",
    "Myslím si ale, že současný web už vizuálně úplně neodpovídá úrovni salonu a služeb, které nabízíte. Obsahově přitom máte velmi dobrý základ – [služby / specifika / tým / ceník / galerie] – který by se dal prezentovat moderněji a především lépe na mobilních telefonech.",
    "",
    `Rád bych Vám proto nabídl kompletní redesign současného webu za ${pkg.price}.`,
    "",
    "Součástí by byl nový individuální vzhled, responzivní zpracování pro mobil i počítač, přepracování současného obsahu, [jejich obsah], kontakty a mapa, výrazné možnosti objednání a základní SEO.",
    "(U PRO doplň vícestránkovou strukturu, lokální SEO, Analytics — bez odrážek, souvislý odstavec.)",
    "",
    "Aby pro Vás nabídka nebyla jen „na papíře“, rád Vám zdarma a nezávazně připravím ukázku, jak by mohla vypadat nová úvodní stránka Vašeho salonu.",
    "",
    "Pokud Vás to zaujalo, stačí mi odpovědět „ANO“ a návrh Vám připravím.",
    "Teprve pokud se Vám bude nový směr líbit, můžeme se bavit o samotné realizaci.",
    "",
    "S pozdravem",
    "",
    "Lukáš Ptáčník",
    "HAIRWEB.cz",
    "Weby pro kadeřnictví, barber shopy a vlasová studia",
    "",
    "PRAVIDLA:",
    "- Žádné odrážky, žádný název balíčku START/PRO v textu — jen cena a popis rozsahu.",
    "- Nic nevymýšlej. Specifika (např. K-SCAN) jen pokud jsou v datech.",
    `- Cena: ${pkg.price}. Typ webu: ${shape}. Balíček interně: ${pkg.name}.`,
    "- Bez emoji. Vykání. Max ~220 slov.",
    "Vrať POUZE JSON: {\"subject\":\"...\",\"body\":\"...\"}",
    "",
    `Salon: ${salon}`,
    `Město: ${lead.city || "—"}`,
    `Google: ${lead.google_rating ?? "—"} / ${lead.google_reviews_count ?? "—"}`,
    `Web: ${lead.has_website === false || lead.website === "—" ? "nemá" : lead.website}`,
    `Obsah: ${strengths.join(", ") || "—"}`,
    `Specifika: ${highlights.join(", ") || "—"}`,
    `Problémy: ${problems.join("; ") || "—"}`,
    `Audit: ${(lead.website_audit || "").slice(0, 600) || "—"}`,
    `Šablona: ${fallbackKey}`,
  ].join("\n");

  try {
    const { text } = await generateText({
      model: model(),
      prompt,
      temperature: 0.4,
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

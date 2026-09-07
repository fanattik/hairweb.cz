import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Lead } from "@/lib/leads/types";
import {
  buildOutreachDraft,
  suggestOutreachTemplate,
  type OutreachDraft,
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
): Promise<OutreachDraft & { source: "ai" | "template" }> {
  const fallbackKey = suggestOutreachTemplate(lead);
  const fallback = buildOutreachDraft(lead, fallbackKey);

  if (!hasOpenAi()) {
    return { ...fallback, source: "template" };
  }

  const salon = lead.salon_name || lead.name;
  const prompt = [
    "Napiš krátký personalizovaný cold e-mail v češtině pro majitele kadeřnictví / barber shopu.",
    "Odesílatel: Lukáš z Hairweb.cz (tvoří weby pro salony).",
    "Tón: lidský, konkrétní, ne spamový, max ~120 slov v těle.",
    "Bez emoji. Bez anglických frází. Podepiš: Lukáš / Hairweb.cz / https://hairweb.cz",
    "Vrať POUZE JSON: {\"subject\":\"...\",\"body\":\"...\"}",
    "",
    `Salon: ${salon}`,
    `Kontakt: ${lead.contact_person || "—"}`,
    `Město: ${lead.city || "—"}`,
    `Google: ${lead.google_rating ?? "—"} / ${lead.google_reviews_count ?? "—"} recenzí`,
    `Web: ${lead.has_website === false || lead.website === "—" ? "nemá" : lead.website}`,
    `Instagram: ${lead.instagram_handle || lead.instagram_url || "—"}`,
    `Booking: ${lead.booking_provider || (lead.has_online_booking ? "ano" : "ne/neznámo")}`,
    `Opportunity: ${lead.opportunity_summary || "—"}`,
    `Doporučený pitch: ${lead.recommended_pitch || "—"}`,
  ].join("\n");

  try {
    const { text } = await generateText({
      model: model(),
      prompt,
      temperature: 0.7,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ...fallback, source: "template" };
    const parsed = JSON.parse(match[0]) as { subject?: string; body?: string };
    if (!parsed.subject?.trim() || !parsed.body?.trim()) {
      return { ...fallback, source: "template" };
    }

    return {
      templateKey: fallbackKey,
      subject: parsed.subject.trim().slice(0, 200),
      body: parsed.body.trim().slice(0, 8000),
      source: "ai",
    };
  } catch (error) {
    console.error("[outreach] AI draft failed", error);
    return { ...fallback, source: "template" };
  }
}

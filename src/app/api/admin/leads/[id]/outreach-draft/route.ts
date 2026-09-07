import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generatePersonalizedOutreach } from "@/lib/leads/outreach-ai";
import {
  OUTREACH_TEMPLATES,
  buildOutreachDraft,
  suggestOutreachTemplate,
  type OutreachTemplateKey,
} from "@/lib/leads/outreach-templates";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  mode: z.enum(["template", "ai"]).default("template"),
  templateKey: z
    .enum(["no_website", "redesign", "local_seo", "follow_up", "blank"])
    .optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = lead as Lead;

  if (parsed.data.mode === "ai") {
    const draft = await generatePersonalizedOutreach(row);
    return NextResponse.json({ draft, templates: OUTREACH_TEMPLATES });
  }

  const key =
    parsed.data.templateKey || suggestOutreachTemplate(row);
  const draft = buildOutreachDraft(row, key);
  return NextResponse.json({
    draft: { ...draft, source: "template" as const },
    templates: OUTREACH_TEMPLATES,
    suggestedKey: suggestOutreachTemplate(row),
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = lead as Lead;
  const suggestedKey = suggestOutreachTemplate(row);
  const draft = buildOutreachDraft(row, suggestedKey);

  return NextResponse.json({
    draft: { ...draft, source: "template" as const },
    templates: OUTREACH_TEMPLATES,
    suggestedKey,
    aiAvailable: Boolean(process.env.OPENAI_API_KEY?.trim()),
    emailConfigured: Boolean(
      process.env.RESEND_API_KEY?.trim() &&
        process.env.HAIRWEB_FROM_EMAIL?.trim(),
    ),
  });
}

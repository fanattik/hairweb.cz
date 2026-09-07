import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generatePersonalizedOutreach } from "@/lib/leads/outreach-ai";
import {
  HAIRWEB_PACKAGES,
  OUTREACH_TEMPLATES,
  buildOutreachDraft,
  suggestHairwebPackage,
  suggestOutreachTemplate,
  type HairwebPackageId,
  type OutreachTemplateKey,
} from "@/lib/leads/outreach-templates";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  mode: z.enum(["template", "ai"]).default("template"),
  templateKey: z
    .enum(["no_website", "redesign", "local_seo", "follow_up", "blank"])
    .optional(),
  packageId: z.enum(["start", "pro"]).optional(),
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
  const key =
    (parsed.data.templateKey as OutreachTemplateKey | undefined) ||
    suggestOutreachTemplate(row);
  const packageId =
    (parsed.data.packageId as HairwebPackageId | undefined) ||
    suggestHairwebPackage(row, key);

  if (parsed.data.mode === "ai") {
    const draft = await generatePersonalizedOutreach(row, {
      templateKey: key,
      packageId,
    });
    return NextResponse.json({
      draft,
      templates: OUTREACH_TEMPLATES,
      packages: HAIRWEB_PACKAGES,
    });
  }

  const draft = buildOutreachDraft(row, key, packageId);
  return NextResponse.json({
    draft: { ...draft, source: "template" as const },
    templates: OUTREACH_TEMPLATES,
    packages: HAIRWEB_PACKAGES,
    suggestedKey: suggestOutreachTemplate(row),
    suggestedPackage: suggestHairwebPackage(row, key),
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
  const suggestedPackage = suggestHairwebPackage(row, suggestedKey);
  const draft = buildOutreachDraft(row, suggestedKey, suggestedPackage);

  return NextResponse.json({
    draft: { ...draft, source: "template" as const },
    templates: OUTREACH_TEMPLATES,
    packages: HAIRWEB_PACKAGES,
    suggestedKey,
    suggestedPackage,
    aiAvailable: Boolean(process.env.OPENAI_API_KEY?.trim()),
    emailConfigured: Boolean(
      process.env.RESEND_API_KEY?.trim() &&
        process.env.HAIRWEB_FROM_EMAIL?.trim(),
    ),
  });
}

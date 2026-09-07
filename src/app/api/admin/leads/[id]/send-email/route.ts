import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendLeadOutreachEmail } from "@/lib/leads/outreach-send";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.object({
  toEmail: z.string().trim().email().max(255).optional(),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(8000),
  templateKey: z.string().trim().max(50).nullable().optional(),
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

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
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
  const toEmail = (parsed.data.toEmail || row.email || "").trim().toLowerCase();
  if (!toEmail) {
    return NextResponse.json(
      { error: "Lead nemá e-mail. Doplň ho před odesláním." },
      { status: 400 },
    );
  }

  try {
    const result = await sendLeadOutreachEmail({
      supabase,
      lead: row,
      toEmail,
      subject: parsed.data.subject,
      body: parsed.data.body,
      templateKey: parsed.data.templateKey ?? null,
      userId: user.id,
    });

    return NextResponse.json({
      ok: true,
      resendId: result.resendId,
      toEmail,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Odeslání e-mailu selhalo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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

  const { data, error } = await supabase
    .from("lead_emails")
    .select(
      "id, created_at, to_email, subject, body_text, template_key, status, error, resend_id",
    )
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ emails: data ?? [] });
}

import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPatchAfterOutreachEmail } from "@/lib/leads/followup-actions";
import { formatPragueDate } from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendLeadOutreachEmail(input: {
  supabase: SupabaseClient;
  lead: Lead;
  toEmail: string;
  subject: string;
  body: string;
  templateKey?: string | null;
  userId?: string | null;
}): Promise<{ resendId: string | null }> {
  const resend = getResend();
  const from = process.env.HAIRWEB_FROM_EMAIL?.trim();
  const replyTo =
    process.env.HAIRWEB_REPLY_TO_EMAIL?.trim() ||
    process.env.HAIRWEB_NOTIFICATION_EMAIL?.trim() ||
    undefined;

  if (!resend || !from) {
    throw new Error(
      "Chybí RESEND_API_KEY nebo HAIRWEB_FROM_EMAIL. Nastav je ve Vercel / .env.local.",
    );
  }

  const { data, error } = await resend.emails.send({
    from,
    to: input.toEmail,
    replyTo,
    subject: input.subject,
    text: input.body,
  });

  if (error) {
    await input.supabase.from("lead_emails").insert({
      lead_id: input.lead.id,
      created_by: input.userId ?? null,
      to_email: input.toEmail,
      subject: input.subject,
      body_text: input.body,
      template_key: input.templateKey ?? null,
      status: "failed",
      error: error.message?.slice(0, 1000) ?? "Resend error",
    });
    throw new Error(error.message || "Odeslání e-mailu selhalo.");
  }

  const resendId = data?.id ?? null;

  await input.supabase.from("lead_emails").insert({
    lead_id: input.lead.id,
    created_by: input.userId ?? null,
    to_email: input.toEmail,
    subject: input.subject,
    body_text: input.body,
    template_key: input.templateKey ?? null,
    resend_id: resendId,
    status: "sent",
  });

  const now = new Date().toISOString();
  const patch = buildPatchAfterOutreachEmail(input.lead, now);

  const noteLine = `[E-mail ${new Date().toLocaleString("cs-CZ")}] ${input.subject}`;
  const notes = input.lead.notes?.trim()
    ? `${input.lead.notes.trim()}\n${noteLine}`
    : noteLine;
  patch.notes = notes;

  await input.supabase.from("leads").update(patch).eq("id", input.lead.id);

  const next = patch.next_followup_at as string | null | undefined;
  await input.supabase.from("lead_activities").insert({
    lead_id: input.lead.id,
    created_by: input.userId ?? null,
    activity_type: "contact",
    summary: next
      ? `Odeslán e-mail — další follow-up naplánován na ${formatPragueDate(next)}`
      : "Odeslán e-mail",
    meta: {
      contactType: "email",
      subject: input.subject,
      nextFollowupAt: next ?? null,
      resendId,
    },
  });

  return { resendId };
}

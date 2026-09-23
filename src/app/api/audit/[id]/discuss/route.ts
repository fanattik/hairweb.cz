import { NextResponse } from "next/server";
import { z } from "zod";
import { getSalonAudit } from "@/lib/audit/persist";
import { sendAuditDiscussNotification } from "@/lib/leads/email";
import {
  isHoneypotTriggered,
  isTooFastSubmit,
} from "@/lib/leads/normalize";
import { checkRateLimit, getClientIp } from "@/lib/leads/rate-limit";
import { createServiceClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().max(2000).optional(),
  companyWebsite: z.string().optional(),
  formStartedAt: z.number().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`audit-discuss:${ip}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů. Zkuste to za chvíli." },
        { status: 429 },
      );
    }

    const audit = await getSalonAudit(id);
    if (!audit || audit.status !== "completed") {
      return NextResponse.json(
        { error: "Audit nebyl nalezen." },
        { status: 404 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data. Zkontrolujte jméno a e-mail." },
        { status: 400 },
      );
    }

    if (isHoneypotTriggered(parsed.data.companyWebsite)) {
      return NextResponse.json({ ok: true });
    }

    if (
      parsed.data.formStartedAt &&
      isTooFastSubmit(parsed.data.formStartedAt)
    ) {
      return NextResponse.json(
        { error: "Formulář byl odeslán příliš rychle. Zkuste to znovu." },
        { status: 400 },
      );
    }

    const note = [
      "Klient chce probrat výsledek online auditu.",
      parsed.data.message?.trim()
        ? `Zpráva: ${parsed.data.message.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const supabase = createServiceClient();
    if (audit.lead_id) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id, message, status")
        .eq("id", audit.lead_id)
        .maybeSingle();

      if (lead) {
        const prev = typeof lead.message === "string" ? lead.message.trim() : "";
        const nextMessage = prev
          ? `${prev}\n\n---\n${note}`
          : note;
        await supabase
          .from("leads")
          .update({
            message: nextMessage,
            status:
              lead.status === "new" || lead.status === "contacted"
                ? "interested"
                : lead.status,
            phone: parsed.data.phone?.trim() || undefined,
          })
          .eq("id", lead.id);
      }
    }

    try {
      await sendAuditDiscussNotification({
        auditId: audit.id,
        leadId: audit.lead_id,
        salonName: audit.salon_name,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message || "",
        overallScore: audit.overall_score,
      });
    } catch (emailError) {
      console.error("[audit-discuss] Email failed", emailError);
      // Still OK for the user — intent is logged on the lead when possible
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[audit-discuss] Unexpected error", error);
    return NextResponse.json(
      { error: "Něco se nepovedlo. Zkuste to znovu." },
      { status: 500 },
    );
  }
}

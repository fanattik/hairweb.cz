import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { leadSubmitSchema } from "@/lib/leads/schema";
import {
  isHoneypotTriggered,
  isTooFastSubmit,
  normalizeLeadSubmit,
} from "@/lib/leads/normalize";
import { checkRateLimit, getClientIp } from "@/lib/leads/rate-limit";
import {
  sendAdminNotification,
  sendCustomerConfirmation,
} from "@/lib/leads/email";
import type { Lead } from "@/lib/leads/types";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`lead:${ip}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů. Zkuste to za chvíli." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = leadSubmitSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return NextResponse.json(
        { error: "Neplatná data.", fieldErrors },
        { status: 400 },
      );
    }

    // Silent reject for bots — do not reveal honeypot.
    if (isHoneypotTriggered(parsed.data.companyWebsite)) {
      return NextResponse.json({ ok: true, id: "ignored" });
    }

    if (isTooFastSubmit(parsed.data.formStartedAt)) {
      return NextResponse.json(
        { error: "Formulář byl odeslán příliš rychle. Zkuste to znovu." },
        { status: 400 },
      );
    }

    const row = normalizeLeadSubmit(parsed.data);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("leads")
      .insert(row)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[leads] Insert failed", error);
      return NextResponse.json(
        { error: "Něco se nepovedlo. Zkuste to znovu." },
        { status: 500 },
      );
    }

    const lead = data as Lead;

    // Emails must not fail the submission — DB is source of truth.
    try {
      await sendAdminNotification(lead);
    } catch (emailError) {
      console.error("[leads] Admin email failed after insert", emailError);
    }

    try {
      await sendCustomerConfirmation(lead);
    } catch (emailError) {
      console.error("[leads] Customer email failed after insert", emailError);
    }

    return NextResponse.json({
      ok: true,
      id: lead.id,
      package: lead.package,
      sourceDetail: lead.source_detail,
      utm: {
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
      },
    });
  } catch (error) {
    console.error("[leads] Unexpected error", error);
    return NextResponse.json(
      { error: "Něco se nepovedlo. Zkuste to znovu." },
      { status: 500 },
    );
  }
}

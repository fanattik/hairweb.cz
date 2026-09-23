import { NextResponse } from "next/server";
import { persistCompletedAudit } from "@/lib/audit/persist";
import { auditSubmitSchema } from "@/lib/audit/schema";
import {
  isHoneypotTriggered,
  isTooFastSubmit,
} from "@/lib/leads/normalize";
import { checkRateLimit, getClientIp } from "@/lib/leads/rate-limit";

/** PageSpeed Insights often needs 20–50s; keep headroom for probe + Places. */
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`audit:${ip}`);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů. Zkuste to za chvíli." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = auditSubmitSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { error: "Neplatná data.", fieldErrors },
        { status: 400 },
      );
    }

    if (isHoneypotTriggered(parsed.data.companyWebsite)) {
      return NextResponse.json({ ok: true, id: "ignored" });
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

    const { answers } = parsed.data;

    if (answers.hasWebsite && !answers.websiteUrl?.trim()) {
      return NextResponse.json(
        {
          error: "Doplňte adresu webu.",
          fieldErrors: { "answers.websiteUrl": "Doplňte adresu webu." },
        },
        { status: 400 },
      );
    }

    const { audit, lead, result } = await persistCompletedAudit({
      answers,
      attribution: parsed.data.attribution as Record<string, unknown> | null,
      sourceDetail: parsed.data.sourceDetail || "online_audit",
    });

    return NextResponse.json({
      ok: true,
      id: audit.id,
      leadId: lead.id,
      score: result.overallScore,
    });
  } catch (error) {
    console.error("[audit] Unexpected error", error);
    return NextResponse.json(
      { error: "Něco se nepovedlo. Zkuste to znovu." },
      { status: 500 },
    );
  }
}

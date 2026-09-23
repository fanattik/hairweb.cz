import { NextResponse } from "next/server";
import { getSalonAudit } from "@/lib/audit/persist";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id || id.length < 8) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const audit = await getSalonAudit(id);
  if (!audit || audit.status !== "completed") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Public result payload — no internal lead notes
  return NextResponse.json({
    id: audit.id,
    salonName: audit.salon_name,
    city: audit.city,
    completedAt: audit.completed_at,
    overallScore: audit.overall_score,
    scores: audit.scores,
    strengths: audit.strengths,
    recommendations: audit.recommendations,
    quickWins: audit.quick_wins,
    summary: audit.summary,
    relevantServices: audit.relevant_services,
    categoryScores: {
      web: audit.score_web,
      google: audit.score_google,
      reviews: audit.score_reviews,
      booking: audit.score_booking,
      social: audit.score_social,
      customers: audit.score_customers,
      marketing: audit.score_marketing,
    },
    contact: {
      name: audit.name,
      email: audit.email,
    },
  });
}

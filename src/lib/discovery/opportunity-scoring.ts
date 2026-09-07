/**
 * LeadScoringService — Opportunity Score 0–100.
 * Higher = stronger website sales opportunity for Hairweb.
 */

import type {
  OpportunityGrade,
  OpportunityScoreBreakdown,
  OpportunityScoreResult,
  OpportunitySignal,
} from "@/lib/discovery/types";

export type OpportunityScoreInput = {
  googleRating?: number | null;
  googleReviewsCount?: number | null;
  hasWebsite?: boolean | null;
  website?: string | null;
  websiteBroken?: boolean | null;
  httpsEnabled?: boolean | null;
  mobileFriendly?: boolean | null;
  hasBooking?: boolean | null;
  weakSeo?: boolean | null;
  weakWebsite?: boolean | null;
  websiteScore?: number | null;
  instagramActive?: boolean | null;
  hasFacebook?: boolean | null;
  instagramStrong?: boolean | null;
};

function gradeFromScore(score: number): OpportunityGrade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 45) return "C";
  return "D";
}

function hasRealWebsite(input: OpportunityScoreInput) {
  if (input.hasWebsite === false) return false;
  const web = input.website?.trim();
  if (!web || web === "—") return false;
  return true;
}

/**
 * Calculate opportunity score + signals + outreach recommendations.
 */
export function calculateOpportunityScore(
  input: OpportunityScoreInput,
): OpportunityScoreResult {
  const reasons: OpportunityScoreBreakdown[] = [];
  const signals: OpportunitySignal[] = [];
  let total = 0;

  const rating = input.googleRating;
  if (rating != null) {
    let pts = 2;
    let label = `Rating ${rating.toFixed(1)}`;
    if (rating >= 4.8) {
      pts = 15;
      label = `Rating ${rating.toFixed(1)} (4.8+)`;
    } else if (rating >= 4.5) {
      pts = 12;
      label = `Rating ${rating.toFixed(1)} (4.5+)`;
    } else if (rating >= 4.0) {
      pts = 8;
      label = `Rating ${rating.toFixed(1)} (4.0+)`;
    }
    total += pts;
    reasons.push({ label, points: pts });
  }

  const reviews = input.googleReviewsCount ?? 0;
  if (reviews >= 100) {
    total += 15;
    reasons.push({ label: `${reviews} recenzí (100+)`, points: 15 });
  } else if (reviews >= 50) {
    total += 12;
    reasons.push({ label: `${reviews} recenzí (50+)`, points: 12 });
  } else if (reviews >= 20) {
    total += 8;
    reasons.push({ label: `${reviews} recenzí (20+)`, points: 8 });
  } else if (reviews >= 5) {
    total += 4;
    reasons.push({ label: `${reviews} recenzí (5+)`, points: 4 });
  } else if (reviews > 0 && reviews < 5) {
    signals.push({
      type: "LOW_REVIEW_COUNT",
      severity: "low",
      score: 0,
      message: `Salon má jen ${reviews} Google recenzí — slabší sociální důkaz.`,
    });
  }

  const websiteOk = hasRealWebsite(input);

  if (!websiteOk) {
    total += 25;
    reasons.push({ label: "Nemá web", points: 25 });
    signals.push({
      type: "NO_WEBSITE",
      severity: "high",
      score: 25,
      message:
        "Salon nemá vlastní web. Silná příležitost nabídnout prezentační web.",
    });
  } else if (input.websiteBroken) {
    total += 25;
    reasons.push({ label: "Web nefunguje", points: 25 });
    signals.push({
      type: "BROKEN_WEBSITE",
      severity: "high",
      score: 25,
      message: "Web neodpovídá nebo vrací chybu.",
    });
  } else {
    if (input.httpsEnabled === false) {
      total += 8;
      reasons.push({ label: "Bez HTTPS", points: 8 });
      signals.push({
        type: "NO_HTTPS",
        severity: "medium",
        score: 8,
        message: "Web neběží na HTTPS.",
      });
    }
    if (input.mobileFriendly === false) {
      total += 10;
      reasons.push({ label: "Není mobile friendly", points: 10 });
      signals.push({
        type: "NOT_MOBILE_FRIENDLY",
        severity: "high",
        score: 10,
        message: "Web není dobře použitelný na mobilu.",
      });
    }
    if (input.hasBooking === false) {
      total += 5;
      reasons.push({ label: "Chybí booking", points: 5 });
      signals.push({
        type: "NO_BOOKING",
        severity: "medium",
        score: 5,
        message: "Na webu chybí online rezervace.",
      });
    }
    if (input.weakSeo) {
      total += 5;
      reasons.push({ label: "Špatné SEO", points: 5 });
      signals.push({
        type: "BAD_SEO",
        severity: "medium",
        score: 5,
        message: "Slabé SEO / meta údaje.",
      });
    }
    if (input.weakWebsite || (input.websiteScore != null && input.websiteScore < 45)) {
      const pts = Math.min(
        15,
        input.websiteScore != null
          ? Math.round((45 - Math.min(input.websiteScore, 45)) / 3) + 5
          : 12,
      );
      total += pts;
      reasons.push({ label: "Slabý / zastaralý web", points: pts });
      signals.push({
        type: "OLD_DESIGN",
        severity: "high",
        score: pts,
        message: "Web působí zastarale nebo slabě — redesign opportunity.",
      });
    }
  }

  if (input.instagramActive) {
    total += 8;
    reasons.push({ label: "Aktivní Instagram", points: 8 });
  }
  if (input.hasFacebook) {
    total += 3;
    reasons.push({ label: "Facebook", points: 3 });
  }

  const strongIgWeakWeb =
    (input.instagramStrong || input.instagramActive) &&
    (!websiteOk || input.weakWebsite || (input.websiteScore != null && input.websiteScore < 50));
  if (strongIgWeakWeb) {
    total += 10;
    reasons.push({ label: "Silný IG / slabý web", points: 10 });
    signals.push({
      type: "STRONG_INSTAGRAM_WEAK_WEBSITE",
      severity: "high",
      score: 10,
      message:
        "Salon má aktivní Instagram, ale slabou nebo chybějící webovou prezentaci.",
    });
  }

  if (
    websiteOk &&
    rating != null &&
    rating >= 4.7 &&
    reviews >= 50 &&
    (input.weakWebsite ||
      input.websiteBroken ||
      (input.websiteScore != null && input.websiteScore < 50))
  ) {
    total += 20;
    reasons.push({ label: "Vysoké rating + slabý web", points: 20 });
    signals.push({
      type: "HIGH_RATING_BAD_WEBSITE",
      severity: "high",
      score: 20,
      message: `Salon má Google hodnocení ${rating.toFixed(1)} z ${reviews} recenzí, ale web má nízké hodnocení. Silná obchodní příležitost.`,
    });
  }

  if (!websiteOk && rating != null && rating >= 4.7 && reviews >= 50) {
    // Already got NO_WEBSITE + rating; add HIGH_RATING signal flavor if not present
    if (!signals.some((s) => s.type === "HIGH_RATING_BAD_WEBSITE")) {
      signals.push({
        type: "HIGH_RATING_BAD_WEBSITE",
        severity: "high",
        score: 20,
        message: `Salon má Google hodnocení ${rating.toFixed(1)} z ${reviews} recenzí, ale nemá vlastní web. Silná obchodní příležitost.`,
      });
      total += 20;
      reasons.push({ label: "Vysoké rating bez webu", points: 20 });
    }
  }

  const opportunityScore = Math.min(100, Math.max(0, total));
  const opportunityGrade = gradeFromScore(opportunityScore);

  let recommendedPitch = "Prezentační web pro salon";
  let suggestedService = "START web";
  if (!websiteOk) {
    recommendedPitch = "Vlastní web pro salon s online rezervací.";
    suggestedService = "START web + rezervace";
  } else if (input.weakWebsite || (input.websiteScore != null && input.websiteScore < 50)) {
    recommendedPitch = "Redesign zastaralého webu.";
    suggestedService = "PRO redesign";
  } else if (input.weakSeo) {
    recommendedPitch = "Web zaměřený na lokální SEO.";
    suggestedService = "SEO + obsah";
  }

  let recommendedChannel = "Phone";
  if (input.instagramActive) recommendedChannel = "Instagram DM";
  else if (websiteOk) recommendedChannel = "Email";

  const summaryParts: string[] = [];
  if (opportunityGrade === "A") summaryParts.push("Velmi zajímavý lead.");
  else if (opportunityGrade === "B") summaryParts.push("Silná příležitost.");
  else if (opportunityGrade === "C") summaryParts.push("Střední příležitost.");
  else summaryParts.push("Slabší příležitost.");

  if (rating != null) {
    summaryParts.push(
      `Google ${rating.toFixed(1)}${reviews ? ` / ${reviews} recenzí` : ""}.`,
    );
  }
  if (!websiteOk) summaryParts.push("Nemá vlastní web.");
  else if (input.weakWebsite) summaryParts.push("Web je slabý nebo zastaralý.");
  if (input.instagramActive) summaryParts.push("Má aktivní Instagram.");
  summaryParts.push(`Doporučené oslovení: ${recommendedPitch}`);

  return {
    opportunityScore,
    opportunityGrade,
    reasons,
    signals,
    recommendedPitch,
    recommendedChannel,
    suggestedService,
    summary: summaryParts.join(" "),
  };
}

export const LeadScoringService = {
  calculate: calculateOpportunityScore,
  gradeFromScore,
};

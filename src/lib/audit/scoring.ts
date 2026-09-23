import {
  AUDIT_CATEGORIES,
  AUDIT_CATEGORY_LABELS,
  AUDIT_CATEGORY_WEIGHTS,
  type AuditCategory,
  type AuditCategoryScore,
  type AuditCheck,
  type AuditQuickWin,
  type AuditRecommendation,
  type AuditScoresPayload,
  type AuditStrength,
} from "@/lib/audit/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function scoreBand(overall: number): AuditScoresPayload["band"] {
  if (overall >= 80) return "strong";
  if (overall >= 65) return "good";
  if (overall >= 45) return "fair";
  return "weak";
}

export function scoreHeadline(overall: number): string {
  if (overall >= 85) {
    return "Váš salon má online velmi silný základ. Našli jsme jen drobnosti k doladění.";
  }
  if (overall >= 70) {
    return "Váš salon má dobrý základ, ale našli jsme několik míst, kde přicházíte o potenciál.";
  }
  if (overall >= 50) {
    return "Online fungování salonu má co zlepšit — několik oblastí vám zbytečně bere zákazníky nebo čas.";
  }
  return "Online prezentace salonu zatím výrazně omezuje, kolik zákazníků k vám může přijít.";
}

/**
 * Category score = earned / max among known checks only.
 * Unknown checks never lower the score.
 */
export function computeCategoryScore(
  checks: AuditCheck[],
  category: AuditCategory,
): AuditCategoryScore {
  const relevant = checks.filter((c) => c.category === category);
  const known = relevant.filter((c) => c.status !== "unknown" && c.maxPoints > 0);
  const earned = known.reduce((sum, c) => sum + c.points, 0);
  const max = known.reduce((sum, c) => sum + c.maxPoints, 0);
  const score =
    max > 0 ? Math.round(clamp((earned / max) * 100, 0, 100)) : null;

  return {
    category,
    label: AUDIT_CATEGORY_LABELS[category],
    score,
    earned,
    max,
    weight: AUDIT_CATEGORY_WEIGHTS[category],
  };
}

export function computeOverallScore(
  categories: AuditCategoryScore[],
): number {
  const usable = categories.filter((c) => c.score != null);
  if (usable.length === 0) return 0;
  const totalWeight = usable.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) return 0;
  const weighted = usable.reduce(
    (sum, c) => sum + (c.score as number) * c.weight,
    0,
  );
  return Math.round(clamp(weighted / totalWeight, 0, 100));
}

export function computeScores(checks: AuditCheck[]): AuditScoresPayload {
  const categories = AUDIT_CATEGORIES.map((category) =>
    computeCategoryScore(checks, category),
  );
  const overall = computeOverallScore(categories);
  return {
    overall,
    categories,
    band: scoreBand(overall),
    headline: scoreHeadline(overall),
  };
}

export function extractStrengths(checks: AuditCheck[]): AuditStrength[] {
  return checks
    .filter((c) => c.status === "pass" && c.maxPoints >= 4)
    .map((c) => ({
      id: `strength_${c.checkId}`,
      checkId: c.checkId,
      category: c.category,
      title: c.title,
      description: c.description,
    }))
    .slice(0, 6);
}

export function extractRecommendations(
  checks: AuditCheck[],
): AuditRecommendation[] {
  const items: AuditRecommendation[] = checks
    .filter(
      (c) =>
        (c.status === "fail" || c.status === "partial") &&
        c.recommendation &&
        c.severity !== "none",
    )
    .map((c) => {
      const priority: AuditRecommendation["priority"] =
        c.severity === "high"
          ? "high"
          : c.severity === "medium"
            ? "medium"
            : "low";
      return {
        id: `rec_${c.checkId}`,
        checkId: c.checkId,
        category: c.category,
        priority,
        title: c.title,
        description: c.description,
        recommendation: c.recommendation as string,
        ease: c.ease ?? 3,
        impact: c.impact ?? 3,
      };
    });

  const order: Record<AuditRecommendation["priority"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return items.sort((a, b) => {
    if (order[a.priority] !== order[b.priority]) {
      return order[a.priority] - order[b.priority];
    }
    return b.impact * b.ease - a.impact * a.ease;
  });
}

export function extractQuickWins(
  recommendations: AuditRecommendation[],
): AuditQuickWin[] {
  return [...recommendations]
    .sort((a, b) => b.impact * b.ease - a.impact * a.ease)
    .slice(0, 3)
    .map((rec, index) => ({
      rank: index + 1,
      title: rec.title,
      recommendation: rec.recommendation,
      category: rec.category,
      checkId: rec.checkId,
    }));
}

const SERVICE_BY_CATEGORY: Record<
  AuditCategory,
  { slug: string; title: string; blurb: string }
> = {
  web: {
    slug: "web",
    title: "Web",
    blurb: "Můžeme upravit nebo postavit tak, aby vedl k rezervaci.",
  },
  google: {
    slug: "lokalni-viditelnost",
    title: "Google",
    blurb: "Můžeme spravovat profil a lokální viditelnost za vás.",
  },
  directories: {
    slug: "lokalni-viditelnost",
    title: "Katalogy",
    blurb: "Můžeme dát do pořádku Firmy.cz, Mapy.cz i oborové katalogy.",
  },
  ai: {
    slug: "web",
    title: "Web pro AI",
    blurb: "Můžeme připravit web tak, aby vás AI uměl doporučit.",
  },
  reviews: {
    slug: "recenze",
    title: "Recenze",
    blurb: "Můžeme nastavit systém získávání hodnocení.",
  },
  booking: {
    slug: "rezervace",
    title: "Rezervace",
    blurb: "Můžeme propojit a zjednodušit cestu k termínu.",
  },
  social: {
    slug: "socialni-site",
    title: "Sociální sítě",
    blurb: "Můžeme pomoci s prezentací práce bez večerní směny.",
  },
  customers: {
    slug: "zakaznici",
    title: "Zákazníci",
    blurb: "Můžeme nastavit připomínky a návrat klientů.",
  },
  marketing: {
    slug: "marketing",
    title: "Data & marketing",
    blurb: "Můžeme měřit, co skutečně přivádí rezervace.",
  },
};

export function relevantServicesFromRecommendations(
  recommendations: AuditRecommendation[],
): Array<{ slug: string; title: string; blurb: string }> {
  const seen = new Set<AuditCategory>();
  const out: Array<{ slug: string; title: string; blurb: string }> = [];
  for (const rec of recommendations) {
    if (seen.has(rec.category)) continue;
    if (rec.priority === "low" && recommendations.length > 3) continue;
    seen.add(rec.category);
    out.push(SERVICE_BY_CATEGORY[rec.category]);
    if (out.length >= 5) break;
  }
  return out;
}

/** Deterministic Czech summary from scores + top issues (no AI). */
export function buildDeterministicSummary(
  scores: AuditScoresPayload,
  strengths: AuditStrength[],
  recommendations: AuditRecommendation[],
): string {
  const topStrengths = strengths.slice(0, 2).map((s) => s.title.toLowerCase());
  const topIssues = recommendations
    .filter((r) => r.priority === "high")
    .slice(0, 2)
    .map((r) => r.title.toLowerCase());

  const parts: string[] = [];

  if (topStrengths.length) {
    parts.push(
      `Silné stránky: ${topStrengths.join(" a ")}.`,
    );
  }

  if (topIssues.length) {
    parts.push(
      `Největší prostor vidíme v oblastech: ${topIssues.join(" a ")}.`,
    );
  } else if (recommendations.length) {
    parts.push(
      `Nejde o zásadní mezery — spíš o doladění ${recommendations[0].title.toLowerCase()}.`,
    );
  } else {
    parts.push("Neověřili jsme žádné zásadní problémy k okamžité opravě.");
  }

  parts.push(scores.headline);

  return parts.join(" ");
}

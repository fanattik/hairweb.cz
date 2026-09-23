import { check, type Analyzer } from "@/lib/audit/analyzers/types";
import type { AuditCheck, AuditCheckStatus, AuditSeverity } from "@/lib/audit/types";

function formatLoadTime(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function perfBand(score: number): {
  status: AuditCheckStatus;
  points: number;
  severity: AuditSeverity;
} {
  const points = Math.max(0, Math.min(10, Math.round(score / 10)));
  if (score >= 90) return { status: "pass", points: 10, severity: "none" };
  if (score >= 50)
    return { status: "partial", points, severity: "medium" };
  return { status: "fail", points, severity: "high" };
}

function lcpBand(lcpMs: number): {
  status: AuditCheckStatus;
  points: number;
  severity: AuditSeverity;
  label: string;
} {
  if (lcpMs <= 2500) {
    return {
      status: "pass",
      points: 5,
      severity: "none",
      label: "v pohodě",
    };
  }
  if (lcpMs <= 4000) {
    return {
      status: "partial",
      points: 2,
      severity: "medium",
      label: "pomalejší",
    };
  }
  return {
    status: "fail",
    points: 0,
    severity: "high",
    label: "moc pomalé",
  };
}

function scoreBand(score: number): {
  status: AuditCheckStatus;
  points: number;
  severity: AuditSeverity;
} {
  if (score >= 90) return { status: "pass", points: 5, severity: "none" };
  if (score >= 50)
    return {
      status: "partial",
      points: Math.round((score / 100) * 5),
      severity: "medium",
    };
  return {
    status: "fail",
    points: Math.max(0, Math.round((score / 100) * 5)),
    severity: "high",
  };
}

/**
 * Mobile speed checks (PageSpeed Insights under the hood).
 * Copy stays salon-owner friendly — no LCP / TBT jargon in titles.
 */
export const analyzePagespeed: Analyzer = (ctx) => {
  const { lighthouse, websiteProbe, answers } = ctx;
  const checks: AuditCheck[] = [];

  const listedUrl =
    answers.websiteUrl || answers.suggestedWebsite || websiteProbe?.inputUrl;
  const urlBroken = Boolean(websiteProbe && listedUrl && !websiteProbe.ok);
  const hasSite = Boolean(
    (answers.hasWebsite || listedUrl) && !urlBroken,
  );

  if (!hasSite) {
    return checks;
  }

  if (!lighthouse || lighthouse.error || lighthouse.performance == null) {
    checks.push(
      check({
        checkId: "web_psi_performance",
        category: "web",
        status: "unknown",
        points: 0,
        maxPoints: 10,
        severity: "none",
        title: "Rychlost webu na telefonu",
        description: lighthouse?.error
          ? `Rychlost webu se nepodařilo změřit: ${lighthouse.error.slice(0, 160)}`
          : "Rychlost webu na telefonu jsme zatím neověřili.",
        recommendation: null,
        source: "pagespeed",
      }),
    );
    return checks;
  }

  const perf = perfBand(lighthouse.performance);
  checks.push(
    check({
      checkId: "web_psi_performance",
      category: "web",
      status: perf.status,
      points: perf.points,
      maxPoints: 10,
      severity: perf.severity,
      title: "Rychlost načítání na telefonu",
      description:
        perf.status === "pass"
          ? `Web se na telefonu načítá rychle (skóre ${lighthouse.performance}/100).`
          : `Web se na telefonu načítá pomalu (skóre ${lighthouse.performance}/100). Část lidí odejde dřív, než stihne rezervovat.`,
      recommendation:
        perf.status === "pass"
          ? null
          : "Zmenšete velké fotky, omezte těžké skripty a zvažte rychlejší hosting. Cíl je, aby web na telefonu působil okamžitě.",
      source: "pagespeed",
      value: lighthouse.performance,
      ease: 2,
      impact: 5,
    }),
  );

  if (lighthouse.lcpMs != null) {
    const lcp = lcpBand(lighthouse.lcpMs);
    checks.push(
      check({
        checkId: "web_psi_lcp",
        category: "web",
        status: lcp.status,
        points: lcp.points,
        maxPoints: 5,
        severity: lcp.severity,
        title: "Jak rychle se ukáže hlavní obsah",
        description: `Hlavní obsah stránky se ukáže za ${formatLoadTime(lighthouse.lcpMs)} (${lcp.label}).`,
        recommendation:
          lcp.status === "pass"
            ? null
            : "Zmenšete úvodní fotku a zrychlete hosting — ideálně do 2–3 sekund, než zákazník uvidí to podstatné.",
        source: "pagespeed",
        value: Math.round(lighthouse.lcpMs),
        ease: 2,
        impact: 5,
      }),
    );
  }

  if (lighthouse.seo != null) {
    const seo = scoreBand(lighthouse.seo);
    checks.push(
      check({
        checkId: "web_psi_seo",
        category: "web",
        status: seo.status,
        points: seo.points,
        maxPoints: 5,
        severity: seo.severity,
        title: "Základy pro Google",
        description:
          seo.status === "pass"
            ? `Technické základy pro vyhledávání jsou v pořádku (skóre ${lighthouse.seo}/100).`
            : `Technické základy pro Google mají mezery (skóre ${lighthouse.seo}/100).`,
        recommendation:
          seo.status === "pass"
            ? null
            : "Doplňte srozumitelný název stránky, krátký popis salonu a ověřte, že web jde otevřít i na telefonu.",
        source: "pagespeed",
        value: lighthouse.seo,
        ease: 4,
        impact: 3,
      }),
    );
  }

  if (lighthouse.accessibility != null) {
    const a11y = scoreBand(lighthouse.accessibility);
    checks.push(
      check({
        checkId: "web_psi_accessibility",
        category: "web",
        status: a11y.status,
        points: a11y.points,
        maxPoints: 5,
        severity: a11y.severity,
        title: "Přehlednost a čitelnost",
        description:
          a11y.status === "pass"
            ? `Web je přehledný a čitelný (skóre ${lighthouse.accessibility}/100).`
            : `Web má mezery v přehlednosti a čitelnosti (skóre ${lighthouse.accessibility}/100).`,
        recommendation:
          a11y.status === "pass"
            ? null
            : "Zlepšete kontrast textu, popisky fotek a srozumitelné nadpisy — ať je web pohodlný pro každého.",
        source: "pagespeed",
        value: lighthouse.accessibility,
        ease: 3,
        impact: 3,
      }),
    );
  }

  if (lighthouse.bestPractices != null) {
    const bp = scoreBand(lighthouse.bestPractices);
    checks.push(
      check({
        checkId: "web_psi_best_practices",
        category: "web",
        status: bp.status,
        points: bp.points,
        maxPoints: 5,
        severity: bp.severity,
        title: "Technická čistota webu",
        description:
          bp.status === "pass"
            ? `Technická stránka webu je v pořádku (skóre ${lighthouse.bestPractices}/100).`
            : `Technická stránka webu má co doladit (skóre ${lighthouse.bestPractices}/100).`,
        recommendation:
          bp.status === "pass"
            ? null
            : "Nechte web projít odborníkem nebo hostingem — často stačí aktualizace a drobné technické úpravy.",
        source: "pagespeed",
        value: lighthouse.bestPractices,
        ease: 3,
        impact: 3,
      }),
    );
  }

  return checks;
};

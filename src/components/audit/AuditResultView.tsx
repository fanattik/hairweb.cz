"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { AuditDiscussCta } from "@/components/audit/AuditDiscussCta";
import { trackEvent } from "@/lib/analytics";
import {
  AUDIT_CATEGORY_LABELS,
  type AuditCategory,
  type AuditCheck,
  type AuditPagespeedSnapshot,
  type AuditRecommendation,
  type SalonAuditRow,
} from "@/lib/audit/types";

type AreaTone = {
  bar: string;
  tint: string;
  ink: string;
  label: string;
};

function areaTone(score: number | null): AreaTone {
  if (score == null) {
    return {
      bar: "#c8c4be",
      tint: "#eceae4",
      ink: "#8a877f",
      label: "—",
    };
  }
  if (score >= 75) {
    return {
      bar: "oklch(0.6 0.15 150)",
      tint: "oklch(0.94 0.05 150)",
      ink: "oklch(0.4 0.1 150)",
      label: "OK",
    };
  }
  if (score >= 40) {
    return {
      bar: "oklch(0.74 0.15 70)",
      tint: "oklch(0.95 0.05 80)",
      ink: "oklch(0.45 0.1 65)",
      label: "ZLEPŠIT",
    };
  }
  return {
    bar: "oklch(0.57 0.2 27)",
    tint: "oklch(0.94 0.04 25)",
    ink: "oklch(0.45 0.15 27)",
    label: "CHYBÍ",
  };
}

function formatLcp(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function formatCls(cls: number | null): string {
  if (cls == null) return "—";
  return cls.toFixed(2);
}

function formatTbt(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function nedostatkyPhrase(count: number): string {
  if (count === 1) {
    return "1 nedostatek, který si můžete opravit sami — nebo to nechte na nás.";
  }
  if (count >= 2 && count <= 4) {
    return `${count} nedostatky, které si můžete opravit sami — nebo to nechte na nás.`;
  }
  return `${count} nedostatků, které si můžete opravit sami — nebo to nechte na nás.`;
}

function PrioritySectionCta({
  audit,
  count,
  location,
  className = "",
}: {
  audit: SalonAuditRow;
  count: number;
  location: string;
  className?: string;
}) {
  return (
    <div
      className={`mt-8 flex flex-col gap-5 rounded-[24px] bg-copper px-[clamp(1.35rem,3vw,2rem)] py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-8 ${className}`}
    >
      <div className="max-w-[560px]">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-white/70 uppercase">
          Další krok
        </p>
        <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight sm:text-[18px]">
          {nedostatkyPhrase(count)}
        </p>
      </div>
      <AuditDiscussCta
        audit={audit}
        location={location}
        label="Nechte to na nás"
        className="min-h-12 shrink-0 bg-ink px-7 py-3.5 text-[15px] text-foam hover:bg-ink/90"
      />
    </div>
  );
}

function pagespeedFromAudit(
  audit: SalonAuditRow,
): AuditPagespeedSnapshot | null {
  const hasWebsite =
    audit.answers?.hasWebsite === true ||
    Boolean(audit.answers?.websiteUrl) ||
    Boolean(audit.answers?.suggestedWebsite);

  const fromScores = audit.scores?.pagespeed;
  if (fromScores) return fromScores;
  if (fromScores === null && !hasWebsite) return null;

  const checks = (audit.checks || []) as AuditCheck[];
  const byId = (id: string) => checks.find((c) => c.checkId === id);
  const num = (c: AuditCheck | undefined) =>
    c && typeof c.value === "number" && c.status !== "unknown" ? c.value : null;

  const perf = byId("web_psi_performance");
  if (perf || byId("web_psi_seo") || byId("web_psi_lcp")) {
    return {
      performance: num(perf),
      seo: num(byId("web_psi_seo")),
      accessibility: num(byId("web_psi_accessibility")),
      bestPractices: num(byId("web_psi_best_practices")),
      lcpMs: num(byId("web_psi_lcp")),
      cls: null,
      tbtMs: null,
      error: perf?.status === "unknown" ? perf.description : null,
      strategy: "mobile",
    };
  }

  if (hasWebsite) {
    return {
      performance: null,
      seo: null,
      accessibility: null,
      bestPractices: null,
      lcpMs: null,
      cls: null,
      tbtMs: null,
      error:
        fromScores === null
          ? "Rychlost webu jsme u tohoto auditu nezměřili. Spusťte audit znovu."
          : "Tento audit ještě neobsahuje měření rychlosti. Spusťte audit znovu.",
      strategy: "mobile",
    };
  }

  return null;
}

/** Good speed metrics shown under strengths (plain-language labels). */
function goodPsiMetricCards(ps: AuditPagespeedSnapshot | null) {
  if (!ps) return [];
  const cards: Array<{ key: string; val: string; desc: string }> = [];
  if (ps.accessibility != null && ps.accessibility >= 90) {
    cards.push({
      key: "ČITELNOST",
      val: String(ps.accessibility),
      desc: "Jak přehledný a čitelný je web",
    });
  }
  if (ps.cls != null && ps.cls <= 0.1) {
    cards.push({
      key: "STABILITA",
      val: formatCls(ps.cls),
      desc: "Obsah při načítání neposkakuje",
    });
  }
  if (ps.tbtMs != null && ps.tbtMs <= 200) {
    cards.push({
      key: "ODEZVA",
      val: formatTbt(ps.tbtMs),
      desc: "Jak rychle web reaguje při ovládání",
    });
  }
  return cards;
}

function metricBadgeForRec(
  rec: AuditRecommendation,
  checks: AuditCheck[],
): { metric: string; label: string } | null {
  const check = checks.find((c) => c.checkId === rec.checkId);
  if (!check || typeof check.value !== "number") return null;

  if (check.checkId === "web_psi_lcp") {
    return { metric: formatLcp(check.value), label: "NAČTENÍ" };
  }
  if (check.checkId === "web_psi_performance") {
    return { metric: String(check.value), label: "RYCHLOST" };
  }
  if (check.checkId === "web_psi_best_practices") {
    return { metric: String(check.value), label: "TECHNIKA" };
  }
  if (check.checkId === "web_psi_seo") {
    return { metric: String(check.value), label: "GOOGLE" };
  }
  if (check.checkId === "web_psi_accessibility") {
    return { metric: String(check.value), label: "ČITELNOST" };
  }
  if (check.checkId.includes("review") && check.value > 5) {
    return { metric: String(Math.round(check.value)), label: "RECENZÍ" };
  }
  return null;
}

function strengthMetric(
  checkId: string,
  checks: AuditCheck[],
): string | null {
  const check = checks.find((c) => c.checkId === checkId);
  if (!check || typeof check.value !== "number") return null;
  if (check.checkId.startsWith("web_psi_") && check.checkId !== "web_psi_lcp") {
    return String(check.value);
  }
  return null;
}

function buildNarrative(audit: SalonAuditRow): {
  good: string;
  bad: string;
  rest: string;
} | null {
  const strengths = (audit.strengths || []).slice(0, 2).map((s) => s.title);
  const highs = (audit.recommendations || [])
    .filter((r) => r.priority === "high")
    .slice(0, 2)
    .map((r) => r.title.toLowerCase());

  if (strengths.length === 0 && highs.length === 0) return null;

  return {
    good:
      strengths.length > 0
        ? `Silné stránky: ${strengths.join(" a ").toLowerCase()}.`
        : "",
    bad:
      highs.length > 0
        ? `Největší prostor vidíme v oblastech: ${highs.join(" a ")}.`
        : "",
    rest: audit.scores?.headline || audit.summary || "",
  };
}

export function AuditResultView({ audit }: { audit: SalonAuditRow }) {
  useEffect(() => {
    trackEvent("audit_result_viewed", {
      score: audit.overall_score,
      audit_id: audit.id,
    });
  }, [audit.id, audit.overall_score]);

  const categories = (audit.scores?.categories || []) as Array<{
    category: AuditCategory;
    label: string;
    score: number | null;
  }>;
  const checks = (audit.checks || []) as AuditCheck[];
  const strengths = audit.strengths || [];
  const recommendations = audit.recommendations || [];
  const highRecs = recommendations.filter((r) => r.priority === "high");
  const midRecs = recommendations.filter(
    (r) => r.priority === "medium" || r.priority === "low",
  );
  const okCount = strengths.length;
  const fixCount = recommendations.length;
  const pagespeed = pagespeedFromAudit(audit);
  const psiGood = goodPsiMetricCards(pagespeed);
  const narrative = buildNarrative(audit);
  const score = audit.overall_score ?? 0;
  const scorePct = Math.max(0, Math.min(100, score));

  return (
    <article>
      {/* 01 Skóre */}
      <section
        id="prehled"
        className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5rem)]"
      >
        <div className="mx-auto grid max-w-[1360px] items-start gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-2">
          <Reveal className="flex flex-col gap-5">
            <div>
              <p className="eyebrow mb-2.5">Výsledek auditu</p>
              <p className="text-[16px] text-ink-soft">
                {audit.salon_name}
                {audit.city ? ` · ${audit.city}` : ""}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-5">
              <div
                className="relative aspect-square w-[clamp(170px,18vw,220px)] shrink-0"
                aria-label={`HAIRWEB SCORE ${score} z 100`}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(oklch(0.74 0.15 70) 0 ${scorePct}%, #e3e1db ${scorePct}% 100%)`,
                  }}
                />
                <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-mist">
                  <span className="text-[clamp(3.75rem,6.5vw,5.25rem)] font-semibold leading-none tracking-[-0.06em] text-ink">
                    {audit.overall_score ?? "—"}
                  </span>
                  <span className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-xs text-ink-muted">
                    / 100
                  </span>
                </div>
              </div>

              <div className="flex min-w-[200px] flex-col gap-2.5">
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
                  HAIRWEB SCORE
                </p>
                <a
                  href="#dobre"
                  className="flex items-center gap-3 rounded-[14px] bg-[oklch(0.94_0.05_150)] px-4 py-3 no-underline"
                >
                  <span className="flex size-[30px] items-center justify-center rounded-full bg-[oklch(0.6_0.15_150)] text-[15px] font-semibold text-white">
                    ✓
                  </span>
                  <span className="text-[26px] font-semibold tracking-tight text-ink">
                    {okCount}
                  </span>
                  <span className="text-[15px] text-[#2f4a38]">v pořádku</span>
                </a>
                <a
                  href="#zlepsit"
                  className="flex items-center gap-3 rounded-[14px] bg-[oklch(0.94_0.04_25)] px-4 py-3 no-underline"
                >
                  <span className="flex size-[30px] items-center justify-center rounded-full bg-[oklch(0.57_0.2_27)] text-[17px] font-semibold text-white">
                    !
                  </span>
                  <span className="text-[26px] font-semibold tracking-tight text-ink">
                    {fixCount}
                  </span>
                  <span className="text-[15px] text-[#5a2a24]">
                    k řešení
                    {highRecs.length > 0
                      ? ` · ${highRecs.length} vysoká priorita`
                      : ""}
                  </span>
                </a>
              </div>
            </div>

            <p className="max-w-[520px] text-[clamp(1.125rem,1.5vw,1.3rem)] leading-relaxed text-[#3d3b37]">
              {audit.scores?.headline || audit.summary}
            </p>
          </Reveal>

          <Reveal delay={1} className="flex flex-col gap-5 rounded-[28px] bg-foam p-[clamp(1.5rem,3vw,2.5rem)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.12em] text-copper">
                OBLASTI
              </p>
              <div className="flex flex-wrap gap-3.5 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[oklch(0.6_0.15_150)]" />
                  v pořádku
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[oklch(0.74_0.15_70)]" />
                  zlepšit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[oklch(0.57_0.2_27)]" />
                  chybí
                </span>
              </div>
            </div>
            <div>
              {categories.map((c) => {
                const tone = areaTone(c.score);
                const width = Math.max(c.score ?? 0, 2);
                return (
                  <div
                    key={c.category}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-ink/7 py-3.5 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center gap-2.5 text-[16px] text-ink">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: tone.bar }}
                      />
                      {c.label || AUDIT_CATEGORY_LABELS[c.category]}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="rounded-full px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.08em]"
                        style={{ background: tone.tint, color: tone.ink }}
                      >
                        {tone.label}
                      </span>
                      <span className="min-w-[64px] text-right text-[15px] font-semibold tabular-nums">
                        {c.score != null ? `${c.score} / 100` : "—"}
                      </span>
                    </div>
                    <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-[#eceae4]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${width}%`,
                          background: tone.bar,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 Na první pohled */}
      {(okCount > 0 || fixCount > 0) && (
        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,6.5rem)]">
          <div className="mx-auto grid max-w-[1360px] gap-3 lg:grid-cols-2">
            <Reveal className="flex flex-col gap-4 rounded-[28px] bg-[oklch(0.94_0.05_150)] p-[clamp(1.5rem,3vw,2.25rem)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.6_0.15_150)] font-semibold text-white">
                    ✓
                  </span>
                  <span className="text-2xl font-semibold tracking-tight text-ink">
                    Co je v pořádku
                  </span>
                </div>
                <span className="text-[28px] font-semibold tracking-tight text-[oklch(0.45_0.12_150)]">
                  {okCount}
                </span>
              </div>
              <div>
                {strengths.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-t border-[oklch(0.85_0.06_150)] py-3 text-[16px] first:border-t-0 first:pt-0"
                  >
                    <span className="flex items-center gap-2.5 text-ink">
                      <span className="font-semibold text-[oklch(0.5_0.14_150)]">
                        ✓
                      </span>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal
              delay={1}
              className="flex flex-col gap-4 rounded-[28px] bg-[oklch(0.94_0.04_25)] p-[clamp(1.5rem,3vw,2.25rem)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.57_0.2_27)] text-lg font-semibold text-white">
                    !
                  </span>
                  <span className="text-2xl font-semibold tracking-tight text-ink">
                    Co je potřeba řešit
                  </span>
                </div>
                <span className="text-[28px] font-semibold tracking-tight text-[oklch(0.5_0.18_27)]">
                  {fixCount}
                </span>
              </div>
              <div>
                {recommendations.map((rec) => {
                  const isHigh = rec.priority === "high";
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between gap-4 border-t border-[oklch(0.86_0.05_25)] py-3 text-[16px] first:border-t-0 first:pt-0"
                    >
                      <span className="flex items-center gap-2.5 text-ink">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            background: isHigh
                              ? "oklch(0.57 0.2 27)"
                              : "oklch(0.74 0.15 70)",
                          }}
                        />
                        {rec.title}
                      </span>
                      <span
                        className="shrink-0 font-[family-name:var(--font-geist-mono)] text-xs whitespace-nowrap"
                        style={{
                          color: isHigh
                            ? "oklch(0.45 0.15 27)"
                            : "oklch(0.45 0.1 65)",
                        }}
                      >
                        {isHigh ? "VYSOKÁ" : "STŘEDNÍ"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 03 Shrnutí */}
      {narrative ? (
        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.5rem)]">
          <Reveal>
            <p className="mx-auto max-w-[1100px] text-[clamp(1.6rem,3.2vw,2.85rem)] font-medium leading-[1.18] tracking-[-0.035em] text-pretty">
              {narrative.good ? (
                <span className="text-[oklch(0.5_0.14_150)]">
                  {narrative.good}{" "}
                </span>
              ) : null}
              {narrative.bad ? (
                <span className="text-[oklch(0.52_0.19_27)]">
                  {narrative.bad}{" "}
                </span>
              ) : null}
              {narrative.rest ? (
                <span className="text-ink-muted">{narrative.rest}</span>
              ) : null}
            </p>
          </Reveal>
        </section>
      ) : null}

      {/* 04 Tohle máte dobře + PageSpeed good metrics */}
      {strengths.length > 0 || psiGood.length > 0 || pagespeed?.error ? (
        <section
          id="dobre"
          className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.5rem)]"
        >
          <div className="mx-auto max-w-[1360px]">
            {strengths.length > 0 ? (
              <>
                <Reveal className="mb-[clamp(2rem,4vw,3.5rem)]">
                  <div className="mb-4 flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.12em] uppercase text-[oklch(0.5_0.14_150)]">
                    <span className="size-2 rounded-full bg-[oklch(0.6_0.15_150)]" />
                    Silné stránky
                  </div>
                  <h2 className="text-[clamp(2.5rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink">
                    Tohle máte dobře
                  </h2>
                </Reveal>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {strengths.map((item) => {
                    const metric = strengthMetric(item.checkId, checks);
                    return (
                      <Reveal
                        key={item.id}
                        className="flex min-h-[200px] flex-col gap-3 rounded-[22px] bg-foam p-[26px]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-[34px] items-center justify-center rounded-full bg-[oklch(0.94_0.05_150)] font-semibold text-[oklch(0.5_0.14_150)]">
                            ✓
                          </span>
                          {metric ? (
                            <span className="text-[30px] font-semibold tracking-tight text-[oklch(0.5_0.14_150)]">
                              {metric}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-auto text-[21px] font-semibold tracking-tight text-ink">
                          {item.title}
                        </h3>
                        <p className="text-[15px] leading-relaxed text-ink-soft">
                          {item.description}
                        </p>
                      </Reveal>
                    );
                  })}
                </div>
              </>
            ) : null}

            {psiGood.length > 0 ? (
              <>
                <div className="mt-7 mb-3.5 flex flex-wrap items-center gap-3">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
                    RYCHLOST WEBU · TELEFON
                  </span>
                  <span className="text-[13px] text-ink-muted">
                    Jak rychle a pohodlně se web chová na mobilu — to, co
                    zákazník opravdu pozná.
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {psiGood.map((m) => (
                    <Reveal
                      key={m.key}
                      className="flex flex-col gap-2 rounded-[20px] bg-[oklch(0.94_0.05_150)] p-[22px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-[oklch(0.4_0.1_150)]">
                          {m.key}
                        </span>
                        <span className="font-semibold text-[oklch(0.5_0.14_150)]">
                          ✓
                        </span>
                      </div>
                      <p className="text-[40px] font-semibold leading-none tracking-[-0.05em] text-ink">
                        {m.val}
                      </p>
                      <p className="text-sm leading-snug text-[#2f4a38]">
                        {m.desc}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </>
            ) : pagespeed?.error ? (
              <Reveal className="mt-8 rounded-[20px] border border-ink/8 bg-foam p-6">
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
                  RYCHLOST WEBU · TELEFON
                </p>
                <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                  {pagespeed.error}
                </p>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 05 Co bychom zlepšili */}
      <section
        id="zlepsit"
        className="bg-foam px-[clamp(1.25rem,4vw,3rem)] py-[clamp(5rem,10vw,8.5rem)]"
      >
        <div className="mx-auto max-w-[1360px]">
          <Reveal className="mb-[clamp(2.5rem,5vw,4rem)]">
            <div className="mb-4 flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.12em] uppercase text-[oklch(0.52_0.19_27)]">
              <span className="size-2 rounded-full bg-[oklch(0.57_0.2_27)]" />
              Doporučení
            </div>
            <h2 className="text-[clamp(2.5rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink">
              Co bychom zlepšili
            </h2>
            {recommendations.length > 0 ? (
              <p className="mt-5 max-w-[640px] text-[18px] leading-relaxed text-ink-soft">
                U každého bodu platí: můžete si to doplnit nebo opravit sami —
                anebo to zařídíme my.
              </p>
            ) : null}
          </Reveal>

          {recommendations.length === 0 ? (
            <Reveal className="rounded-[28px] bg-mist p-8">
              <p className="text-lg text-ink">
                V ověřených oblastech jsme nenašli zásadní mezery.
              </p>
            </Reveal>
          ) : (
            <>
              {highRecs.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center gap-3.5">
                    <span className="rounded-full bg-[oklch(0.57_0.2_27)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-white">
                      VYSOKÁ PRIORITA
                    </span>
                    <span className="h-px flex-1 bg-ink/10" />
                    <span className="text-sm text-ink-muted">
                      {highRecs.length}{" "}
                      {highRecs.length === 1 ? "položka" : "položky"}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {highRecs.map((rec) => {
                      const badge = metricBadgeForRec(rec, checks);
                      return (
                        <Reveal
                          key={rec.id}
                          className="flex flex-col gap-3.5 rounded-[24px] border-t-4 border-[oklch(0.57_0.2_27)] bg-mist p-[clamp(1.35rem,2.5vw,2rem)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-[24px] font-semibold leading-snug tracking-tight text-ink">
                              {rec.title}
                            </h3>
                            {badge ? (
                              <div className="shrink-0 rounded-xl bg-[oklch(0.94_0.04_25)] px-3 py-2 text-right">
                                <p className="text-2xl font-semibold leading-none tracking-tight text-[oklch(0.5_0.18_27)]">
                                  {badge.metric}
                                </p>
                                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em] text-[oklch(0.45_0.12_27)]">
                                  {badge.label}
                                </p>
                              </div>
                            ) : null}
                          </div>
                          <p className="text-[16px] leading-relaxed text-[#3d3b37]">
                            {rec.description}
                          </p>
                          <div className="mt-auto flex gap-3 rounded-[14px] bg-foam px-4 py-3.5">
                            <span className="font-semibold text-copper">→</span>
                            <div>
                              <p className="text-[13px] font-semibold text-ink">
                                Co doporučujeme
                              </p>
                              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
                                {rec.recommendation}
                              </p>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                  <PrioritySectionCta
                    audit={audit}
                    count={highRecs.length}
                    location="result_priority_high"
                    className={midRecs.length > 0 ? "mb-12" : undefined}
                  />
                </>
              ) : null}

              {midRecs.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center gap-3.5">
                    <span className="rounded-full bg-[oklch(0.8_0.14_75)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-[#3a2a08]">
                      STŘEDNÍ PRIORITA
                    </span>
                    <span className="h-px flex-1 bg-ink/10" />
                    <span className="text-sm text-ink-muted">
                      {midRecs.length} položek
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {midRecs.map((rec) => {
                      const badge = metricBadgeForRec(rec, checks);
                      return (
                        <Reveal
                          key={rec.id}
                          className="flex flex-col gap-3 rounded-[24px] border-t-4 border-[oklch(0.8_0.14_75)] bg-mist p-[clamp(1.35rem,2.5vw,1.75rem)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-[21px] font-semibold leading-snug tracking-tight text-ink">
                              {rec.title}
                            </h3>
                            {badge ? (
                              <div className="shrink-0 rounded-xl bg-[oklch(0.95_0.05_80)] px-3 py-2 text-right">
                                <p className="text-[22px] font-semibold leading-none tracking-tight text-[oklch(0.5_0.12_65)]">
                                  {badge.metric}
                                </p>
                                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em] text-[oklch(0.45_0.1_65)]">
                                  {badge.label}
                                </p>
                              </div>
                            ) : null}
                          </div>
                          <p className="text-[15px] leading-relaxed text-[#3d3b37]">
                            {rec.description}
                          </p>
                          <div className="mt-auto flex flex-col gap-2 border-t border-ink/8 pt-3">
                            <div className="flex gap-2.5">
                              <span className="font-semibold text-copper">→</span>
                              <p className="text-sm leading-relaxed text-ink-soft">
                                {rec.recommendation}
                              </p>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                  <PrioritySectionCta
                    audit={audit}
                    count={midRecs.length}
                    location="result_priority_mid"
                  />
                </>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* 06 Quick wins */}
      {(audit.quick_wins || []).length > 0 ? (
        <section
          id="hned"
          className="bg-ink px-[clamp(1.25rem,4vw,3rem)] py-[clamp(5rem,10vw,8.5rem)] text-foam"
        >
          <div className="mx-auto max-w-[1360px]">
            <Reveal className="mb-[clamp(2.5rem,5vw,4.5rem)]">
              <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.12em] text-copper-soft uppercase">
                Quick wins
              </p>
              <h2 className="text-[clamp(2.5rem,5.8vw,5.5rem)] font-semibold leading-[0.93] tracking-[-0.055em]">
                3 věci, které můžete zlepšit hned
              </h2>
              <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-foam/65">
                Zvládnete to sami — nebo to zařídíme my.
              </p>
            </Reveal>
            <div className="grid gap-3 md:grid-cols-3">
              {(audit.quick_wins || []).map((win) => (
                <Reveal
                  key={win.checkId}
                  className="flex min-h-[260px] flex-col gap-3.5 rounded-[24px] border border-[#2c2b28] bg-[#1b1b19] p-[30px]"
                >
                  <span className="text-[56px] font-semibold leading-none tracking-[-0.06em] text-copper-soft">
                    {String(win.rank).padStart(2, "0")}
                  </span>
                  <p className="mt-auto text-[23px] font-semibold tracking-tight">
                    {win.title}
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#bdbab3]">
                    {win.recommendation}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 07 CTA */}
      <section
        id="konzultace"
        className="px-[clamp(1.25rem,4vw,3rem)] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(4rem,8vw,6.5rem)]"
      >
        <Reveal className="mx-auto flex max-w-[1360px] flex-wrap items-end justify-between gap-8 rounded-[36px] bg-copper px-[clamp(1.5rem,5vw,5rem)] py-[clamp(2.5rem,7vw,6.25rem)] text-white">
          <div className="max-w-[760px]">
            <h2 className="text-[clamp(2.5rem,5.8vw,5.5rem)] font-semibold leading-[0.93] tracking-[-0.055em]">
              Chcete výsledek projít spolu?
            </h2>
            <p className="mt-5 text-[19px] leading-relaxed">
              Ozvěte se — řekneme vám, co má smysl řešit jako první a co klidně
              nechat být.
            </p>
          </div>
          <AuditDiscussCta audit={audit} />
        </Reveal>
      </section>

      {/* 08 Služby */}
      {(audit.relevant_services || []).length > 0 ? (
        <section
          id="sluzby"
          className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.5rem)]"
        >
          <div className="mx-auto max-w-[1360px]">
            <Reveal className="mb-[clamp(2rem,4vw,3.5rem)]">
              <p className="eyebrow mb-4">Jak pomůžeme</p>
              <h2 className="text-[clamp(2.5rem,5.2vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink">
                Relevantní služby
              </h2>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(audit.relevant_services || []).map((svc) => (
                <Reveal key={svc.slug}>
                  <Link
                    href={`/sluzby/${svc.slug}`}
                    className="flex min-h-[190px] flex-col gap-2.5 rounded-[22px] bg-foam p-[26px] transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1"
                  >
                    <h3 className="text-[22px] font-semibold tracking-tight text-ink">
                      {svc.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-ink-soft">
                      {svc.blurb}
                    </p>
                    <span className="mt-auto text-sm font-medium text-copper">
                      Více o službě →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

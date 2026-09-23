"use client";

import type { AuditPagespeedSnapshot } from "@/lib/audit/types";

function formatLoadTime(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function formatCls(cls: number | null): string {
  if (cls == null) return "—";
  return cls.toFixed(2);
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{hint}</p>
    </div>
  );
}

/** Fallback block — prefer AuditResultView’s plain-language metrics. */
export function AuditPagespeedBlock({
  pagespeed,
}: {
  pagespeed: AuditPagespeedSnapshot | null | undefined;
}) {
  if (!pagespeed) return null;

  const hasScores =
    pagespeed.performance != null ||
    pagespeed.seo != null ||
    pagespeed.accessibility != null ||
    pagespeed.bestPractices != null;

  return (
    <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,6vw,5rem)]">
      <div className="mx-auto max-w-[1360px] rounded-[28px] border border-ink/8 bg-foam p-[clamp(1.5rem,3vw,2.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Rychlost webu</p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
              Jak se web chová na telefonu
            </h2>
            <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-ink-soft">
              Měříme, jak rychle se web načte a jestli jde pohodlně používat z
              mobilu — tam přichází většina nových zákazníků.
            </p>
            {pagespeed.usedFallbackUrl && pagespeed.measuredUrl ? (
              <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-copper">
                Uvedená adresa na profilu nefunguje. Měřili jsme funkční
                variantu: {pagespeed.measuredUrl}
              </p>
            ) : null}
          </div>
        </div>

        {hasScores ? (
          <div className="mt-10 grid gap-6 border-t border-ink/8 pt-8 sm:grid-cols-3">
            <Metric
              label="Načtení obsahu"
              value={formatLoadTime(pagespeed.lcpMs)}
              hint="Jak rychle se ukáže to hlavní na stránce"
            />
            <Metric
              label="Stabilita"
              value={formatCls(pagespeed.cls)}
              hint="Jestli obsah při načítání neposkakuje"
            />
            <Metric
              label="Odezva"
              value={formatLoadTime(pagespeed.tbtMs)}
              hint="Jak rychle web reaguje na klepnutí"
            />
          </div>
        ) : (
          <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
            {pagespeed.error ||
              "Rychlost webu se nepodařilo změřit. Spusťte audit znovu."}
          </p>
        )}
      </div>
    </section>
  );
}

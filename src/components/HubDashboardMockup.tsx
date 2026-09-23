/**
 * Presentational HAIRWEB Hub UI — demo data only.
 */

type HubDashboardMockupProps = {
  variant?: "hero" | "full" | "mobile";
  className?: string;
};

export function HubDashboardMockup({
  variant = "full",
  className = "",
}: HubDashboardMockupProps) {
  if (variant === "mobile") {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-white/10 bg-[#1b1b19] text-foam shadow-[0_28px_60px_-24px_rgba(0,0,0,0.55)] ${className}`}
        aria-hidden
      >
        <div className="flex justify-center py-2.5">
          <span className="h-1.5 w-14 rounded-full bg-foam/20" />
        </div>
        <div className="px-3.5 pb-4 pt-1">
          <p className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted">
            HAIRWEB Hub · demo
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Salon Bella</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="Rezervace" value="142" />
            <Metric label="Google" value="4,8 ★" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        className={`flex flex-col gap-3 rounded-md border border-ink/[0.06] bg-foam p-3.5 shadow-[0_24px_48px_-20px_rgba(17,17,16,0.32)] sm:gap-3.5 sm:p-4 ${className}`}
        aria-hidden
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em] text-ink-muted">
              HAIRWEB HUB · UKÁZKA
            </p>
            <p className="mt-1 text-[16px] font-semibold tracking-tight sm:text-[17px]">
              Salon Bella
            </p>
          </div>
          <span className="shrink-0 rounded-sm bg-mist px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em] text-ink-soft">
            DEMO
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <HeroMetric label="Rezervace" detail="tento měsíc" value="142" />
          <HeroMetric label="Google" detail="hodnocení" value="4,8 ★" />
          <HeroMetric label="Návštěvy" detail="vs. min. měsíc" value="+34 %" accent />
        </div>

        <div className="rounded-sm bg-ink px-3 py-3 text-[12px] leading-snug text-foam sm:text-[13px]">
          <p className="mb-1 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.12em] text-copper-soft sm:text-[10px]">
            DOPORUČENÍ
          </p>
          Příští týden máte méně rezervací než obvykle. Máme pro vás 3
          doporučení.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#2c2b28] bg-[#1b1b19] text-foam shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ${className}`}
      aria-hidden
    >
      <div className="flex items-center gap-3 border-b border-[#2c2b28] px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-sm bg-[#3a3935]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[#3a3935]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[#3a3935]" />
        </span>
        <div className="ml-1 flex-1 truncate rounded-md bg-[#242421] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-ink-muted">
          hub.hairweb.cz
        </div>
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.1em] text-ink-muted">
          UKÁZKA UI
        </span>
      </div>

      <div className="grid lg:grid-cols-[150px_1fr]">
        <aside className="hidden border-r border-[#2c2b28] p-3 lg:block">
          <p className="px-2.5 pb-3.5 text-[13px] text-foam">
            <span className="font-light">HAIR</span>
            <span className="font-extrabold">WEB</span>
          </p>
          <nav className="space-y-0.5 text-[13px] text-ink-muted">
            {[
              "Přehled",
              "Rezervace",
              "Zákazníci",
              "Google",
              "Recenze",
              "Sociální sítě",
              "Statistiky",
              "Doporučení",
            ].map((item, i) => (
              <div
                key={item}
                className={`rounded-md px-2.5 py-2 ${
                  i === 0 ? "bg-[#2c2b28] text-foam" : ""
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-3.5 p-4 sm:gap-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em] text-ink-muted">
                PŘEHLED · SALON BELLA
              </p>
              <p className="mt-1.5 text-[20px] font-semibold tracking-tight sm:text-[22px]">
                Online stav salonu
              </p>
            </div>
            <span className="rounded-md border border-[#3a3935] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.1em] text-[#bdbab3]">
              DEMO DATA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FullMetric label="Rezervace" value="142" hint="tento měsíc" />
            <FullMetric label="Google" value="4,8" hint="★ hodnocení" />
            <FullMetric
              label="Návštěvnost"
              value="+34 %"
              hint="vs. min. měsíc"
              accent
            />
            <FullMetric label="Recenze" value="12" hint="nové / 30 dní" />
          </div>

          <div className="grid gap-2 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-2.5 rounded-md bg-[#242421] p-3.5 text-[13px] text-[#d8d5ce]">
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em] text-ink-muted">
                AKTIVITA
              </p>
              {[
                "Nová rezervace — střih + barva",
                "Nová Google recenze — 5★",
                "Instagram příspěvek publikován",
                "Doporučení od HAIRWEB",
              ].map((row) => (
                <div key={row} className="flex gap-2">
                  <span className="text-copper-soft">●</span>
                  {row}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 rounded-md bg-copper p-3.5 text-white">
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em]">
                DOPORUČENÍ
              </p>
              <p className="text-[16px] font-medium leading-snug tracking-tight sm:text-[17px]">
                Příští týden máte méně rezervací než obvykle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  detail,
  value,
  accent = false,
}: {
  label: string;
  detail: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-sm bg-mist px-2 py-2 sm:px-2.5 sm:py-2.5">
      <p className="text-[9px] leading-tight text-ink-muted sm:text-[10px]">
        <span className="sm:hidden">{label}</span>
        <span className="hidden sm:inline">
          {label}
          <br />
          {detail}
        </span>
      </p>
      <p
        className={`mt-1 text-lg font-semibold tracking-tight sm:mt-1.5 sm:text-2xl ${
          accent ? "text-copper" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2.5">
      <p className="font-[family-name:var(--font-geist-mono)] text-[0.55rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function FullMetric({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md bg-[#242421] p-3">
      <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-[22px] font-semibold tracking-tight sm:text-[26px] ${
          accent ? "text-copper-soft" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}

import { Reveal } from "@/components/Reveal";

const insights = [
  "Příští týden máte méně rezervací než obvykle.",
  "Na 4 nové Google recenze zatím nikdo neodpověděl.",
  "18 pravidelných klientů se nevrátilo v obvyklém intervalu.",
] as const;

export function ForesightSection() {
  return (
    <section className="bg-copper section-pad text-white">
      <div className="mx-auto max-w-[1360px]">
        <Reveal className="mb-[clamp(2.5rem,5vw,4.5rem)] grid items-end gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.12em]">
              Proaktivní péče
            </p>
            <h2 className="text-[clamp(2.75rem,6vw,5.75rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
              HAIRWEB aktivně hledá, co zlepšit.
            </h2>
          </div>
          <p className="max-w-[500px] text-[19px] leading-relaxed text-white/90">
            Postupně chceme stále větší část online správy automatizovat.
            HAIRWEB nebude jen zobrazovat data — bude upozorňovat na
            příležitosti a pomáhat je řešit.
          </p>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-3">
          {insights.map((text, index) => (
            <Reveal
              key={text}
              delay={(index % 3) as 0 | 1 | 2}
              className="card-lift flex min-h-[240px] flex-col justify-between gap-8 rounded-3xl bg-ink p-8 hover:-rotate-1"
            >
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-copper-soft">
                INSIGHT
              </p>
              <p className="text-[26px] font-medium leading-snug tracking-tight">
                „{text}“
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

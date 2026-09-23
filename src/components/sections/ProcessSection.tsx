import { Reveal } from "@/components/Reveal";

const steps = [
  {
    n: "01",
    title: "Audit",
    text: "Zjistíme současný stav online světa salonu.",
  },
  {
    n: "02",
    title: "Plán",
    text: "Určíme, co ponechat, upravit, vytvořit a propojit.",
  },
  {
    n: "03",
    title: "Realizace",
    text: "Dáme online prostředí do pořádku — jen to potřebné.",
  },
  {
    n: "04",
    title: "Propojení",
    text: "Spojíme důležité části do jednoho přehledu.",
  },
  {
    n: "05",
    title: "Správa",
    text: "Pravidelně se staráme o online fungování salonu.",
  },
  {
    n: "06",
    title: "Růst",
    text: "Hledáme příležitosti pro rezervace a zákazníky.",
  },
] as const;

export function ProcessSection() {
  return (
    <section id="jak-to-funguje" className="scroll-mt-24 section-pad">
      <div className="mx-auto max-w-[1360px]">
        <Reveal className="mb-[clamp(3rem,6vw,5rem)] flex flex-wrap items-end justify-between gap-8">
          <h2 className="display-title text-[clamp(3rem,7vw,6.875rem)]">
            Jak to funguje?
          </h2>
          <p className="eyebrow">Jednoduchý proces. Jasný výsledek.</p>
        </Reveal>

        <ol className="grid border-t border-ink/14 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((step, index) => (
            <Reveal
              key={step.n}
              as="li"
              delay={(index % 3) as 0 | 1 | 2}
              className={`flex flex-col gap-3.5 py-7 ${
                index === 0
                  ? "pr-6 lg:pr-6"
                  : index === steps.length - 1
                    ? "pl-0 lg:pl-6"
                    : "lg:px-6"
              } ${index < steps.length - 1 ? "lg:border-r lg:border-ink/[0.08]" : ""} border-b border-ink/[0.08] lg:border-b-0`}
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-[13px] text-copper">
                {step.n}
              </span>
              <h3 className="mt-8 text-[26px] font-semibold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                {step.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

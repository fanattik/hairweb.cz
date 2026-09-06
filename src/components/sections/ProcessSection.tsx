import { Reveal } from "@/components/Reveal";

const steps = [
  {
    n: "01",
    title: "Řeknete mi něco o salonu",
    text: "Vyplníte krátký formulář a pošlete současný web, Instagram nebo jiné podklady.",
  },
  {
    n: "02",
    title: "Připravím směr nového webu",
    text: "Ukážu vám, jakým směrem by se mohl nový web ubírat.",
  },
  {
    n: "03",
    title: "Společně ho doladíme",
    text: "Doladíme obsah, fotografie, služby a vzhled.",
  },
  {
    n: "04",
    title: "Web spustím",
    text: "Postarám se o technickou část a nový web může začít pracovat pro váš salon.",
  },
] as const;

export function ProcessSection() {
  return (
    <section
      id="jak-to-funguje"
      className="scroll-mt-24 bg-foam px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Jak to funguje
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Nový web bez zbytečných komplikací.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-8 md:grid-cols-2">
          {steps.map((step, index) => (
            <Reveal key={step.n} as="li" delay={(index % 3) as 0 | 1 | 2}>
              <div className="border-t border-ink/15 pt-5">
                <span className="font-[family-name:var(--font-fraunces)] text-2xl text-copper">
                  {step.n}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

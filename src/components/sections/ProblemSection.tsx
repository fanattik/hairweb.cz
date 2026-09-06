import { Reveal } from "@/components/Reveal";

const needs = [
  "jaké služby nabízíte",
  "kolik stojí",
  "jak vaše práce vypadá",
  "kde vás najde",
  "kdy máte volno",
  "jak si rezervovat termín",
] as const;

const journey = [
  {
    id: "discover",
    label: "Google / Instagram",
    detail: "Klient vás najde",
    highlight: false,
  },
  {
    id: "web",
    label: "Váš web",
    detail: "Služby · Ceník · Galerie · Recenze",
    highlight: true,
  },
  {
    id: "trust",
    label: "Důvěra",
    detail: "Uvidí, že jste ti praví",
    highlight: false,
  },
  {
    id: "book",
    label: "Rezervace",
    detail: "Objedná si termín",
    highlight: "result" as const,
  },
] as const;

export function ProblemSection() {
  return (
    <section className="bg-foam px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Proč web
          </p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl lg:text-[2.65rem]">
            Skvělá práce si zaslouží skvělý web.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Instagram může ukázat vaši práci. Web ale pomáhá zákazníkovi udělat
            další krok — zjistit, jestli jste pro něj ti praví, a rovnou si
            rezervovat termín.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.2fr] lg:gap-14">
          <Reveal delay={1}>
            <p className="text-sm font-medium text-ink">
              Potenciální klient potřebuje rychle zjistit:
            </p>
            <ul className="mt-4 space-y-2.5">
              {needs.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-b border-line pb-2.5 text-sm text-ink-soft last:border-0"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 bg-copper" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={2}>
            <p className="text-sm font-medium text-ink">Cesta klienta</p>
            <ol className="mt-5 flex flex-col gap-0 lg:flex-row lg:items-stretch">
              {journey.map((step, index) => {
                const isResult = step.highlight === "result";
                const isWeb = step.highlight === true;

                return (
                  <li key={step.id} className="flex flex-1 flex-col lg:flex-row lg:items-stretch">
                    <div
                      className={`flex-1 border px-5 py-5 ${
                        isWeb
                          ? "border-copper bg-copper text-foam"
                          : isResult
                            ? "border-ink bg-ink text-foam"
                            : "border-line bg-mist/80 text-ink"
                      }`}
                    >
                      <span
                        className={`font-[family-name:var(--font-fraunces)] text-sm ${
                          isWeb || isResult ? "text-foam/70" : "text-copper"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug">
                        {step.label}
                      </p>
                      <p
                        className={`mt-2 text-sm leading-relaxed ${
                          isWeb || isResult ? "text-foam/75" : "text-ink-soft"
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>

                    {index < journey.length - 1 ? (
                      <div
                        className="flex items-center justify-center py-2 text-copper lg:px-1.5 lg:py-0"
                        aria-hidden
                      >
                        <span className="lg:hidden">↓</span>
                        <span className="hidden lg:inline">→</span>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              Web není o technologii. Je o tom, aby se z návštěvy stala rezervace.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

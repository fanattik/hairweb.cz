import { Reveal } from "@/components/Reveal";
import { SectionViewTracker } from "@/components/SectionViewTracker";

const flow = [
  { label: "Web", detail: "Klient přijde" },
  { label: "Služba", detail: "Ví, co chce" },
  { label: "Termín", detail: "Vybere si čas" },
  { label: "Rezervováno", detail: "Hotovo" },
] as const;

export function ReservationsSection() {
  return (
    <section
      id="rezervace"
      className="scroll-mt-24 bg-ink px-5 py-16 text-foam sm:px-8 sm:py-20 lg:py-24"
    >
      <SectionViewTracker event="reservation_section_view" threshold={0.4} />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Rezervace
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
            Z návštěvy webu rovnou do diáře.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foam/75 sm:text-lg">
            Klient nemusí volat ani hledat odkaz na Instagramu. Z webu se dostane
            přímo do vašeho stávajícího rezervačního systému.
          </p>
          <p className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-xl text-foam sm:text-2xl">
            Nemusíte měnit rezervační systém.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foam/65 sm:text-base">
            Hairweb se může napojit na systém, který už používáte. Klient se z
            vašeho webu dostane přímo k výběru termínu.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {flow.map((step, index) => (
            <Reveal key={step.label} as="li" delay={(index % 3) as 0 | 1 | 2}>
              <div
                className={`h-full border p-5 ${
                  index === flow.length - 1
                    ? "border-copper/50 bg-copper/15"
                    : "border-white/10"
                }`}
              >
                <span className="font-[family-name:var(--font-fraunces)] text-sm text-copper">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 font-[family-name:var(--font-fraunces)] text-xl">
                  {step.label}
                </p>
                <p className="mt-2 text-sm text-foam/65">{step.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-8 text-sm text-foam/50">
          Například Reservio · Fresha · Bookio · jiné systémy
        </Reveal>
      </div>
    </section>
  );
}

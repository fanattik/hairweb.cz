import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export function AboutSection() {
  return (
    <section
      id="o-hairweb"
      className="scroll-mt-24 bg-foam px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden bg-stone">
            {/* TODO: Replace with final portrait photo */}
            <Image
              src="/images/lukas.jpg"
              alt="Lukáš — zakladatel Hairweb.cz"
              fill
              className="object-cover object-[center_20%] transition duration-700 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 420px"
            />
          </div>
        </Reveal>

        <Reveal delay={1}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            O Hairweb
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Za Hairwebem stojím já.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            <p>
              Jsem Lukáš, webdesigner a developer. Hairweb jsem vytvořil jako
              specializovanou službu pro kadeřnictví a barbershopy.
            </p>
            <p>
              Místo univerzálních webů pro všechny se soustředím na jeden
              segment a na to, co u něj skutečně rozhoduje — kvalitní prezentaci
              práce, jednoduchou orientaci a co nejkratší cestu k rezervaci.
            </p>
            <p>
              Komunikujete přímo se mnou. Navrhuju, stavím i spouštím — bez
              předávání mezi týmy.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/Reveal";
import faqSchema from "@/lib/faq-schema.json";

const faqs = [
  {
    q: "Kolik web stojí?",
    a: "START od 9 900 Kč, PRO od 14 900 Kč — jednorázově. Finální cena závisí na rozsahu.",
  },
  {
    q: "Jak dlouho vytvoření webu trvá?",
    a: "U většiny projektů jednotky týdnů od schválení směru. Rychlost ovlivní podklady a zpětná vazba.",
  },
  {
    q: "Co když už web mám?",
    a: "To je běžné. Podívám se na současný stav a navrhnu, co dává smysl předělat.",
  },
  {
    q: "Musím měnit rezervační systém?",
    a: "Ne. Napojím nebo odkážu na systém, který už používáte — Reservio, Fresha, Bookio, Noona i jiné.",
  },
  {
    q: "Budu si moct upravovat ceník?",
    a: "Ano. Domluvíme jednoduchý způsob úprav služeb a cen bez čekání na vývojáře.",
  },
  {
    q: "Musím mít profesionální fotografie?",
    a: "Ideálně ano — vaše práce prodává nejsilněji. Pokud je zatím nemáte, domluvíme dočasné řešení.",
  },
  {
    q: "Co potřebuji dodat?",
    a: "Nejčastěji stačí web nebo Instagram, služby, otevírací doba, kontakt a fotografie.",
  },
  {
    q: "Co znamená nezávazný návrh?",
    a: "Podívám se na vaši prezentaci a navrhnu směr dalšího postupu. Bez závazku pokračovat.",
  },
  {
    q: "Pomůžete mi s doménou?",
    a: "Ano. Pomůžu s výběrem, nastavením i nasměrováním domény.",
  },
  {
    q: "Je web připravený pro Google?",
    a: "Ano. Dostanete solidní základ pro lokální SEO, rychlé načítání a přehlednou strukturu.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-line bg-mist px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            FAQ
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Časté otázky
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Krátké odpovědi na to, co majitele salonů zajímá nejčastěji.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div>
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-line"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-ink transition hover:text-copper [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] font-medium leading-snug sm:text-base">
                    {item.q}
                  </h3>
                  <span
                    className="shrink-0 text-xl leading-none text-copper transition duration-200 group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-ink-soft">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/Reveal";
import faqSchema from "@/lib/faq-schema.json";

const faqs = [
  {
    q: "Co je HAIRWEB, když to není jen tvorba webů?",
    a: "Jsme online partner pro salony. Nejdřív zjistíme současný stav, doporučíme jen to, co dává smysl, propojíme nástroje a dlouhodobě se o online prostředí staráme.",
  },
  {
    q: "Musím měnit web, který už mám?",
    a: "Ne. Pokud web funguje, klidně ho ponecháme. Nový web navrhujeme jen tehdy, když současný salonu skutečně brzdí.",
  },
  {
    q: "Musím měnit rezervační systém?",
    a: "Ne. Pokud vám vyhovuje, připojíme ho. Pokud systém chybí nebo nefunguje, pomůžeme s vhodným řešením.",
  },
  {
    q: "Co obsahuje online audit?",
    a: "Podíváme se na web, rezervace, Google, recenze, sociální sítě a další oblasti — a zároveň na to, s čím jste spokojení a co chcete zachovat.",
  },
  {
    q: "Co je HAIRWEB Hub?",
    a: "Centrální přehled online fungování salonu. Budujeme ho postupně jako součást dlouhodobé spolupráce.",
  },
  {
    q: "Budete se o salon starat i po nastavení?",
    a: "Ano. Nastavením to nekončí. Podle potřeby pravidelně kontrolujeme, spravujeme a zlepšujeme jednotlivé části.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.75rem)]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto grid max-w-[1360px] gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6">
          <p className="eyebrow">FAQ</p>
          <h2 className="display-title text-[clamp(2.75rem,6vw,5.75rem)]">
            Časté otázky
          </h2>
        </Reveal>

        <Reveal delay={1}>
          <div className="border-t border-ink/14">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-ink/14"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-[26px] text-left text-xl font-medium tracking-tight text-ink transition hover:pl-3 hover:text-copper [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foam text-xl font-normal transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="pb-6 pr-12 text-[15px] leading-relaxed text-ink-soft">
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

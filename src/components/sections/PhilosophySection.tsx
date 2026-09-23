import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

const decisions = [
  { name: "Váš současný web", action: "Ponecháme ✓", keep: true },
  { name: "Noona", action: "Připojíme ✓", keep: true },
  { name: "Google", action: "Upravíme", keep: false },
  { name: "Instagram", action: "Ponecháme ✓", keep: true },
  { name: "Recenze", action: "Doplníme", keep: false },
  { name: "Zákazníci", action: "Vytvoříme", keep: false },
] as const;

export function PhilosophySection() {
  return (
    <section
      id="filozofie"
      className="scroll-mt-24 bg-foam section-pad"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2.5rem,6vw,6rem)] lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
              <Image
                src="/design/philosophy-stylist.jpg"
                alt="Kadeřnice při styling klientky ve salonu"
                fill
                className="object-cover object-[center_35%]"
                sizes="(max-width: 1024px) 100vw, 640px"
                quality={80}
              />
            </div>
            <div className="absolute bottom-4 left-4 w-[min(300px,80%)] rounded-[18px] bg-foam/95 p-[18px_20px] text-sm shadow-sm backdrop-blur-[10px]">
              <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em] text-ink-muted">
                PO AUDITU
              </p>
              <ul className="flex flex-col gap-2.5">
                {decisions.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-ink">{item.name}</span>
                    <span
                      className={`shrink-0 text-xs ${
                        item.keep ? "text-copper" : "text-ink-muted"
                      }`}
                    >
                      {item.action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1} className="flex flex-col gap-7">
          <p className="eyebrow">Flexibilně a bez zbytečných změn</p>
          <h2 className="display-title text-[clamp(2.5rem,5.2vw,4.75rem)]">
            Nemusíte začínat od nuly.
          </h2>
          <p className="max-w-[520px] text-[19px] leading-relaxed text-[#3d3b37]">
            Máte skvělý web? Nechte si ho. Vyhovuje vám současný rezervační
            systém? Připojíme ho. Funguje vám Instagram? Nebudeme ho předělávat.
          </p>
          <p className="max-w-[520px] text-[19px] leading-relaxed text-[#3d3b37]">
            Nejdříve zjistíme, co už funguje. Změny doporučíme pouze tam, kde
            dávají smysl.
          </p>
          <div>
            <TrackedCta
              href="#audit"
              event="hero_cta_click"
              eventPayload={{ location: "philosophy" }}
              sourceDetail="philosophy"
            >
              Zjistit, co dává smysl pro můj salon{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

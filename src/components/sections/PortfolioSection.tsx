"use client";

import Image from "next/image";
import { BrowserMockup } from "@/components/BrowserMockup";
import { CtaButton } from "@/components/CtaButton";
import { Reveal } from "@/components/Reveal";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";

const concepts = [
  {
    id: "hair-studio",
    name: "Studio Nora",
    style: "Elegantní · minimalistický · premium",
    url: "studionora.cz",
    demoHref: "/demo/hair-studio",
    event: "demo_hair_click" as const,
    image: "/demos/hair-studio/hero.png",
    tone: "dark" as const,
    accent: "bg-ink text-foam",
  },
  {
    id: "barber",
    name: "Kamiya",
    style: "Tmavý · japonský · masculine",
    url: "kamiya.barber",
    demoHref: "/demo/barber",
    event: "demo_barber_click" as const,
    image: "/demos/barber/hero.png",
    tone: "dark" as const,
    accent: "bg-copper text-foam",
  },
  {
    id: "color-studio",
    name: "Color Studio",
    style: "Teplý · color · fashion",
    url: "color.studio",
    demoHref: "/demo/color-studio",
    event: "demo_color_click" as const,
    image: "/demos/color-studio/hero.jpeg",
    tone: "light" as const,
    accent: "bg-copper text-foam",
  },
] as const;

export function PortfolioSection() {
  return (
    <section id="ukazky" className="scroll-mt-24 bg-foam px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Ukázky
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Web, který odpovídá vašemu stylu.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Každý salon je jiný. Váš web by měl být také. Níže jsou ukázkové
            koncepty — ne klientské realizace. Klikněte a prohlédněte si funkční
            model.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {concepts.map((concept, index) => (
            <Reveal key={concept.id} delay={(index % 3) as 0 | 1 | 2}>
              <article className="group">
                <a
                  href={concept.demoHref}
                  className="block"
                  onClick={() => trackEvent(concept.event)}
                  aria-label={`Prohlédnout ukázku ${concept.name}`}
                >
                  <BrowserMockup
                    url={concept.url}
                    tone={concept.tone}
                    aspectClass="aspect-[16/11]"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={concept.image}
                        alt={`Ukázkový koncept ${concept.name}`}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div
                        className={`absolute inset-0 ${
                          concept.tone === "dark"
                            ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                            : "bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
                        }`}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-foam sm:p-5">
                        <p className="font-[family-name:var(--font-fraunces)] text-xl sm:text-2xl">
                          {concept.name}
                        </p>
                        <span
                          className={`mt-3 inline-flex px-2.5 py-1 text-[10px] font-medium ${concept.accent}`}
                        >
                          Rezervovat
                        </span>
                      </div>
                    </div>
                  </BrowserMockup>
                </a>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-[family-name:var(--font-fraunces)] text-lg text-ink">
                      {concept.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">{concept.style}</p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-copper/80">
                      Ukázkový koncept
                    </p>
                  </div>
                </div>
                <a
                  href={concept.demoHref}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition hover:text-copper"
                  onClick={() => trackEvent(concept.event)}
                >
                  Prohlédnout ukázku
                  <span className="cta-arrow" aria-hidden>
                    →
                  </span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <CtaButton
            href="#poptavka"
            variant="secondary"
            onClick={() => {
              setSourceDetail("portfolio");
              trackEvent("hero_cta_click", { location: "portfolio" });
            }}
          >
            Chci nezávazný návrh
          </CtaButton>
        </Reveal>
      </div>
    </section>
  );
}

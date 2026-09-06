"use client";

import Image from "next/image";
import { BrowserMockup, PhoneMockup } from "@/components/BrowserMockup";
import { CtaButton } from "@/components/CtaButton";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";

const trustItems = [
  "Nezávazný návrh",
  "Online rezervace",
  "SEO",
  "Web na míru",
] as const;

const COLOR_STUDIO = {
  url: "color.studio",
  desktop: "/hero/color-studio-desktop.png",
  mobile: "/hero/color-studio-mobile.png",
} as const;

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-x-clip border-b border-line bg-[linear-gradient(165deg,#f7f7f5_0%,#eceeea_55%,#e5e8e4_100%)]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(154,91,60,0.1),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-24 pt-16 sm:gap-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:pb-32 lg:pt-24 xl:gap-4">
        <div className="relative z-10">
          <p className="animate-fade-rise text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Weby pro kadeřnictví &amp; barbershopy
          </p>
          <h1 className="animate-fade-rise-delay-1 mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-[2.25rem] leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]">
            Web, který promění návštěvníky v rezervace.
          </h1>
          <p className="animate-fade-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Moderní webové stránky vytvořené speciálně pro kadeřnictví, hair
            salony a barbershopy. Prezentujte svou práci profesionálně a
            usnadněte klientům cestu k rezervaci.
          </p>

          <div className="animate-fade-rise-delay-3 mt-7 flex flex-wrap gap-3">
            <CtaButton
              href="#poptavka"
              onClick={() => {
                setSourceDetail("hero");
                trackEvent("hero_cta_click", { location: "hero_primary" });
              }}
            >
              Chci nezávazný návrh
            </CtaButton>
            <CtaButton
              href="#ukazky"
              variant="secondary"
              onClick={() => trackEvent("portfolio_click", { location: "hero" })}
            >
              Prohlédnout ukázky
            </CtaButton>
          </div>

          <ul className="animate-fade-rise-delay-3 mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-copper" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-mockup-enter relative mx-auto w-full max-w-[22rem] pb-14 sm:max-w-md lg:max-w-none lg:origin-left lg:scale-[1.12] lg:pb-10 xl:scale-[1.22] xl:translate-x-4">
          <BrowserMockup
            url={COLOR_STUDIO.url}
            className="relative z-10"
            aspectClass="aspect-[1024/728]"
          >
            <Image
              src={COLOR_STUDIO.desktop}
              alt="Ukázkový koncept Color Studio — desktop"
              fill
              priority
              className="animate-soft-zoom object-cover object-top"
              sizes="(max-width: 1024px) 90vw, 620px"
            />
          </BrowserMockup>

          <div className="absolute -bottom-2 right-2 z-20 w-[42%] max-w-[170px] sm:-bottom-4 sm:right-0 sm:w-[38%] lg:-bottom-6 lg:-right-2 xl:max-w-[190px]">
            <PhoneMockup className="ring-1 ring-black/5">
              <Image
                src={COLOR_STUDIO.mobile}
                alt="Ukázkový koncept Color Studio — mobil"
                fill
                priority
                className="object-cover object-top"
                sizes="190px"
              />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

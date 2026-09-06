import Image from "next/image";
import { BrowserMockup, PhoneMockup } from "@/components/BrowserMockup";
import { TrackedCta } from "@/components/TrackedCta";

const trustItems = [
  "Nezávazný návrh",
  "Online rezervace",
  "SEO",
  "Web na míru",
] as const;

const COLOR_STUDIO = {
  url: "color.studio",
  desktop: "/hero/color-studio-desktop.webp",
  mobile: "/hero/color-studio-mobile.webp",
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Weby pro kadeřnictví &amp; barbershopy
          </p>
          <h1 className="mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-[2.25rem] leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]">
            Web, který promění návštěvníky v rezervace.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Moderní webové stránky vytvořené speciálně pro kadeřnictví, hair
            salony a barbershopy. Prezentujte svou práci profesionálně a
            usnadněte klientům cestu k rezervaci.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <TrackedCta
              href="#poptavka"
              event="hero_cta_click"
              eventPayload={{ location: "hero_primary" }}
              sourceDetail="hero"
            >
              Chci nezávazný návrh
            </TrackedCta>
            <TrackedCta
              href="#ukazky"
              variant="secondary"
              event="portfolio_click"
              eventPayload={{ location: "hero" }}
            >
              Prohlédnout ukázky
            </TrackedCta>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
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

        <div className="relative mx-auto w-full max-w-[22rem] pb-14 sm:max-w-md lg:max-w-none lg:origin-left lg:scale-[1.12] lg:pb-10 xl:scale-[1.22] xl:translate-x-4">
          <BrowserMockup
            url={COLOR_STUDIO.url}
            className="relative z-10"
            aspectClass="aspect-[1024/728]"
          >
            {/* Static WebP + preload in layout — skips /_next/image on LCP */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COLOR_STUDIO.desktop}
              alt="Ukázkový koncept Color Studio — desktop"
              width={1024}
              height={728}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </BrowserMockup>

          <div className="absolute -bottom-2 right-2 z-20 w-[42%] max-w-[170px] sm:-bottom-4 sm:right-0 sm:w-[38%] lg:-bottom-6 lg:-right-2 xl:max-w-[190px]">
            <PhoneMockup className="ring-1 ring-black/5">
              <Image
                src={COLOR_STUDIO.mobile}
                alt="Ukázkový koncept Color Studio — mobil"
                fill
                loading="lazy"
                className="object-cover object-top"
                sizes="140px"
                quality={60}
              />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

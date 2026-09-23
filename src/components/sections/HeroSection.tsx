import Image from "next/image";
import { HubDashboardMockup } from "@/components/HubDashboardMockup";
import { TrackedCta } from "@/components/TrackedCta";

const benefits = [
  "Nezávazně",
  "Individuální doporučení",
  "Žádné zbytečnosti",
] as const;

export function HeroSection() {
  return (
    <section
      id="top"
      className="overflow-x-clip px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7.5rem)] pt-[clamp(3rem,8vw,6.875rem)]"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="animate-fade-rise mb-8 flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.12em] text-ink-soft">
          <span className="h-2 w-2 rounded-full bg-copper" aria-hidden />
          Online partner pro salony
        </div>

        <h1 className="animate-fade-rise-delay-1 max-w-[18ch] text-[clamp(3.25rem,9.4vw,9.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-ink">
          Váš salon.
          <br />
          <span className="text-ink-faint">Online pod</span> kontrolou.
        </h1>

        <div className="mt-[clamp(3rem,6vw,5rem)] grid items-end gap-[clamp(2.5rem,5vw,5rem)] lg:grid-cols-2">
          <div className="animate-fade-rise-delay-2 flex max-w-[520px] flex-col gap-8">
            <p className="text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-relaxed text-[#3d3b37] text-pretty">
              Propojíme vše, co je důležité. Zjistíme, co vám funguje, doplníme,
              co chybí, a dlouhodobě se staráme o váš online svět, aby k vám
              přicházelo více zákazníků.
            </p>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
              <TrackedCta
                href="/audit"
                variant="accent"
                className="w-full sm:w-auto"
                event="hero_cta_click"
                eventPayload={{ location: "hero_primary" }}
                sourceDetail="hero"
              >
                Zjistit, jak si vede můj salon{" "}
                <span className="cta-arrow" aria-hidden>
                  →
                </span>
              </TrackedCta>
              <TrackedCta
                href="#jak-to-funguje"
                variant="secondary"
                className="w-full sm:w-auto"
                event="portfolio_click"
                eventPayload={{ location: "hero_process" }}
              >
                Jak HAIRWEB funguje
              </TrackedCta>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-copper" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-mockup-enter relative pb-2 sm:pb-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image
                src="/design/hero.jpg"
                alt="Interiér moderního kadeřnického salonu"
                fill
                priority
                className="animate-soft-zoom object-cover object-[center_92%]"
                sizes="(max-width: 1024px) 100vw, 640px"
                quality={80}
              />
            </div>
            <div className="relative z-10 mx-auto -mt-10 w-[min(100%,22rem)] px-2 sm:absolute sm:bottom-0 sm:left-3 sm:mx-0 sm:mt-0 sm:w-[min(340px,90%)] sm:px-0 sm:animate-float lg:-left-8">
              <HubDashboardMockup variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

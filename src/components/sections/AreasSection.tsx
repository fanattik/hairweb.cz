import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { services } from "@/lib/services";

export function AreasSection() {
  return (
    <section
      id="co-resime"
      className="scroll-mt-24 px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.75rem)]"
    >
      <div className="mx-auto max-w-[1360px] rounded-[36px] bg-foam p-[clamp(2rem,5vw,4.5rem)]">
        <Reveal className="mb-[clamp(2.5rem,5vw,4rem)] grid items-end gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <p className="eyebrow">Co řešíme</p>
            <h2 className="display-title text-[clamp(2.5rem,5.2vw,4.75rem)]">
              Co pro váš salon řešíme?
            </h2>
          </div>
          <p className="max-w-[460px] text-[19px] leading-relaxed text-[#3d3b37]">
            Ne povinný balíček. Jen oblasti, které vašemu salonu skutečně
            přinesou hodnotu.
          </p>
        </Reveal>

        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((area, index) => (
            <Reveal
              key={area.slug}
              delay={(index % 3) as 0 | 1 | 2}
              className="h-full"
            >
              <Link
                href={`/sluzby/${area.slug}`}
                className="card-lift group flex h-full min-h-[230px] cursor-pointer flex-col justify-between gap-7 rounded-[22px] bg-mist p-7 transition hover:bg-[#e8e6e0]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-ink-muted">
                  {area.number}
                </span>
                <div className="mt-auto flex flex-col gap-2.5">
                  <span className="flex items-center justify-between gap-2 text-2xl font-semibold tracking-tight text-ink">
                    {area.cardTitle}
                    <span
                      className="cta-arrow shrink-0 text-base font-normal text-copper opacity-60 transition group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink-soft">
                    {area.cardText}
                  </span>
                  <span className="mt-1 text-[13px] font-medium text-copper/70 transition group-hover:text-copper">
                    Zjistit více
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

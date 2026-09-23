import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

export function FinalCtaSection() {
  return (
    <section className="bg-ink px-[clamp(1.25rem,4vw,3rem)] pb-0 pt-[clamp(5rem,11vw,10rem)] text-foam">
      <div className="mx-auto max-w-[1360px]">
        <Reveal>
          <h2 className="max-w-[1200px] text-[clamp(3rem,8vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.058em]">
            Zjistěte, co vašemu salonu online{" "}
            <span className="text-copper-soft">skutečně chybí.</span>
          </h2>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-[520px] text-[19px] leading-relaxed text-[#bdbab3]">
              Možná potřebujete nový web. Možná vůbec ne. Nejdříve zjistíme
              skutečný stav a doporučíme pouze změny, které dávají smysl.
            </p>
            <TrackedCta
              href="/audit"
              variant="accent"
              className="px-8 py-[22px] text-[17px]"
              event="final_cta_click"
              sourceDetail="final_cta"
            >
              Začít online auditem{" "}
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

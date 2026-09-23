import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

export function ServiceFinalCta({ slug }: { slug: string }) {
  return (
    <section className="bg-ink px-[clamp(1.25rem,4vw,3rem)] py-[clamp(5rem,11vw,9rem)] text-foam">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="flex flex-col items-start gap-8">
          <h2 className="max-w-[18ch] text-[clamp(2.5rem,6.5vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
            Nemusíte vědět, co přesně potřebujete.
          </h2>
          <p className="max-w-[560px] text-[19px] leading-relaxed text-[#bdbab3]">
            Podíváme se na současné online fungování vašeho salonu a zjistíme,
            kde zbytečně ztrácíte čas, zákazníky nebo příležitosti.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <TrackedCta
              href="/#audit"
              variant="accent"
              className="px-8 py-[22px] text-[17px]"
              event="final_cta_click"
              eventPayload={{ location: `service_${slug}` }}
              sourceDetail="service_page"
            >
              Zjistit, jak si vede můj salon{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
            <p className="text-sm text-ink-muted">
              Nezávazně. Bez složitého nastavování.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

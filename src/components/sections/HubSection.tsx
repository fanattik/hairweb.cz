import { HubDashboardMockup } from "@/components/HubDashboardMockup";
import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

export function HubSection() {
  return (
    <section
      id="hub"
      className="scroll-mt-24 bg-ink section-pad text-foam"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(3rem,6vw,6rem)] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-7">
          <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.12em] text-copper-soft">
            Vše na jednom místě
          </p>
          <h2 className="text-[clamp(2.75rem,6vw,5.75rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
            Váš salon v HAIRWEB Hubu.
          </h2>
          <p className="max-w-[520px] text-[19px] leading-relaxed text-[#bdbab3]">
            Propojujeme jednotlivé části vašeho online podnikání do jednoho
            přehledu. Vidíte, co se děje, co funguje a co potřebuje pozornost.
          </p>
          <p className="max-w-[520px] text-2xl font-medium leading-snug tracking-tight">
            Všechno můžete spravovat sami. Ale nemusíte.
          </p>
          <p className="max-w-[460px] text-sm leading-relaxed text-ink-muted">
            Hub budujeme postupně jako součást dlouhodobé spolupráce — ukázka
            níže je prezentační UI, ne live účet.
          </p>
          <div>
            <TrackedCta
              href="#audit"
              variant="light"
              event="hero_cta_click"
              eventPayload={{ location: "hub" }}
              sourceDetail="audit"
            >
              Chci přehled pod kontrolou{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <HubDashboardMockup variant="full" />
        </Reveal>
      </div>
    </section>
  );
}

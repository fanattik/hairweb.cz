import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

const care = [
  "Web",
  "Google",
  "Recenze",
  "SEO",
  "Social",
  "Analytics",
  "Marketing",
  "Integrace",
] as const;

export function ManagedSection() {
  return (
    <section
      id="sprava"
      className="scroll-mt-24 px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.75rem)]"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2.5rem,6vw,6rem)] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-7">
          <p className="eyebrow">Dlouhodobá správa</p>
          <h2 className="display-title text-[clamp(2.75rem,6vw,5.75rem)]">
            Nastavením to nekončí.
          </h2>
          <p className="max-w-[560px] text-[19px] leading-relaxed text-[#3d3b37]">
            Online prostředí se neustále mění. Proto HAIRWEB nekončí předáním
            webu nebo nastavením profilu. Pravidelně kontrolujeme, spravujeme a
            zlepšujeme jednotlivé části podle toho, co váš salon skutečně
            potřebuje.
          </p>
          <p className="max-w-[560px] text-[26px] font-medium leading-snug tracking-tight text-ink">
            Vy se staráte o svůj salon. My se staráme o jeho online svět.
          </p>
          <div>
            <TrackedCta
              href="#audit"
              event="final_cta_click"
              eventPayload={{ location: "managed" }}
              sourceDetail="managed"
            >
              Chci mít online pod kontrolou{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
          </div>
        </Reveal>

        <Reveal delay={1} className="grid grid-cols-2 gap-2.5">
          {care.map((item) => (
            <div
              key={item}
              className="group flex items-center justify-between rounded-[18px] bg-foam px-6 py-[22px] text-lg font-medium tracking-tight text-ink transition duration-300 hover:bg-ink hover:text-foam"
            >
              {item}
              <span className="h-2 w-2 rounded-full bg-copper" aria-hidden />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

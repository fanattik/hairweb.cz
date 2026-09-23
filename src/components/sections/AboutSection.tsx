import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export function AboutSection() {
  return (
    <section
      id="o-hairweb"
      className="scroll-mt-24 px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.75rem)]"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2rem,5vw,5rem)] rounded-[36px] bg-foam p-[clamp(1.25rem,3vw,2.5rem)] lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/design/lukas.jpg"
              alt="Lukáš — zakladatel HAIRWEB"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="flex flex-col gap-7 p-[clamp(0.5rem,2vw,2rem)]">
          <p className="eyebrow">O HAIRWEB</p>
          <h2 className="display-title text-[clamp(2.75rem,6vw,5.75rem)]">
            Za HAIRWEBem stojím já.
          </h2>
          <p className="max-w-[540px] text-[21px] leading-relaxed tracking-tight text-ink">
            Jsem Lukáš. Nejsem anonymní platforma — jsem váš konkrétní online
            partner pro salon.
          </p>
          <p className="max-w-[540px] text-lg leading-relaxed text-ink-soft">
            Nejdřív zjišťuji, co už máte a co skutečně potřebujete. Audit, plán
            i dlouhodobou správu držíme pohromadě.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";
import { TrackedLink } from "@/components/TrackedLink";

const concepts = [
  {
    id: "hair-studio",
    name: "Studio Nora",
    focus: "Elegantní web · rezervace",
    demoHref: "/demo/hair-studio",
    event: "demo_hair_click" as const,
    image: "/design/nora.jpg",
    featured: true,
  },
  {
    id: "barber",
    name: "Kamiya",
    focus: "Barbershop · dark editorial",
    demoHref: "/demo/barber",
    event: "demo_barber_click" as const,
    image: "/design/kamiya.jpg",
    featured: false,
  },
  {
    id: "color-studio",
    name: "Color Studio",
    focus: "Color · galerie · booking",
    demoHref: "/demo/color-studio",
    event: "demo_color_click" as const,
    image: "/design/color.jpg",
    featured: false,
  },
] as const;

export function PortfolioSection() {
  const featured = concepts.find((c) => c.featured)!;
  const rest = concepts.filter((c) => !c.featured);

  return (
    <section id="ukazky" className="scroll-mt-24 overflow-x-clip section-pad">
      <div className="mx-auto max-w-[1360px]">
        <Reveal className="mb-[clamp(2.5rem,5vw,4.5rem)] grid items-end gap-8 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-6">
            <p className="eyebrow">Když je potřeba nový web</p>
            <h2 className="display-title text-[clamp(2.75rem,6vw,5.75rem)]">
              Web je jedna z možností — ne jediná.
            </h2>
          </div>
          <p className="max-w-[500px] text-[19px] leading-relaxed text-[#3d3b37]">
            Pokud audit ukáže, že má smysl vytvořit nebo upravit web, umíme to.
            Níže jsou ukázkové koncepty — ne klientské realizace.
          </p>
        </Reveal>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <Reveal className="min-w-0 lg:col-span-2">
            <TrackedLink
              href={featured.demoHref}
              event={featured.event}
              className="group relative block min-w-0 overflow-hidden rounded-[28px] text-foam transition duration-500 hover:scale-[0.985]"
              aria-label={`Prohlédnout ukázku ${featured.name}`}
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7]">
                <Image
                  src={featured.image}
                  alt={`Ukázkový koncept ${featured.name}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  quality={80}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-[clamp(1.25rem,3vw,2.5rem)] sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-5">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em]">
                    UKÁZKOVÝ KONCEPT
                  </p>
                  <p className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight">
                    {featured.name}
                  </p>
                  <p className="text-[15px] text-[#e8e6e0]">{featured.focus}</p>
                </div>
                <span className="shrink-0 rounded-full bg-foam px-[22px] py-3.5 text-sm font-medium text-ink">
                  Prohlédnout ukázku →
                </span>
              </div>
            </TrackedLink>
          </Reveal>

          {rest.map((concept, index) => (
            <Reveal key={concept.id} delay={(index === 0 ? 1 : 2) as 1 | 2} className="min-w-0">
              <TrackedLink
                href={concept.demoHref}
                event={concept.event}
                className="group relative block min-w-0 overflow-hidden rounded-[28px] text-foam transition duration-500 hover:scale-[0.985]"
                aria-label={`Prohlédnout ukázku ${concept.name}`}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={concept.image}
                    alt={`Ukázkový koncept ${concept.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em]">
                    UKÁZKOVÝ KONCEPT
                  </p>
                  <p className="mt-2 text-[34px] font-semibold tracking-tight">
                    {concept.name}
                  </p>
                  <p className="text-[15px] text-[#e8e6e0]">{concept.focus}</p>
                </div>
              </TrackedLink>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <TrackedCta
            href="#audit"
            variant="secondary"
            event="hero_cta_click"
            eventPayload={{ location: "portfolio" }}
            sourceDetail="portfolio"
          >
            Nejdřív online audit{" "}
            <span className="cta-arrow" aria-hidden>
              →
            </span>
          </TrackedCta>
        </Reveal>
      </div>
    </section>
  );
}

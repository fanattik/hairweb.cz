import { Reveal } from "@/components/Reveal";

const features = [
  {
    title: "Online rezervace",
    lead: "Z návštěvy rovnou k rezervaci.",
    text: "Napojení na váš současný rezervační systém bez zbytečných kroků.",
    span: "md:col-span-2",
  },
  {
    title: "Služby & ceník",
    lead: "Klient okamžitě ví, co nabízíte a za kolik.",
    text: "Přehledné služby a ceny bez hledání na Instagramu.",
    span: "",
  },
  {
    title: "Galerie práce",
    lead: "Vaše práce prodává nejlépe.",
    text: "Ukažte střihy, barvení, balayage nebo proměny v profesionální galerii.",
    span: "",
  },
  {
    title: "Váš tým",
    lead: "Klient ví, komu se svěří do rukou.",
    text: "Představte stylisty, jejich práci a specializace.",
    span: "",
  },
  {
    title: "Google recenze",
    lead: "Důvěra ještě před první návštěvou.",
    text: "Ukažte zkušenosti spokojených klientů přímo na webu.",
    span: "md:col-span-2",
  },
  {
    title: "Instagram",
    lead: "Propojte web s místem, kde už svou práci ukazujete.",
    text: "Obsah z Instagramu tam, kde se klient rozhoduje.",
    span: "",
  },
  {
    title: "Google Maps",
    lead: "Ať vás klient snadno najde.",
    text: "Adresa, mapa a navigace přímo z webu.",
    span: "",
  },
  {
    title: "Lokální SEO",
    lead: "Buďte vidět, když někdo hledá kadeřnictví ve vašem okolí.",
    text: "Web s dobrým základem pro lokální vyhledávání.",
    span: "md:col-span-2 lg:col-span-1",
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="co-ziskate"
      className="scroll-mt-24 border-t border-line bg-mist px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Co web umí
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Všechno, co váš salon potřebuje online.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              as="article"
              delay={(index % 3) as 0 | 1 | 2}
              className={`bg-foam p-6 sm:p-7 ${feature.span}`}
            >
              <h3 className="font-[family-name:var(--font-fraunces)] text-xl text-ink sm:text-2xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-snug text-ink sm:text-base">
                {feature.lead}
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                {feature.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

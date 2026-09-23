import { Reveal } from "@/components/Reveal";
import {
  IconFirmy,
  IconGoogle,
  IconPrice,
  IconService,
  IconSocial,
  IconTeam,
  IconVacation,
  IconWeb,
} from "@/components/LineIcons";
import { TrackedCta } from "@/components/TrackedCta";

const withoutPlatforms = [
  { label: "Web", Icon: IconWeb },
  { label: "Google", Icon: IconGoogle },
  { label: "Firmy.cz", Icon: IconFirmy },
  { label: "Facebook", Icon: IconSocial },
  { label: "Instagram", Icon: IconSocial },
] as const;

const situations = [
  {
    title: "Upravujete ceník",
    text: "Nová cena střihu, barvení nebo nové služby? Změnu zadáte jednou přes HAIRWEB HUB nebo ji jednoduše pošlete nám.",
    highlight: "Aktuální ceny tam, kde je zákazníci hledají.",
    Icon: IconPrice,
  },
  {
    title: "Přichází nová kolegyně",
    text: "Fotka, jméno, specializace, profil na webu nebo možnost rezervace. Pošlete nám podklady a my vyřešíme zbytek.",
    highlight: "Nový člen týmu bez zbytečného nastavování.",
    Icon: IconTeam,
  },
  {
    title: "Dovolená nebo mimořádná změna",
    text: "V pátek máme zavřeno? Nemusíte obcházet všechny profily salonu a přemýšlet, kam jste informaci ještě nedali.",
    highlight: "Jednou dáte vědět. My se postaráme o zbytek.",
    Icon: IconVacation,
  },
  {
    title: "Přidáváte novou službu",
    text: "Nová služba nemusí skončit jen jako jeden příspěvek na Instagramu. Pomůžeme ji dostat na web, do nabídky služeb, ceníku, rezervací a dalších relevantních míst.",
    highlight: "Jedna novinka. Celá online prezentace aktuální.",
    Icon: IconService,
  },
] as const;

const hubTargets = [
  "Web",
  "Google",
  "Firmy.cz",
  "Sociální sítě",
  "Rezervace",
] as const;

export function OneChangeSection() {
  return (
    <section
      id="jedna-zmena"
      className="scroll-mt-24 bg-foam section-pad"
      aria-labelledby="one-change-heading"
    >
      <div className="mx-auto max-w-[1360px]">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="eyebrow">Jednou. Všude.</p>
          <h2
            id="one-change-heading"
            className="mt-4 display-title text-[clamp(2.5rem,5.5vw,4.75rem)]"
          >
            Jedna změna. Všude vyřešeno.
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[19px] leading-relaxed text-[#3d3b37]">
            Vést salon znamená řešit každý den desítky věcí. Online prezentace
            by neměla být další z nich.
          </p>
          <p className="mx-auto mt-4 max-w-[580px] text-base leading-relaxed text-ink-soft">
            Změnila se otevírací doba? Máte nový ceník? Přibyla nová kolegyně?
            Potřebujete přidat službu nebo oznámit dovolenou? Stačí jedna změna
            v HAIRWEB HUBu nebo jeden požadavek nám. O zbytek se postaráme.
          </p>
        </Reveal>

        {/* Contrast comparison */}
        <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-4 lg:grid-cols-2">
          <Reveal className="rounded-[28px] border border-ink/[0.08] bg-mist p-6 sm:p-8">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.14em] text-ink-muted">
              BEZ HAIRWEBU
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Změna otevírací doby
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Změnu musíte provést na několika místech.
            </p>

            {/* Desktop: horizontal flow */}
            <div
              className="one-change-stagger mt-7 hidden items-center gap-2 md:flex"
              aria-hidden
            >
              {withoutPlatforms.map((platform, index) => (
                <div key={platform.label} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span className="text-ink-faint" aria-hidden>
                      →
                    </span>
                  ) : null}
                  <div
                    className="one-change-chip flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-foam px-3 py-3"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <platform.Icon className="h-4 w-4 text-ink-muted" />
                    <span className="whitespace-nowrap text-[11px] font-medium text-ink-soft">
                      {platform.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: vertical stack */}
            <ol className="one-change-stagger mt-6 space-y-2 md:hidden">
              {withoutPlatforms.map((platform, index) => (
                <li
                  key={platform.label}
                  className="one-change-chip flex items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-foam px-4 py-3"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <platform.Icon className="h-4 w-4 text-ink-muted" />
                  <span className="text-sm font-medium text-ink">
                    {platform.label}
                  </span>
                  {index < withoutPlatforms.length - 1 ? (
                    <span className="ml-auto text-ink-faint" aria-hidden>
                      ↓
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal
            delay={1}
            className="flex flex-col justify-between rounded-[28px] bg-ink p-6 text-foam sm:p-8"
          >
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.14em] text-copper-soft">
                S HAIRWEBEM
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                Změna otevírací doby
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#bdbab3]">
                Změníte údaj jednou. O zbytek se postaráme.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-center sm:flex-1">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em] text-ink-muted">
                  HAIRWEB HUB
                </p>
                <p className="mt-1.5 text-lg font-semibold tracking-tight">
                  Jedna změna
                </p>
              </div>
              <span
                className="hidden text-2xl text-copper-soft sm:block"
                aria-hidden
              >
                →
              </span>
              <span
                className="text-center text-xl text-copper-soft sm:hidden"
                aria-hidden
              >
                ↓
              </span>
              <div className="rounded-2xl bg-copper px-5 py-4 text-center text-white sm:flex-1">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.12em]">
                  VÝSLEDEK
                </p>
                <p className="mt-1.5 text-lg font-semibold tracking-tight">
                  ✓ Hotovo
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Situation cards */}
        <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-3 sm:grid-cols-2">
          {situations.map((item, index) => (
            <Reveal
              key={item.title}
              delay={(index % 3) as 0 | 1 | 2}
              className="card-lift flex flex-col gap-5 rounded-[22px] bg-mist p-6 sm:p-7 hover:bg-[#e8e6e0]"
            >
              <div className="flex items-start justify-between gap-4">
                <item.Icon className="h-5 w-5 text-copper" />
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-ink-muted">
                  /0{index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
                  {item.text}
                </p>
                <p className="mt-4 border-t border-ink/[0.08] pt-4 text-sm font-medium tracking-tight text-ink">
                  {item.highlight}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Closing block */}
        <Reveal className="mt-[clamp(2.5rem,5vw,4rem)] rounded-[36px] bg-ink px-[clamp(1.5rem,4vw,3.5rem)] py-[clamp(2.5rem,5vw,4rem)] text-foam">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.14em] text-copper-soft">
              Váš salon. Jedno místo.
            </p>
            <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
              HAIRWEB HUB vám dává jedno místo pro správu toho nejdůležitějšího.
            </h3>
            <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-relaxed text-[#bdbab3]">
              A co nechcete řešit sami? Jednoduše to předejte nám.
            </p>

            <div className="mx-auto mt-10 flex max-w-[640px] flex-col items-center gap-4">
              <div className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold tracking-tight">
                HAIRWEB HUB
              </div>
              <span className="text-copper-soft" aria-hidden>
                ↓
              </span>
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {hubTargets.map((target) => (
                  <li
                    key={target}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-[#d8d5ce]"
                  >
                    {target}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-10 text-[clamp(1.25rem,2.5vw,1.75rem)] font-medium tracking-tight">
              Méně administrativy. Méně starostí. Více času na salon.
            </p>

            <div className="mt-8 flex justify-center">
              <TrackedCta
                href="#audit"
                variant="accent"
                event="final_cta_click"
                eventPayload={{ location: "one_change" }}
                sourceDetail="one_change"
              >
                Chci méně starostí se salonem{" "}
                <span className="cta-arrow" aria-hidden>
                  →
                </span>
              </TrackedCta>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

const sampleScores = [
  { label: "Web", score: 82 },
  { label: "Google", score: 64 },
  { label: "Recenze", score: 91 },
  { label: "Sociální sítě", score: 58 },
  { label: "Rezervace", score: 76 },
] as const;

export function AuditLanding() {
  return (
    <>
      <section className="overflow-x-clip px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)] pt-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="eyebrow mb-5">Zdarma · Online audit salonu</p>
              <h1 className="max-w-[12ch] text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink">
                Jak si vede váš salon online?
              </h1>
              <p className="mt-8 max-w-[520px] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-relaxed text-[#3d3b37]">
                Zjistěte během pár minut, jak si váš salon vede na webu, Googlu,
                sociálních sítích, v recenzích a dalších důležitých oblastech.
              </p>
              <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-ink-soft">
                Na pár věcí se zeptáme. Zbytek se pokusíme zjistit za vás.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <TrackedCta
                  href="/audit/spustit"
                  variant="accent"
                  className="px-8 py-[20px] text-[17px]"
                  event="audit_started"
                  eventPayload={{ location: "audit_landing" }}
                  sourceDetail="online_audit"
                >
                  Spustit audit zdarma{" "}
                  <span className="cta-arrow" aria-hidden>
                    →
                  </span>
                </TrackedCta>
              </div>
              <p className="mt-5 text-sm text-ink-muted">
                Zdarma · Bez závazků · Výsledek během několika minut
              </p>
            </Reveal>
          </div>

          <Reveal delay={1}>
            <div className="relative rounded-[32px] bg-foam p-[clamp(1.5rem,4vw,2.5rem)] shadow-[var(--shadow-soft)]">
              <p className="mb-4 inline-flex rounded-full bg-mist px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.1em] text-ink-muted">
                UKÁZKA VÝSLEDKU
              </p>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.12em] text-copper">
                HAIRWEB SCORE
              </p>
              <p className="mt-2 text-[clamp(3.5rem,8vw,5.5rem)] font-semibold leading-none tracking-[-0.06em] text-ink">
                74
                <span className="text-[0.45em] font-medium text-ink-muted">
                  {" "}
                  / 100
                </span>
              </p>
              <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-ink-soft">
                Váš salon má dobrý základ, ale našli jsme několik míst, kde
                přicházíte o potenciál.
              </p>
              <ul className="mt-8 space-y-3">
                {sampleScores.map((item) => (
                  <li key={item.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-ink-soft">{item.label}</span>
                      <span className="font-medium tabular-nums text-ink">
                        {item.score}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-full rounded-full bg-copper"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13px] text-ink-muted">
                Ilustrativní ukázka — ne výsledek vašeho salonu.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="mx-auto max-w-[1360px] rounded-[36px] bg-mist p-[clamp(2rem,5vw,4rem)]">
          <Reveal className="grid gap-10 lg:grid-cols-3">
            {[
              {
                n: "01",
                t: "Řeknete nám salon",
                d: "Název, město a pár odpovědí, které veřejně nezjistíme.",
              },
              {
                n: "02",
                t: "Zbytek zjišťujeme my",
                d: "Web, Google a další veřejné signály — pokud je dokážeme ověřit.",
              },
              {
                n: "03",
                t: "Dostanete HAIRWEB SCORE",
                d: "Skóre 0–100, silné stránky, priority a 3 věci ke zlepšení hned.",
              },
            ].map((item) => (
              <div key={item.n} className="flex flex-col gap-3">
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-ink-muted">
                  {item.n}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  {item.t}
                </h2>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {item.d}
                </p>
              </div>
            ))}
          </Reveal>
          <div className="mt-10">
            <Link
              href="/audit/spustit"
              className="text-[15px] font-medium text-copper transition hover:text-copper-deep"
            >
              Spustit audit zdarma →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

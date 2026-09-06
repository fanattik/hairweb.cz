"use client";

import { CtaButton } from "@/components/CtaButton";
import { Reveal } from "@/components/Reveal";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";

const plans = [
  {
    id: "start",
    name: "START",
    price: "od 9 900 Kč",
    billing: "jednorázově",
    description: "Pro jednotlivce a menší salony.",
    recommended: false,
    features: [
      "Jednostránkový web",
      "Design na míru",
      "Mobilní verze",
      "Služby a ceník",
      "Galerie",
      "Online rezervace",
      "Kontakty + mapa",
      "Základní SEO",
      "Spuštění webu",
    ],
    cta: "Chci START",
    event: "pricing_start_click" as const,
    href: "/?plan=start#poptavka",
  },
  {
    id: "pro",
    name: "PRO",
    price: "od 14 900 Kč",
    billing: "jednorázově",
    description:
      "Pro salony, které chtějí web aktivně využívat pro získávání klientů.",
    recommended: true,
    features: [
      "Kompletní vícestránkový web",
      "Vše ze START",
      "Samostatné stránky služeb",
      "Tým",
      "Pokročilejší galerie",
      "Google recenze",
      "Lepší struktura pro SEO",
      "Lokální SEO",
      "Analytics",
      "Pokročilejší obsah",
    ],
    cta: "Chci PRO",
    event: "pricing_pro_click" as const,
    href: "/?plan=pro#poptavka",
  },
] as const;

export function PricingSection() {
  return (
    <section
      id="cenik"
      className="scroll-mt-24 border-y border-line bg-mist px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Ceník
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Jasná nabídka. Bez překvapení.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Dvě produktizované varianty. Finální cena vždy závisí na rozsahu —
            návrh je nezávazný.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={(index + 1) as 1 | 2}>
              <article
                className={`relative flex h-full flex-col border p-7 sm:p-8 ${
                  plan.recommended
                    ? "border-ink bg-ink text-foam lg:scale-[1.02] lg:shadow-[0_24px_60px_-28px_rgba(26,23,20,0.45)]"
                    : "border-line bg-foam text-ink"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
                      {plan.name}
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        plan.recommended ? "text-foam/70" : "text-ink-soft"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  {plan.recommended ? (
                    <span className="shrink-0 bg-copper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foam">
                      Doporučuji
                    </span>
                  ) : null}
                </div>

                <p className="mt-7 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl">
                  {plan.price}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    plan.recommended ? "text-foam/55" : "text-ink-soft"
                  }`}
                >
                  {plan.billing}
                </p>

                <ul
                  className={`mt-7 flex-1 space-y-2.5 border-t pt-6 text-sm ${
                    plan.recommended
                      ? "border-white/15 text-foam/85"
                      : "border-line text-ink-soft"
                  }`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 bg-copper" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>

                <CtaButton
                  href={plan.href}
                  variant={plan.recommended ? "primary" : "dark"}
                  className="mt-8 w-full sm:w-auto"
                  onClick={() => {
                    setSourceDetail(
                      plan.id === "pro" ? "pricing_pro" : "pricing_start",
                    );
                    trackEvent(plan.event);
                  }}
                >
                  {plan.cta}
                </CtaButton>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

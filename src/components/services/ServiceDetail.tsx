import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";
import type { ServicePageContent } from "@/lib/services";
import { services } from "@/lib/services";
import Link from "next/link";

function ServiceFlow({
  label,
  steps,
}: {
  label: string;
  steps: { label: string }[];
}) {
  return (
    <Reveal className="overflow-hidden rounded-[28px] bg-mist p-[clamp(1.5rem,4vw,2.5rem)]">
      <p className="eyebrow mb-6">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className="rounded-full bg-foam px-5 py-3 text-[15px] font-medium tracking-tight text-ink shadow-[0_1px_0_rgba(17,17,16,0.04)]">
              {step.label}
            </div>
            {index < steps.length - 1 ? (
              <span
                className="hidden font-[family-name:var(--font-geist-mono)] text-copper sm:inline"
                aria-hidden
              >
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function ServiceDetail({ service }: { service: ServicePageContent }) {
  const siblings = services.filter((item) => item.slug !== service.slug);

  return (
    <article id="top">
      <section className="overflow-x-clip px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-[1360px]">
          <Reveal className="mb-8 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <Link href="/" className="transition hover:text-copper">
              HAIRWEB
            </Link>
            <span aria-hidden>/</span>
            <Link href="/#co-resime" className="transition hover:text-copper">
              Služby
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink">{service.cardTitle}</span>
          </Reveal>

          <Reveal className="mb-5 flex items-center gap-3">
            <span className="font-[family-name:var(--font-geist-mono)] text-xs text-ink-muted">
              {service.number}
            </span>
            <p className="eyebrow !mb-0">{service.eyebrow}</p>
          </Reveal>

          <Reveal delay={1}>
            <h1 className="max-w-[16ch] text-[clamp(2.75rem,7.5vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink">
              {service.title}
            </h1>
          </Reveal>

          <Reveal
            delay={2}
            className="mt-[clamp(2rem,4vw,3.5rem)] grid max-w-[1100px] items-end gap-8 lg:grid-cols-[1fr_auto]"
          >
            <p className="max-w-[540px] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-relaxed text-[#3d3b37] text-pretty">
              {service.description}
            </p>
            <TrackedCta
              href="/#audit"
              variant="accent"
              event="hero_cta_click"
              eventPayload={{ location: `service_${service.slug}` }}
              sourceDetail="service_page"
            >
              {service.ctaLabel}{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
          </Reveal>
        </div>
      </section>

      {service.flow ? (
        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,6vw,5rem)]">
          <div className="mx-auto max-w-[1360px]">
            <ServiceFlow label={service.flow.label} steps={service.flow.steps} />
          </div>
        </section>
      ) : null}

      <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)]">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <Reveal className="flex flex-col gap-6">
              {service.intro.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index === 0
                      ? "text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-snug tracking-tight text-ink"
                      : "max-w-[540px] text-[18px] leading-relaxed text-[#3d3b37]"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={1} className="rounded-[28px] bg-foam p-[clamp(1.75rem,4vw,2.75rem)]">
              <p className="eyebrow mb-6">{service.resolveHeading}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {service.resolveItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-snug text-ink"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {service.highlight ? (
        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)]">
          <Reveal className="mx-auto max-w-[1360px] rounded-[36px] bg-mist p-[clamp(2rem,5vw,4rem)]">
            <h2 className="display-title max-w-[14ch] text-[clamp(2rem,4.5vw,3.75rem)]">
              {service.highlight.title}
            </h2>
            <div className="mt-8 grid max-w-[720px] gap-5">
              {service.highlight.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[18px] leading-relaxed text-[#3d3b37]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}

      {service.closing ? (
        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)]">
          <Reveal className="mx-auto max-w-[860px]">
            <p className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
              {service.closing}
            </p>
          </Reveal>
        </section>
      ) : null}

      <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)]">
        <div className="mx-auto max-w-[1360px]">
          <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">Další oblasti</p>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight text-ink">
                Co ještě pro salon řešíme
              </h2>
            </div>
            <Link
              href="/#co-resime"
              className="text-sm font-medium text-copper transition hover:text-copper-deep"
            >
              Všechny oblasti →
            </Link>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.slice(0, 4).map((item, index) => (
              <Reveal
                key={item.slug}
                delay={(index % 3) as 0 | 1 | 2}
              >
                <Link
                  href={`/sluzby/${item.slug}`}
                  className="card-lift group flex min-h-[180px] flex-col justify-between gap-6 rounded-[22px] bg-mist p-6 transition hover:bg-[#e8e6e0]"
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs text-ink-muted">
                    {item.number}
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center justify-between gap-2 text-xl font-semibold tracking-tight text-ink">
                      {item.cardTitle}
                      <span
                        className="cta-arrow text-copper opacity-0 transition group-hover:opacity-100"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                    <span className="text-[14px] leading-relaxed text-ink-soft">
                      {item.cardText}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

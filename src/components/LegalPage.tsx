import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const relatedLinks = [
  { href: "/ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
  { href: "/cookies", label: "Cookies" },
  { href: "/obchodni-podminky", label: "Obchodní podmínky" },
] as const;

export function LegalPage({
  eyebrow = "Právní dokumenty",
  title,
  updated,
  currentHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  currentHref?: string;
  children: ReactNode;
}) {
  const links = relatedLinks.filter((link) => link.href !== currentHref);

  return (
    <>
      <Header />
      <main id="top">
        <section className="overflow-x-clip px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2.5rem,6vw,4.5rem)]">
          <div className="mx-auto max-w-[920px]">
            <nav
              className="mb-8 flex flex-wrap items-center gap-3 text-sm text-ink-soft"
              aria-label="Drobečková navigace"
            >
              <Link href="/" className="transition hover:text-copper">
                HAIRWEB
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink">{title}</span>
            </nav>

            <p className="eyebrow mb-5">{eyebrow}</p>
            <h1 className="max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink">
              {title}
            </h1>
            {updated ? (
              <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.08em] text-ink-muted">
                Poslední aktualizace: {updated}
              </p>
            ) : null}
          </div>
        </section>

        <section className="px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(4rem,8vw,7rem)]">
          <div className="mx-auto max-w-[920px]">
            <div className="legal-content rounded-[28px] bg-foam p-[clamp(1.75rem,4vw,3rem)] text-[16px] leading-relaxed text-[#3d3b37] sm:text-[17px] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[clamp(1.35rem,2.4vw,1.75rem)] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-ink [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:marker:text-copper [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:decoration-copper/35 [&_a]:underline-offset-[3px] hover:[&_a]:decoration-copper [&_code]:rounded-md [&_code]:bg-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-[family-name:var(--font-geist-mono)] [&_code]:text-[0.9em] [&_code]:text-ink [&_strong]:font-semibold [&_strong]:text-ink">
              {children}
            </div>

            <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
                  DALŠÍ DOKUMENTY
                </p>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[15px] font-medium text-ink transition hover:text-copper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-copper transition hover:text-copper-deep"
              >
                <span aria-hidden>←</span>
                Zpět na úvod
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

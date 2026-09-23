import Link from "next/link";
import { navLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-ink px-[clamp(1.25rem,4vw,3rem)] pb-8 pt-[clamp(5rem,10vw,8.75rem)] text-foam">
      <div className="mx-auto max-w-[1360px]">
        <div className="mt-0 grid gap-10 border-t border-[#2c2b28] pt-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-[18px]">
            <p className="text-[26px]">
              <span className="font-light">HAIR</span>
              <span className="font-extrabold">WEB</span>
            </p>
            <p className="max-w-[300px] text-sm leading-relaxed text-ink-muted">
              Online partner pro kadeřnictví, salony a barbershopy. Co funguje,
              necháme. Co chybí, doplníme.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-[15px]">
            <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
              NAVIGACE
            </p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-copper-soft"
              >
                {link.label}
              </a>
            ))}
            <a href="/audit" className="transition hover:text-copper-soft">
              Online audit
            </a>
          </div>

          <div className="flex flex-col gap-3 text-[15px]">
            <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted">
              KONTAKT
            </p>
            <a
              href={`mailto:${site.email}`}
              className="transition hover:text-copper-soft"
            >
              {site.email}
            </a>
            {site.instagram === "#" ? (
              <span className="text-ink-muted">Instagram</span>
            ) : (
              <a
                href={site.instagram}
                className="transition hover:text-copper-soft"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
            <Link
              href="/ochrana-osobnich-udaju"
              className="transition hover:text-copper-soft"
            >
              Ochrana osobních údajů
            </Link>
            <Link href="/cookies" className="transition hover:text-copper-soft">
              Cookies
            </Link>
            <Link
              href="/obchodni-podminky"
              className="transition hover:text-copper-soft"
            >
              Obchodní podmínky
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-4 text-[13px] text-ink-muted">
          <span>© {new Date().getFullYear()} HAIRWEB.cz</span>
          <span>Prémiový online partner pro salony.</span>
        </div>
      </div>
    </footer>
  );
}

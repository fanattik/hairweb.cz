import Link from "next/link";
import { HairwebLogo } from "@/components/HairwebLogo";
import { navLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <a
            href="#top"
            className="inline-flex items-center"
            aria-label="HAIRWEB"
          >
            <HairwebLogo height={26} />
          </a>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Weby pro kadeřnictví &amp; barbershopy.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Navigace
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-copper">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#poptavka" className="transition hover:text-copper">
                Poptávka
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Kontakt
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition hover:text-copper"
              >
                {site.email}
              </a>
            </li>
            <li>
              {site.instagram === "#" ? (
                <span className="text-ink-soft">
                  Instagram {/* TODO: doplnit URL */}
                </span>
              ) : (
                <a
                  href={site.instagram}
                  className="transition hover:text-copper"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              )}
            </li>
            <li>
              <Link
                href="/ochrana-osobnich-udaju"
                className="transition hover:text-copper"
              >
                Ochrana osobních údajů
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="transition hover:text-copper">
                Cookies
              </Link>
            </li>
            <li>
              <Link
                href="/obchodni-podminky"
                className="transition hover:text-copper"
              >
                Obchodní podmínky
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}.cz
          </p>
          <p>Specialista na weby pro kadeřnictví a barbershopy.</p>
        </div>
      </div>
    </footer>
  );
}

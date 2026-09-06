"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "@/components/CtaButton";
import { HairwebLogo } from "@/components/HairwebLogo";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";
import { navLinks } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        scrolled || open
          ? "border-line bg-foam"
          : "border-transparent bg-foam/95"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <a
          href="#top"
          className="inline-flex items-center"
          aria-label="HAIRWEB, domů"
        >
          <HairwebLogo height={22} priority />
        </a>

        <nav
          className="hidden items-center gap-7 text-sm text-ink-soft lg:flex"
          aria-label="Hlavní"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CtaButton
            href="#poptavka"
            variant="primary"
            className="hidden min-h-10 px-4 py-2.5 sm:inline-flex"
            onClick={() => {
              setSourceDetail("header");
              trackEvent("hero_cta_click", { location: "header" });
            }}
          >
            Chci nový web
          </CtaButton>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3.5 w-5" aria-hidden>
              <span
                className={`absolute left-0 h-px w-full bg-ink transition ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-px w-full bg-ink transition ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-ink transition ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-line bg-foam lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8"
          aria-label="Mobilní"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-3 text-base text-ink"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <CtaButton
            href="#poptavka"
            className="mt-3 w-full"
            onClick={() => {
              setOpen(false);
              setSourceDetail("header");
              trackEvent("hero_cta_click", { location: "mobile_nav" });
            }}
          >
            Chci nový web
          </CtaButton>
        </nav>
      </div>
    </header>
  );
}

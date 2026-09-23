"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "@/components/CtaButton";
import { navLinks } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-4 pt-3.5 sm:px-6 sm:pt-4 lg:px-8">
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-full border border-ink/[0.07] bg-foam/85 px-4 py-2.5 pl-6 backdrop-blur-[14px] transition-shadow duration-300 sm:px-3 sm:pl-7 ${
          scrolled ? "shadow-[0_20px_50px_-28px_rgba(17,17,16,0.35)]" : ""
        }`}
      >
        <a
          href="/"
          className="inline-flex shrink-0 items-center text-xl tracking-[0.02em] text-ink"
          aria-label="HAIRWEB, domů"
        >
          <span className="font-light">HAIR</span>
          <span className="font-extrabold">WEB</span>
        </a>

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-ink xl:flex"
          aria-label="Hlavní"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-copper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <CtaButton
            href="/audit"
            variant="primary"
            className="hidden min-h-11 px-5 py-3 text-sm xl:inline-flex"
            data-track="hero_cta_click"
            data-source="header"
            data-track-payload='{"location":"header"}'
          >
            Zjistit, jak si vede můj salon
          </CtaButton>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-foam xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className="relative flex h-[14px] w-[18px] items-center justify-center"
              aria-hidden
            >
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-foam transition ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[3.5px]"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-foam transition ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[3.5px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="mx-auto mt-2 max-w-[1400px] rounded-[28px] border border-ink/[0.07] bg-foam p-6 shadow-[0_30px_60px_-30px_rgba(17,17,16,0.3)] xl:hidden"
        >
          <nav
            className="flex flex-col gap-1"
            aria-label="Mobilní"
            onClick={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("a")
              ) {
                setOpen(false);
              }
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 text-[28px] font-semibold tracking-[-0.04em] text-ink"
              >
                {link.label}
              </a>
            ))}
            <CtaButton
              href="/audit"
              variant="accent"
              className="mt-4 w-full"
              data-track="hero_cta_click"
              data-source="header"
              data-track-payload='{"location":"mobile_nav"}'
            >
              Zjistit, jak si vede můj salon →
            </CtaButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * Fixed bottom CTA on mobile. Overlay only — body padding is reserved via CSS
 * to avoid CLS when the bar appears.
 */
export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const menuOpen = document.body.style.overflow === "hidden";
      const hero = document.getElementById("top");
      const form = document.getElementById("poptavka");
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      const formRect = form?.getBoundingClientRect();
      const formInView =
        formRect != null &&
        formRect.top < window.innerHeight * 0.85 &&
        formRect.bottom > window.innerHeight * 0.2;

      setVisible(!menuOpen && heroBottom < 0 && !formInView);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-foam p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <a
        href="#poptavka"
        tabIndex={visible ? 0 : -1}
        className="flex min-h-12 w-full items-center justify-center bg-copper text-sm font-medium text-foam transition hover:bg-copper-deep"
        data-track="mobile_cta_click"
        data-source="mobile_sticky"
      >
        Chci nezávazný návrh
      </a>
    </div>
  );
}

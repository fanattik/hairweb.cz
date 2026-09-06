"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";

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

      const next = !menuOpen && heroBottom < 0 && !formInView;
      setVisible(next);
      document.body.classList.toggle("has-mobile-cta", next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.body.classList.remove("has-mobile-cta");
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-foam/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <a
        href="#poptavka"
        className="flex min-h-12 w-full items-center justify-center bg-copper text-sm font-medium text-foam transition hover:bg-copper-deep"
        onClick={() => {
          setSourceDetail("mobile_sticky");
          trackEvent("mobile_cta_click");
        }}
      >
        Chci nezávazný návrh
      </a>
    </div>
  );
}

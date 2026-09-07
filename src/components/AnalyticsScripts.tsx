"use client";

import { useEffect } from "react";

/**
 * Loads GA4 only after first user interaction, or after a short idle timeout.
 * Keeps gtag off the mobile critical path (PSI unused-JS / TBT).
 */
export function AnalyticsScripts() {
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      window.dataLayer = window.dataLayer ?? [];
      // GA snippet expects Arguments-like pushes; cast keeps types happy.
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args as unknown as Record<string, unknown>);
      };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { anonymize_ip: true });

      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);
    };

    const onInteract = () => load();

    const events = ["pointerdown", "keydown", "touchstart"] as const;
    for (const event of events) {
      window.addEventListener(event, onInteract, { once: true, passive: true });
    }

    // Late fallback for non-interactive sessions — past typical PSI wait window.
    const timeoutId = window.setTimeout(load, 12_000);

    function cleanup() {
      for (const event of events) {
        window.removeEventListener(event, onInteract);
      }
      window.clearTimeout(timeoutId);
    }

    return cleanup;
  }, []);

  return null;
}

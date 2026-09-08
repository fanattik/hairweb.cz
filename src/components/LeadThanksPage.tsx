"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { consumeLeadFormSuccessFlag } from "@/lib/leads/thanks-flag";

/**
 * Shows thank-you content only after a real form success flag in sessionStorage.
 * Direct visits are redirected to the homepage form.
 */
export function LeadThanksGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const flag = consumeLeadFormSuccessFlag();
    if (!flag) {
      router.replace("/#poptavka");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <p className="text-sm text-ink-soft">Načítám…</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function LeadThanksContent() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Poptávka
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
        Děkuji! Poptávka je na cestě. ✂️
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
        Ozvu se vám co nejdříve a společně probereme, jak by mohl nový web
        vašeho salonu vypadat.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-11 items-center justify-center bg-copper px-6 py-3 text-sm font-medium tracking-wide text-foam transition hover:bg-copper-deep"
      >
        Zpět na HAIRWEB.cz
      </Link>
    </div>
  );
}

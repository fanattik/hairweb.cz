"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import {
  clearLeadThanksCookie,
  consumeLeadFormSuccessFlag,
  peekLeadFormSuccessFlag,
} from "@/lib/leads/thanks-flag";

/** Survives React Strict Mode remount in dev (effects run twice). */
let thanksGateLatched = false;

/**
 * Shows thank-you content only after a real form success flag.
 * Direct visits are redirected to the homepage form.
 */
export function LeadThanksGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(thanksGateLatched);

  useEffect(() => {
    if (thanksGateLatched) {
      startTransition(() => setAllowed(true));
      return;
    }

    const flag = peekLeadFormSuccessFlag();
    if (!flag) {
      router.replace("/#audit");
      return;
    }

    thanksGateLatched = true;
    // Refresh of this URL should not stay open without a new submit.
    clearLeadThanksCookie();
    startTransition(() => setAllowed(true));
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
  function clearGate() {
    thanksGateLatched = false;
    consumeLeadFormSuccessFlag();
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Online audit
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
        Děkuji! Podívám se na váš salon.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
        Ozvu se vám co nejdříve s tím, co funguje, kde jsou slabá místa a co
        má smysl řešit — bez tlaku na výměnu všeho, co už máte.
      </p>
      <Link
        href="/"
        onClick={clearGate}
        className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium tracking-tight text-foam transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-copper"
      >
        Zpět na HAIRWEB.cz
      </Link>
    </div>
  );
}

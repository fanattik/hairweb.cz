import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies | Hairweb.cz",
  description: "Informace o používání cookies na Hairweb.cz.",
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Právní
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
        Cookies
      </h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          {/* TODO: doplnit cookie policy podle finálního analytics řešení */}
          Tato stránka je zatím placeholder. Po napojení analytics doplním
          přehled používaných cookies a případnou cookie lištu.
        </p>
        <p>
          Zatím web neukládá marketingové cookies. Technické cookies nutné pro
          běh webu mohou být použity prohlížečem automaticky.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-sm text-copper">
        ← Zpět na úvod
      </Link>
    </main>
  );
}

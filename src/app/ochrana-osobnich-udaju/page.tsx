import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | Hairweb.cz",
  description: "Informace o zpracování osobních údajů na Hairweb.cz.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Právní
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
        Ochrana osobních údajů
      </h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
        <p>
          {/* TODO: doplnit finální znění GDPR textu a identifikaci správce */}
          Tato stránka je zatím placeholder. Před spuštěním doplním kompletní
          informace o správci osobních údajů, účelu zpracování, době uchování a
          vašich právech.
        </p>
        <p>
          Do té doby platí, že údaje z poptávkového formuláře používám pouze k
          vyřízení poptávky a další komunikaci ohledně návrhu webu.
        </p>
        <p>
          Kontakt:{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline">
            {site.email}
          </a>
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-sm text-copper">
        ← Zpět na úvod
      </Link>
    </main>
  );
}

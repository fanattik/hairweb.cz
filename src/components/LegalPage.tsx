import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  eyebrow = "Právní",
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <div className="legal-content mt-8 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base [&_h2]:mt-10 [&_h2]:font-[family-name:var(--font-fraunces)] [&_h2]:text-xl [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-ink [&_a]:underline [&_a]:decoration-copper/40 [&_a]:underline-offset-2 hover:[&_a]:decoration-copper">
        {children}
      </div>
      <Link href="/" className="mt-10 inline-block text-sm text-copper">
        ← Zpět na úvod
      </Link>
    </main>
  );
}

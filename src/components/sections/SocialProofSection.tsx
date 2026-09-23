import { socialProofSalons } from "@/lib/site";

/**
 * Shows only when real salon references exist in `socialProofSalons`.
 * Never invents logos or client names.
 */
export function SocialProofSection() {
  if (socialProofSalons.length === 0) return null;

  return (
    <section
      className="border-b border-line bg-foam px-5 py-10 sm:px-8"
      aria-label="Důvěra salonů"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
          Důvěřují nám salony po celé České republice
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {socialProofSalons.map((salon) => (
            <li key={salon.name}>
              {salon.href ? (
                <a
                  href={salon.href}
                  className="font-display text-lg text-ink/70 transition hover:text-ink"
                  target="_blank"
                  rel="noreferrer"
                >
                  {salon.name}
                </a>
              ) : (
                <span className="font-display text-lg text-ink/70">
                  {salon.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

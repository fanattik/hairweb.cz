import { Reveal } from "@/components/Reveal";
import { TrackedCta } from "@/components/TrackedCta";

const vendors = [
  "Webař",
  "SEO",
  "Booking",
  "Google",
  "Social",
  "Marketing",
] as const;

export function PartnerSection() {
  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2.5rem,6vw,6rem)] lg:grid-cols-2">
        <Reveal className="flex flex-col gap-7">
          <p className="eyebrow">Místo chaosu jeden partner</p>
          <h2 className="display-title text-[clamp(2.75rem,6vw,5.75rem)]">
            Nejste na to sami.
          </h2>
          <p className="max-w-[520px] text-[19px] leading-relaxed text-[#3d3b37]">
            Místo několika dodavatelů, agentur a nástrojů máte jednoho partnera,
            který přebírá odpovědnost za váš online svět.
          </p>
          <div>
            <TrackedCta
              href="#audit"
              variant="secondary"
              event="final_cta_click"
              eventPayload={{ location: "partner" }}
              sourceDetail="managed"
            >
              Chci jednoho partnera{" "}
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </TrackedCta>
          </div>
        </Reveal>

        <Reveal delay={1} className="flex flex-wrap items-center gap-5">
          <div className="flex min-w-[200px] flex-1 flex-wrap gap-2">
            {vendors.map((vendor) => (
              <span
                key={vendor}
                className="rounded-full border border-dashed border-ink/25 px-[18px] py-3 text-[15px] text-ink-soft"
              >
                {vendor}
              </span>
            ))}
          </div>
          <span className="text-[32px] text-copper" aria-hidden>
            →
          </span>
          <div className="flex aspect-square w-[220px] flex-col items-center justify-center gap-2 rounded-full bg-ink text-foam">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.14em] text-ink-muted">
              PARTNER
            </p>
            <p className="text-[26px]">
              <span className="font-light">HAIR</span>
              <span className="font-extrabold">WEB</span>
            </p>
            <p className="text-[13px] text-[#bdbab3]">→ Váš salon</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

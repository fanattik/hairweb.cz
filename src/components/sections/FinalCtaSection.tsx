"use client";

import { CtaButton } from "@/components/CtaButton";
import { Reveal } from "@/components/Reveal";
import { trackEvent } from "@/lib/analytics";
import { setSourceDetail } from "@/lib/attribution";

export function FinalCtaSection() {
  return (
    <section className="bg-ink px-5 py-16 text-foam sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl lg:text-[2.65rem]">
            Podívejte se, jak by mohl vypadat váš nový web.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foam/75 sm:text-lg">
            Pošlete mi svůj současný web nebo Instagram. Podívám se na něj a
            navrhnu, jakým směrem bych vaši online prezentaci posunul.
          </p>
          <div className="mt-8 flex justify-center">
            <CtaButton
              href="#poptavka"
              onClick={() => {
                setSourceDetail("final_cta");
                trackEvent("final_cta_click");
              }}
            >
              Chci nezávazný návrh
            </CtaButton>
          </div>
          <p className="mt-4 text-sm text-foam/55">
            Bez závazků. Bez obchodního nátlaku.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

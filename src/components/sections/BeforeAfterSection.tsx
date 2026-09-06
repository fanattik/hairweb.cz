"use client";

import Image from "next/image";
import { useState } from "react";
import { BrowserMockup } from "@/components/BrowserMockup";
import { Reveal } from "@/components/Reveal";

function BeforePreview() {
  return (
    <div className="absolute inset-0 bg-[#d5d0c8] p-5 text-[#2a2a2a] sm:p-7">
      <div className="flex items-center justify-between border-b border-black/15 pb-3 text-[11px] uppercase tracking-wide opacity-55">
        <span>Vítejte</span>
        <span>Menu · Kontakt</span>
      </div>
      <p className="mt-6 text-center text-xl font-bold leading-tight sm:text-2xl">
        KADEŘNICTVÍ
        <br />
        U NÁS
      </p>
      <p className="mx-auto mt-4 max-w-xs text-center text-[11px] leading-relaxed opacity-65 sm:text-xs">
        Vítejte na našich stránkách. Nabízíme širokou škálu služeb pro všechny
        věkové kategorie.
      </p>
      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
        <div className="aspect-square bg-[#b7b0a6]" />
        <div className="aspect-square bg-[#c4bdb2]" />
        <div className="aspect-square bg-[#aea79d]" />
      </div>
      <p className="mt-6 text-center text-[10px] opacity-45">
        kontakt: volejte · rezervace přes Facebook
      </p>
      <div className="mx-auto mt-4 h-8 w-32 border border-black/20 text-center text-[10px] leading-8 opacity-55">
        více informací
      </div>
    </div>
  );
}

function AfterPreview() {
  return (
    <div className="absolute inset-0 bg-[#f6f4f1] text-ink">
      <div className="flex items-center justify-between px-5 py-4 text-[11px] sm:px-6">
        <span className="font-[family-name:var(--font-fraunces)] text-sm tracking-wide">
          Studio Nora
        </span>
        <span className="bg-ink px-3 py-1.5 text-[10px] tracking-wide text-foam">
          Rezervovat
        </span>
      </div>
      <div className="relative mx-5 aspect-[16/8] overflow-hidden bg-stone sm:mx-6">
        <Image
          src="/images/before-after-salon.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
        <p className="absolute bottom-4 left-4 font-[family-name:var(--font-fraunces)] text-lg text-foam sm:text-xl">
          Střihy, barva, péče
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 py-4 text-[10px] text-ink-soft sm:px-6 sm:text-[11px]">
        <div>
          <p className="font-medium text-ink">Služby</p>
          <p className="mt-1">Jasný ceník</p>
        </div>
        <div>
          <p className="font-medium text-ink">Galerie</p>
          <p className="mt-1">Vaše práce</p>
        </div>
        <div>
          <p className="font-medium text-ink">Tým</p>
          <p className="mt-1">Kdo stříhá</p>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  const [mode, setMode] = useState<"before" | "after">("after");

  return (
    <section className="border-y border-line bg-mist px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Rozdíl
          </p>
          <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Běžný web salonu vs. HAIRWEB
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Nejde o víc barev. Jde o to, aby klient hned pochopil nabídku a
            věděl, kam kliknout.
          </p>
        </Reveal>

        <div className="mt-7 flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMode("before")}
            className={`min-h-11 flex-1 px-3 text-sm transition ${
              mode === "before"
                ? "bg-ink text-foam"
                : "border border-line bg-foam text-ink"
            }`}
            aria-pressed={mode === "before"}
          >
            Před
          </button>
          <button
            type="button"
            onClick={() => setMode("after")}
            className={`min-h-11 flex-1 px-3 text-sm transition ${
              mode === "after"
                ? "bg-ink text-foam"
                : "border border-line bg-foam text-ink"
            }`}
            aria-pressed={mode === "after"}
          >
            Po Hairweb
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-2 lg:gap-8">
          <Reveal
            className={mode === "before" ? "block" : "hidden lg:block"}
            delay={1}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Před
            </p>
            <BrowserMockup
              url="stary-salon.cz"
              tone="muted"
              aspectClass="aspect-[16/11]"
            >
              <BeforePreview />
            </BrowserMockup>
            <p className="mt-4 text-sm text-ink-soft">
              Zastaralý design · slabá hierarchie · nevýrazná rezervace
            </p>
          </Reveal>

          <Reveal
            className={mode === "after" ? "block" : "hidden lg:block"}
            delay={2}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              Po Hairweb
            </p>
            <BrowserMockup url="studio-nora.cz" aspectClass="aspect-[16/11]">
              <AfterPreview />
            </BrowserMockup>
            <p className="mt-4 text-sm text-ink-soft">
              Moderní prezentace · jasné služby · výrazná rezervace · mobile-first
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

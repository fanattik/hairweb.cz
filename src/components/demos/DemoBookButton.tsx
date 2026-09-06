"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";

type DemoBookButtonProps = {
  children: ReactNode;
  className?: string;
  salonName: string;
  "aria-label"?: string;
};

export function DemoBookButton({
  children,
  className,
  salonName,
  "aria-label": ariaLabel,
}: DemoBookButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-white p-6 text-[#1a1714] shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a5b3c]">
              Ukázkový web
            </p>
            <h2
              id={titleId}
              className="mt-2 font-[family-name:var(--font-demo-display)] text-2xl tracking-tight"
            >
              Rezervace tu není aktivní
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4a4540]">
              {salonName} je fiktivní koncept připravený jako ukázka. Tlačítka a
              navigace fungují, ale online rezervace není napojená.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/#poptavka"
                className="inline-flex items-center justify-center rounded-full bg-[#1a1714] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1714]/90"
              >
                Chci podobný web
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[#1a1714]/15 px-5 py-2.5 text-sm font-medium transition hover:bg-[#f4f5f3]"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

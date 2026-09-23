"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics";
import type { SalonAuditRow } from "@/lib/audit/types";

type Props = {
  audit: SalonAuditRow;
  className?: string;
};

export function AuditDiscussCta({ audit, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(audit.name || "");
  const [email, setEmail] = useState(audit.email || "");
  const [phone, setPhone] = useState(audit.phone || "");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const formStartedAt = useRef(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    formStartedAt.current = Date.now();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "loading") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, status]);

  function openModal() {
    trackEvent("audit_cta_clicked", {
      audit_id: audit.id,
      location: "result",
    });
    setStatus("idle");
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const res = await fetch(`/api/audit/${audit.id}/discuss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
          companyWebsite: honeypot,
          formStartedAt: formStartedAt.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "Něco se nepovedlo. Zkuste to znovu.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Něco se nepovedlo. Zkuste to znovu.");
    }
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-ink/55 p-4 sm:items-center sm:p-6"
            role="presentation"
            onClick={() => {
              if (status !== "loading") setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="my-auto w-full max-w-lg rounded-[28px] bg-foam p-6 text-ink shadow-[var(--shadow-soft)] sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {status === "done" ? (
                <div className="flex flex-col gap-4">
                  <p className="eyebrow">Hotovo</p>
                  <h2
                    id={titleId}
                    className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight"
                  >
                    Díky — ozveme se vám
                  </h2>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    Dostali jsme zprávu, že chcete probrat výsledek auditu pro{" "}
                    {audit.salon_name}. Ozveme se na e-mail nebo telefon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-[15px] font-medium text-foam"
                  >
                    Zavřít
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                  <div>
                    <p className="eyebrow mb-1.5">Konzultace</p>
                    <h2
                      id={titleId}
                      className="text-[clamp(1.4rem,2.8vw,1.85rem)] font-semibold tracking-tight"
                    >
                      Domluvit konzultaci
                    </h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                      Napište nám — projdeme spolu výsledek auditu a co má smysl
                      řešit jako první.
                    </p>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Jméno *</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="min-h-11 rounded-[14px] border border-ink/10 bg-mist px-4 text-[15px] outline-none focus:border-copper"
                      autoComplete="name"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">E-mail *</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="min-h-11 rounded-[14px] border border-ink/10 bg-mist px-4 text-[15px] outline-none focus:border-copper"
                      autoComplete="email"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      Telefon{" "}
                      <span className="font-normal text-ink-muted">
                        (nepovinné)
                      </span>
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="min-h-11 rounded-[14px] border border-ink/10 bg-mist px-4 text-[15px] outline-none focus:border-copper"
                      autoComplete="tel"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      Zpráva{" "}
                      <span className="font-normal text-ink-muted">
                        (nepovinné)
                      </span>
                    </span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Např. chci projít doporučení k webu a rezervacím…"
                      className="rounded-[14px] border border-ink/10 bg-mist px-4 py-2.5 text-[15px] outline-none focus:border-copper"
                    />
                  </label>

                  {/* honeypot — keep off autofill paths */}
                  <input
                    type="text"
                    name="fax_number_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    tabIndex={-1}
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                    aria-hidden
                  />

                  {error ? (
                    <p className="text-sm text-[oklch(0.5_0.18_27)]">{error}</p>
                  ) : null}

                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={status === "loading"}
                      onClick={() => setOpen(false)}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-5 text-[15px] font-medium text-ink"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-6 text-[15px] font-medium text-white disabled:opacity-60"
                    >
                      {status === "loading" ? "Odesílám…" : "Odeslat zprávu →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-8 py-[22px] text-[17px] font-medium tracking-tight text-foam transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-ink/90 ${className}`}
      >
        Domluvit konzultaci{" "}
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </button>
      {modal}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/leads/types";
import {
  HAIRWEB_PACKAGES,
  OUTREACH_TEMPLATES,
  type HairwebPackageId,
  type OutreachTemplateKey,
} from "@/lib/leads/outreach-templates";

const field =
  "border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper w-full";

type EmailRow = {
  id: string;
  created_at: string;
  to_email: string;
  subject: string;
  body_text: string;
  template_key: string | null;
  status: string;
  error: string | null;
};

export function LeadOutreachPanel({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [toEmail, setToEmail] = useState(lead.email || "");
  const [templateKey, setTemplateKey] = useState<OutreachTemplateKey>("no_website");
  const [packageId, setPackageId] = useState<HairwebPackageId>("start");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [history, setHistory] = useState<EmailRow[]>([]);
  const [source, setSource] = useState<"template" | "ai" | null>(null);

  async function loadHistory() {
    const response = await fetch(`/api/admin/leads/${lead.id}/send-email`);
    if (!response.ok) return;
    const data = (await response.json()) as { emails?: EmailRow[] };
    setHistory(data.emails || []);
  }

  async function loadInitial() {
    setLoadingDraft(true);
    setError(null);
    const response = await fetch(`/api/admin/leads/${lead.id}/outreach-draft`);
    const data = (await response.json()) as {
      error?: string;
      draft?: {
        subject: string;
        body: string;
        templateKey: OutreachTemplateKey;
        packageId?: HairwebPackageId;
      };
      suggestedKey?: OutreachTemplateKey;
      suggestedPackage?: HairwebPackageId;
      aiAvailable?: boolean;
      emailConfigured?: boolean;
    };
    setLoadingDraft(false);
    if (!response.ok) {
      setError(data.error || "Nepodařilo se načíst draft.");
      return;
    }
    if (data.suggestedKey) setTemplateKey(data.suggestedKey);
    if (data.suggestedPackage) setPackageId(data.suggestedPackage);
    if (data.draft) {
      setSubject(data.draft.subject);
      setBody(data.draft.body);
      setTemplateKey(data.draft.templateKey);
      if (data.draft.packageId) setPackageId(data.draft.packageId);
      setSource("template");
    }
    setAiAvailable(Boolean(data.aiAvailable));
    setEmailConfigured(data.emailConfigured !== false);
  }

  useEffect(() => {
    void loadInitial();
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  async function reloadDraft(next: {
    templateKey?: OutreachTemplateKey;
    packageId?: HairwebPackageId;
    mode?: "template" | "ai";
  }) {
    const key = next.templateKey ?? templateKey;
    const pkg = next.packageId ?? packageId;
    const mode = next.mode ?? "template";
    setTemplateKey(key);
    setPackageId(pkg);
    setLoadingDraft(true);
    setError(null);
    const response = await fetch(`/api/admin/leads/${lead.id}/outreach-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, templateKey: key, packageId: pkg }),
    });
    const data = (await response.json()) as {
      error?: string;
      draft?: {
        subject: string;
        body: string;
        templateKey: OutreachTemplateKey;
        packageId?: HairwebPackageId;
        source?: string;
      };
    };
    setLoadingDraft(false);
    if (!response.ok) {
      setError(data.error || "Draft se nepovedl.");
      return;
    }
    if (data.draft) {
      setSubject(data.draft.subject);
      setBody(data.draft.body);
      setTemplateKey(data.draft.templateKey);
      if (data.draft.packageId) setPackageId(data.draft.packageId);
      setSource(data.draft.source === "ai" || mode === "ai" ? "ai" : "template");
      setMessage(
        mode === "ai"
          ? data.draft.source === "ai"
            ? "AI draft připraven — zkontroluj a odešli."
            : "AI nedostupné, použita šablona."
          : "Šablona načtena — uprav a odešli.",
      );
    }
  }

  async function send() {
    setSending(true);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/admin/leads/${lead.id}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail: toEmail || undefined,
        subject,
        body,
        templateKey,
      }),
    });
    const data = (await response.json()) as { error?: string; toEmail?: string };
    setSending(false);
    if (!response.ok) {
      setError(data.error || "Odeslání selhalo.");
      return;
    }
    setMessage(`Odesláno na ${data.toEmail}.`);
    await loadHistory();
    router.refresh();
  }

  if (!lead.email && !toEmail) {
    // still allow typing email
  }

  return (
    <section className="border border-line bg-foam p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Odeslat e-mail
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Personalizovaný outreach přímo z CRM přes Resend.
          </p>
        </div>
        {source ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {source === "ai" ? "AI draft" : "Šablona"}
          </span>
        ) : null}
      </div>

      {!emailConfigured ? (
        <p className="mt-3 text-sm text-copper-deep">
          Doplň RESEND_API_KEY a HAIRWEB_FROM_EMAIL ve Vercel / .env.local.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Komu</span>
          <input
            type="email"
            className={field}
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="email@salon.cz"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Šablona</span>
          <select
            className={field}
            value={templateKey}
            onChange={(e) =>
              void reloadDraft({
                templateKey: e.target.value as OutreachTemplateKey,
              })
            }
            disabled={loadingDraft || sending}
          >
            {OUTREACH_TEMPLATES.map((tpl) => (
              <option key={tpl.key} value={tpl.key}>
                {tpl.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Balíček</span>
          <select
            className={field}
            value={packageId}
            onChange={(e) =>
              void reloadDraft({
                packageId: e.target.value as HairwebPackageId,
              })
            }
            disabled={loadingDraft || sending}
          >
            {(Object.keys(HAIRWEB_PACKAGES) as HairwebPackageId[]).map((id) => {
              const pkg = HAIRWEB_PACKAGES[id];
              return (
                <option key={id} value={id}>
                  {pkg.name} — {pkg.price} ({pkg.summary})
                </option>
              );
            })}
          </select>
          <span className="text-xs text-ink-soft">
            Mail je v přirozeném stylu (cena + rozsah), bez odrážek balíčku.
            Jednostránka → 9 900 Kč, SEO/vícestránka → 14 900 Kč.
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loadingDraft || sending}
            onClick={() => void reloadDraft({ mode: "template" })}
            className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
          >
            Obnovit šablonu
          </button>
          <button
            type="button"
            disabled={loadingDraft || sending || !aiAvailable}
            onClick={() => void reloadDraft({ mode: "ai" })}
            className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
            title={
              aiAvailable
                ? "Vygenerovat personalizovaný draft přes OpenAI"
                : "Chybí OPENAI_API_KEY"
            }
          >
            {loadingDraft ? "Generuji…" : "AI personalizace"}
          </button>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Předmět</span>
          <input
            className={field}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Zpráva</span>
          <textarea
            rows={12}
            className={field}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <button
          type="button"
          disabled={
            sending ||
            loadingDraft ||
            !subject.trim() ||
            !body.trim() ||
            !toEmail.trim()
          }
          onClick={() => void send()}
          className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-50"
        >
          {sending ? "Odesílám…" : "Odeslat e-mail"}
        </button>

        {message ? <p className="text-sm text-ink">{message}</p> : null}
        {error ? <p className="text-sm text-copper-deep">{error}</p> : null}
      </div>

      {history.length ? (
        <div className="mt-6 border-t border-line pt-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Historie odeslaných
          </h3>
          <ul className="mt-3 space-y-3">
            {history.map((row) => (
              <li key={row.id} className="border border-line bg-mist p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{row.subject}</p>
                  <span
                    className={
                      row.status === "sent"
                        ? "text-xs text-emerald-700"
                        : "text-xs text-copper-deep"
                    }
                  >
                    {row.status === "sent" ? "Odesláno" : "Chyba"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  {new Date(row.created_at).toLocaleString("cs-CZ")} ·{" "}
                  {row.to_email}
                </p>
                <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-sans text-xs text-ink-soft">
                  {row.body_text}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

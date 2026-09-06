"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OutboundLeadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      salonName: String(form.get("salonName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      website: String(form.get("website") || ""),
      score: form.get("score") ? Number(form.get("score")) : undefined,
      notes: String(form.get("notes") || ""),
    };

    const response = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Vytvoření leadu se nepovedlo.");
      return;
    }

    const data = (await response.json()) as { id: string };
    router.push(`/admin/leads/${data.id}`);
    router.refresh();
  }

  const field =
    "border border-line bg-mist px-3 py-2.5 text-sm outline-none focus:border-copper";

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-4 border border-line bg-foam p-6">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Kontakt / jméno</span>
        <input name="name" required className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Salon</span>
        <input name="salonName" className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">E-mail</span>
        <input name="email" type="email" required className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Telefon</span>
        <input name="phone" className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Web / Instagram</span>
        <input name="website" required className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Score</span>
        <input name="score" type="number" min={0} max={100} className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Poznámka</span>
        <textarea name="notes" rows={4} className={field} />
      </label>
      {error ? <p className="text-sm text-copper-deep">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
      >
        {loading ? "Ukládám…" : "Vytvořit outbound lead"}
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/leads/types";
import { LEAD_STATUSES } from "@/lib/leads/types";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function LeadCrmForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [score, setScore] = useState(lead.score?.toString() ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [lastContact, setLastContact] = useState(
    toLocalInput(lead.last_contact_at),
  );
  const [nextFollowup, setNextFollowup] = useState(
    toLocalInput(lead.next_followup_at),
  );
  const [wonValue, setWonValue] = useState(
    lead.won_value != null ? String(lead.won_value) : "",
  );
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        score: score === "" ? null : Number(score),
        notes: notes || null,
        last_contact_at: toIsoOrNull(lastContact),
        next_followup_at: toIsoOrNull(nextFollowup),
        won_value: wonValue === "" ? null : Number(wonValue),
        lost_reason: lostReason || null,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      setMessage("Uložení se nepovedlo.");
      return;
    }

    setMessage("Uloženo.");
    router.refresh();
  }

  const field =
    "border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className={field}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Score (0–100)</span>
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Poznámky</span>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Poslední kontakt</span>
        <input
          type="datetime-local"
          value={lastContact}
          onChange={(e) => setLastContact(e.target.value)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Další follow-up</span>
        <input
          type="datetime-local"
          value={nextFollowup}
          onChange={(e) => setNextFollowup(e.target.value)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Won value (Kč)</span>
        <input
          type="number"
          min={0}
          step="1"
          value={wonValue}
          onChange={(e) => setWonValue(e.target.value)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Důvod lost</span>
        <input
          value={lostReason}
          onChange={(e) => setLostReason(e.target.value)}
          className={field}
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
      >
        {saving ? "Ukládám…" : "Uložit CRM"}
      </button>
      {message ? <p className="text-sm text-ink-soft">{message}</p> : null}
    </form>
  );
}

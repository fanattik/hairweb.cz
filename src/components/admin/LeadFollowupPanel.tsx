"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  deriveFollowupStatus,
  formatPragueDate,
  formatPragueDateTime,
  type ContactType,
} from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

const field =
  "border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper w-full";

type Activity = {
  id: string;
  created_at: string;
  activity_type: string;
  summary: string;
};

function toLocalInput(iso: string | null) {
  if (!iso) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string) {
  return new Date(value).toISOString();
}

const STATUS_CS: Record<string, string> = {
  NOT_STARTED: "Nezačato",
  SCHEDULED: "Naplánováno",
  DUE: "Dnes",
  OVERDUE: "Po termínu",
  COMPLETED: "Dokončeno",
  PAUSED: "Pozastaveno",
  STOPPED: "Zastaveno",
};

export function LeadFollowupPanel({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [contactType, setContactType] = useState<ContactType>("email");
  const [contactedAt, setContactedAt] = useState(toLocalInput(null));
  const [note, setNote] = useState("");
  const [isFollowup, setIsFollowup] = useState(
    Boolean(lead.last_contact_at) && (lead.followup_count ?? 0) < 3,
  );
  const [editNext, setEditNext] = useState(toLocalInput(lead.next_followup_at));
  const [customSnooze, setCustomSnooze] = useState("");

  const derived = deriveFollowupStatus({
    nextFollowupAt: lead.next_followup_at,
    followupCount: lead.followup_count ?? 0,
    followupPaused: lead.followup_paused,
    followupStopped: lead.followup_stopped,
    leadStatus: lead.status,
  });

  async function loadActivities() {
    const res = await fetch(`/api/admin/leads/${lead.id}/followup`);
    if (!res.ok) return;
    const data = (await res.json()) as { activities?: Activity[] };
    setActivities(data.activities || []);
  }

  useEffect(() => {
    void loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id, lead.next_followup_at, lead.followup_count, lead.last_contact_at]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/admin/leads/${lead.id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Akce selhala");
      return false;
    }
    router.refresh();
    await loadActivities();
    return true;
  }

  async function submitContact() {
    const ok = await post({
      action: "contact",
      contactType,
      contactedAt: localInputToIso(contactedAt),
      note: note.trim() || null,
      isFollowup,
    });
    if (ok) {
      setShowContact(false);
      setNote("");
      setMessage("Kontakt zaznamenán.");
    }
  }

  return (
    <section className="border border-line bg-foam p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Follow-up
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Stav: {STATUS_CS[derived] || derived}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setContactedAt(toLocalInput(null));
            setIsFollowup(
              Boolean(lead.last_contact_at) && (lead.followup_count ?? 0) < 3,
            );
            setShowContact(true);
          }}
          className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-50"
        >
          Zaznamenat kontakt
        </button>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="border border-line bg-mist p-3">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Další kontakt
          </dt>
          <dd className="mt-1 font-medium">
            {formatPragueDate(lead.next_followup_at)}
          </dd>
        </div>
        <div className="border border-line bg-mist p-3">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Follow-up
          </dt>
          <dd className="mt-1 font-medium">
            {Math.min(lead.followup_count ?? 0, 3)} / 3
          </dd>
        </div>
        <div className="border border-line bg-mist p-3 sm:col-span-2">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Poslední kontakt
          </dt>
          <dd className="mt-1 font-medium">
            {lead.last_contact_at
              ? `${formatPragueDateTime(lead.last_contact_at)}${
                  lead.last_contact_type
                    ? ` – ${CONTACT_TYPE_LABELS[lead.last_contact_type]}`
                    : ""
                }`
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => setShowSnooze(true)}
          className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
        >
          Odložit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditNext(toLocalInput(lead.next_followup_at));
            setShowEdit(true);
          }}
          className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
        >
          Upravit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void post({
              action: "pause",
              paused: !lead.followup_paused,
            }).then((ok) => {
              if (ok) {
                setMessage(
                  lead.followup_paused
                    ? "Follow-up znovu aktivován."
                    : "Follow-up pozastaven.",
                );
              }
            })
          }
          className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
        >
          {lead.followup_paused ? "Obnovit" : "Pozastavit"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void post({ action: "reply" }).then((ok) => {
              if (ok) setMessage("Lead označen jako odpověděl.");
            })
          }
          className="border border-copper/40 px-3 py-2 text-sm text-copper-deep hover:border-copper disabled:opacity-50"
        >
          Lead odpověděl
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void post({ action: "schedule", nextFollowupAt: null }).then(
              (ok) => {
                if (ok) setMessage("Follow-up zrušen.");
              },
            )
          }
          className="border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink disabled:opacity-50"
        >
          Zrušit follow-up
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-ink">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-copper-deep">{error}</p> : null}

      {showContact ? (
        <div className="mt-4 border border-line bg-mist p-4">
          <h3 className="text-sm font-medium">Zaznamenat kontakt</h3>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span>Typ kontaktu</span>
              <select
                className={field}
                value={contactType}
                onChange={(e) => setContactType(e.target.value as ContactType)}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CONTACT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span>Datum a čas</span>
              <input
                type="datetime-local"
                className={field}
                value={contactedAt}
                onChange={(e) => setContactedAt(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Poznámka (volitelné)</span>
              <textarea
                rows={2}
                className={field}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFollowup}
                onChange={(e) => setIsFollowup(e.target.checked)}
              />
              Jedná se o follow-up
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void submitContact()}
                className="bg-ink px-4 py-2 text-sm text-foam disabled:opacity-50"
              >
                Uložit
              </button>
              <button
                type="button"
                onClick={() => setShowContact(false)}
                className="border border-line px-4 py-2 text-sm"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSnooze ? (
        <div className="mt-4 border border-line bg-mist p-4">
          <h3 className="text-sm font-medium">Odložit follow-up</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["tomorrow", "Zítra"],
                ["plus3", "+3 dny"],
                ["plus7", "+7 dní"],
              ] as const
            ).map(([preset, label]) => (
              <button
                key={preset}
                type="button"
                disabled={busy}
                onClick={() =>
                  void post({ action: "snooze", preset }).then((ok) => {
                    if (ok) {
                      setShowSnooze(false);
                      setMessage(`Odloženo: ${label}`);
                    }
                  })
                }
                className="border border-line px-3 py-2 text-sm hover:border-ink disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-3 grid gap-1 text-sm">
            <span>Vlastní datum</span>
            <input
              type="datetime-local"
              className={field}
              value={customSnooze}
              onChange={(e) => setCustomSnooze(e.target.value)}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy || !customSnooze}
              onClick={() =>
                void post({
                  action: "snooze",
                  customAt: localInputToIso(customSnooze),
                }).then((ok) => {
                  if (ok) {
                    setShowSnooze(false);
                    setMessage("Odloženo na vlastní datum.");
                  }
                })
              }
              className="bg-ink px-4 py-2 text-sm text-foam disabled:opacity-50"
            >
              Nastavit
            </button>
            <button
              type="button"
              onClick={() => setShowSnooze(false)}
              className="border border-line px-4 py-2 text-sm"
            >
              Zavřít
            </button>
          </div>
        </div>
      ) : null}

      {showEdit ? (
        <div className="mt-4 border border-line bg-mist p-4">
          <h3 className="text-sm font-medium">Upravit další kontakt</h3>
          <label className="mt-3 grid gap-1 text-sm">
            <span>next_followup_at</span>
            <input
              type="datetime-local"
              className={field}
              value={editNext}
              onChange={(e) => setEditNext(e.target.value)}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy || !editNext}
              onClick={() =>
                void post({
                  action: "schedule",
                  nextFollowupAt: localInputToIso(editNext),
                }).then((ok) => {
                  if (ok) {
                    setShowEdit(false);
                    setMessage("Termín upraven.");
                  }
                })
              }
              className="bg-ink px-4 py-2 text-sm text-foam disabled:opacity-50"
            >
              Uložit
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="border border-line px-4 py-2 text-sm"
            >
              Zavřít
            </button>
          </div>
        </div>
      ) : null}

      {activities.length ? (
        <div className="mt-6 border-t border-line pt-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Historie follow-upů
          </h3>
          <ul className="mt-3 space-y-2">
            {activities.slice(0, 12).map((row) => (
              <li key={row.id} className="text-sm">
                <span className="text-xs text-ink-soft">
                  {formatPragueDateTime(row.created_at)}
                </span>
                <p className="text-ink">{row.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

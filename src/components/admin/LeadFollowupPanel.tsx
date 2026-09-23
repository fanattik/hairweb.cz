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
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";

const eyebrow =
  "font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

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
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={eyebrow}>Follow-up</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Stav: {STATUS_CS[derived] || derived}
          </p>
        </div>
        <AdminButton
          type="button"
          disabled={busy}
          onClick={() => {
            setContactedAt(toLocalInput(null));
            setIsFollowup(
              Boolean(lead.last_contact_at) && (lead.followup_count ?? 0) < 3,
            );
            setShowContact(true);
          }}
        >
          Zaznamenat kontakt
        </AdminButton>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-[14px] bg-mist p-3">
          <dt className={eyebrow}>Další kontakt</dt>
          <dd className="mt-1 font-medium">
            {formatPragueDate(lead.next_followup_at)}
          </dd>
        </div>
        <div className="rounded-[14px] bg-mist p-3">
          <dt className={eyebrow}>Follow-up</dt>
          <dd className="mt-1 font-medium">
            {Math.min(lead.followup_count ?? 0, 3)} / 3
          </dd>
        </div>
        <div className="rounded-[14px] bg-mist p-3 sm:col-span-2">
          <dt className={eyebrow}>Poslední kontakt</dt>
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
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => setShowSnooze(true)}
        >
          Odložit
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setEditNext(toLocalInput(lead.next_followup_at));
            setShowEdit(true);
          }}
        >
          Upravit
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
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
        >
          {lead.followup_paused ? "Obnovit" : "Pozastavit"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="accent"
          disabled={busy}
          onClick={() =>
            void post({ action: "reply" }).then((ok) => {
              if (ok) setMessage("Lead označen jako odpověděl.");
            })
          }
        >
          Lead odpověděl
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() =>
            void post({ action: "schedule", nextFollowupAt: null }).then(
              (ok) => {
                if (ok) setMessage("Follow-up zrušen.");
              },
            )
          }
        >
          Zrušit follow-up
        </AdminButton>
      </div>

      {message ? <p className="mt-3 text-sm text-ink">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-copper-deep">{error}</p> : null}

      {showContact ? (
        <div className="mt-4 rounded-[14px] bg-mist p-4">
          <h3 className="text-sm font-medium">Zaznamenat kontakt</h3>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span>Typ kontaktu</span>
              <AdminSelect
                value={contactType}
                onChange={(e) => setContactType(e.target.value as ContactType)}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CONTACT_TYPE_LABELS[t]}
                  </option>
                ))}
              </AdminSelect>
            </label>
            <label className="grid gap-1 text-sm">
              <span>Datum a čas</span>
              <AdminInput
                type="datetime-local"
                value={contactedAt}
                onChange={(e) => setContactedAt(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Poznámka (volitelné)</span>
              <AdminTextarea
                rows={2}
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
              <AdminButton
                type="button"
                disabled={busy}
                onClick={() => void submitContact()}
              >
                Uložit
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => setShowContact(false)}
              >
                Zrušit
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {showSnooze ? (
        <div className="mt-4 rounded-[14px] bg-mist p-4">
          <h3 className="text-sm font-medium">Odložit follow-up</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["tomorrow", "Zítra"],
                ["plus3", "+3 dny"],
                ["plus7", "+7 dní"],
              ] as const
            ).map(([preset, label]) => (
              <AdminButton
                key={preset}
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  void post({ action: "snooze", preset }).then((ok) => {
                    if (ok) {
                      setShowSnooze(false);
                      setMessage(`Odloženo: ${label}`);
                    }
                  })
                }
              >
                {label}
              </AdminButton>
            ))}
          </div>
          <label className="mt-3 grid gap-1 text-sm">
            <span>Vlastní datum</span>
            <AdminInput
              type="datetime-local"
              value={customSnooze}
              onChange={(e) => setCustomSnooze(e.target.value)}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <AdminButton
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
            >
              Nastavit
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setShowSnooze(false)}
            >
              Zavřít
            </AdminButton>
          </div>
        </div>
      ) : null}

      {showEdit ? (
        <div className="mt-4 rounded-[14px] bg-mist p-4">
          <h3 className="text-sm font-medium">Upravit další kontakt</h3>
          <label className="mt-3 grid gap-1 text-sm">
            <span>next_followup_at</span>
            <AdminInput
              type="datetime-local"
              value={editNext}
              onChange={(e) => setEditNext(e.target.value)}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <AdminButton
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
            >
              Uložit
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setShowEdit(false)}
            >
              Zavřít
            </AdminButton>
          </div>
        </div>
      ) : null}

      {activities.length ? (
        <div className="mt-6 border-t border-ink/8 pt-4">
          <h3 className={eyebrow}>Historie follow-upů</h3>
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
    </AdminCard>
  );
}

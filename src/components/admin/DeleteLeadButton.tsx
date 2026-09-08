"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  leadId: string;
  leadLabel: string;
};

/**
 * Hard-delete a single lead from the detail page (with confirm step).
 */
export function DeleteLeadButton({ leadId, leadLabel }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Smazání selhalo.");
        setBusy(false);
        return;
      }
      router.push("/admin/leads");
      router.refresh();
    } catch {
      setError("Smazání selhalo.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="border border-copper/40 px-3 py-2 text-copper-deep hover:border-copper-deep disabled:opacity-50"
      >
        Smazat lead
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <p className="max-w-xs text-right text-xs text-ink-soft">
        Opravdu smazat <span className="font-medium text-ink">{leadLabel}</span>?
        Tuto akci nelze vrátit.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="border border-line px-3 py-2 hover:border-ink disabled:opacity-50"
        >
          Zrušit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="bg-copper-deep px-3 py-2 text-foam hover:bg-copper disabled:opacity-50"
        >
          {busy ? "Mazání…" : "Ano, smazat"}
        </button>
      </div>
      {error ? <p className="text-xs text-copper-deep">{error}</p> : null}
    </div>
  );
}

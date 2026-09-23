"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminButton } from "@/components/admin/ui";
import { getLeadsListUrl } from "@/lib/admin/leads-list-url";

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
      router.push(getLeadsListUrl());
      router.refresh();
    } catch {
      setError("Smazání selhalo.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <AdminButton type="button" variant="danger" onClick={() => setConfirming(true)}>
        Smazat lead
      </AdminButton>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <p className="max-w-xs text-right text-xs text-ink-soft">
        Opravdu smazat <span className="font-medium text-ink">{leadLabel}</span>?
        Tuto akci nelze vrátit.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <AdminButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          Zrušit
        </AdminButton>
        <AdminButton type="button" variant="danger" disabled={busy} onClick={handleDelete}>
          {busy ? "Mazání…" : "Ano, smazat"}
        </AdminButton>
      </div>
      {error ? <p className="text-xs text-copper-deep">{error}</p> : null}
    </div>
  );
}

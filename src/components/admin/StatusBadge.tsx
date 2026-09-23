import { STATUS_LABELS, type LeadStatus } from "@/lib/leads/types";

/** Ink/copper/mist system — limited semantic accents for won/lost/new. */
const styles: Record<LeadStatus, string> = {
  new: "bg-ink text-foam",
  contacted: "bg-mist text-ink border border-ink/10",
  interested: "bg-copper/15 text-copper-deep",
  meeting: "bg-copper text-white",
  proposal: "bg-ink/80 text-foam",
  won: "bg-[oklch(0.55_0.12_150)] text-white",
  lost: "bg-[oklch(0.5_0.14_25)] text-white",
  skip: "bg-stone text-ink-soft",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] uppercase ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

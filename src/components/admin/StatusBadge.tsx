import { STATUS_LABELS, type LeadStatus } from "@/lib/leads/types";

const styles: Record<LeadStatus, string> = {
  new: "bg-copper/15 text-copper-deep",
  contacted: "bg-stone text-ink",
  interested: "bg-ink/10 text-ink",
  meeting: "bg-ink text-foam",
  proposal: "bg-copper text-foam",
  won: "bg-emerald-800 text-white",
  lost: "bg-stone-deep text-ink-soft",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

import { STATUS_LABELS, type LeadStatus } from "@/lib/leads/types";

const styles: Record<LeadStatus, string> = {
  new: "bg-sky-500 text-white shadow-sm shadow-sky-500/25",
  contacted: "bg-violet-500 text-white shadow-sm shadow-violet-500/25",
  interested: "bg-amber-500 text-white shadow-sm shadow-amber-500/25",
  meeting: "bg-orange-600 text-white shadow-sm shadow-orange-600/25",
  proposal: "bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/25",
  won: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
  lost: "bg-rose-600 text-white shadow-sm shadow-rose-600/25",
  skip: "bg-slate-500 text-white shadow-sm shadow-slate-500/20",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

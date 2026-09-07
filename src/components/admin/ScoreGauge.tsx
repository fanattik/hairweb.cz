/**
 * PSI-style circular score gauge (0–100 scale colors).
 */

export function psiScoreTone(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) {
    return { ring: "#c8c4be", text: "text-ink-soft", label: "—" as const };
  }
  if (score >= 90) {
    return { ring: "#0cce6b", text: "text-emerald-700", label: "good" as const };
  }
  if (score >= 50) {
    return { ring: "#ffa400", text: "text-amber-700", label: "ok" as const };
  }
  return { ring: "#ff4e42", text: "text-red-600", label: "poor" as const };
}

/** Map a score out of `max` onto 0–100 for PSI coloring. */
export function scoreToHundred(score: number | null | undefined, max: number) {
  if (score == null || max <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
}

type GaugeProps = {
  label: string;
  score: number | null | undefined;
  /** When set, score is displayed as score/max but ring uses percent. */
  max?: number;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { box: 64, stroke: 4, font: "text-lg", label: "text-[10px]" },
  md: { box: 88, stroke: 5, font: "text-2xl", label: "text-xs" },
  lg: { box: 120, stroke: 6, font: "text-4xl", label: "text-sm" },
} as const;

export function ScoreGauge({
  label,
  score,
  max = 100,
  size = "md",
}: GaugeProps) {
  const dims = SIZES[size];
  const display =
    score == null ? "—" : max === 100 ? String(Math.round(score)) : String(score);
  const pct = scoreToHundred(score, max);
  const tone = psiScoreTone(pct);
  const r = (dims.box - dims.stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = pct == null ? c : c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: dims.box, height: dims.box }}
        aria-label={`${label}: ${display}${max !== 100 ? ` / ${max}` : ""}`}
      >
        <svg width={dims.box} height={dims.box} className="-rotate-90">
          <circle
            cx={dims.box / 2}
            cy={dims.box / 2}
            r={r}
            fill="none"
            stroke="#e8e5e0"
            strokeWidth={dims.stroke}
          />
          <circle
            cx={dims.box / 2}
            cy={dims.box / 2}
            r={r}
            fill="none"
            stroke={tone.ring}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-[family-name:var(--font-fraunces)] ${dims.font} ${tone.text}`}
        >
          {display}
        </div>
      </div>
      <p
        className={`${dims.label} text-center font-medium uppercase tracking-wide text-ink-soft`}
      >
        {label}
      </p>
    </div>
  );
}

export function PsiLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-sm bg-[#ff4e42]" />
        0–49
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-sm bg-[#ffa400]" />
        50–89
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full bg-[#0cce6b]" />
        90–100
      </span>
    </div>
  );
}

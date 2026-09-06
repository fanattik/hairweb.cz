import type { ReactNode } from "react";

type BrowserMockupProps = {
  children: ReactNode;
  url?: string;
  className?: string;
  tone?: "light" | "dark" | "muted";
  aspectClass?: string;
};

const tones = {
  light: "bg-foam text-ink border-line",
  dark: "bg-[#161412] text-foam border-white/10",
  muted: "bg-[#ece8e2] text-ink border-line",
} as const;

export function BrowserMockup({
  children,
  url = "salon.cz",
  className = "",
  tone = "light",
  aspectClass = "aspect-[16/10]",
}: BrowserMockupProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-[0_28px_70px_-30px_rgba(26,23,20,0.5)] ${tones[tone]} ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-inherit/60 px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-current opacity-25" />
          <span className="h-2 w-2 rounded-full bg-current opacity-25" />
          <span className="h-2 w-2 rounded-full bg-current opacity-25" />
        </span>
        <div className="ml-1 flex-1 truncate rounded-md bg-current/5 px-2.5 py-1 text-[10px] tracking-wide opacity-60">
          {url}
        </div>
      </div>
      <div className={`relative overflow-hidden ${aspectClass}`}>{children}</div>
    </div>
  );
}

type PhoneMockupProps = {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
};

export function PhoneMockup({
  children,
  className = "",
  tone = "light",
}: PhoneMockupProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1.6rem] border shadow-[0_24px_55px_-20px_rgba(26,23,20,0.55)] ${
        tone === "dark"
          ? "border-white/10 bg-[#161412] text-foam"
          : "border-line bg-foam text-ink"
      } ${className}`}
    >
      <div className="flex justify-center py-2" aria-hidden>
        <span className="h-1.5 w-12 rounded-full bg-current/20" />
      </div>
      <div className="relative aspect-[9/16] overflow-hidden">{children}</div>
    </div>
  );
}

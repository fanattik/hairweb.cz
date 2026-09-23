import Link from "next/link";
import type { ReactNode } from "react";

type CtaVariant = "primary" | "secondary" | "dark" | "light" | "accent";

const variants: Record<CtaVariant, string> = {
  primary:
    "bg-ink text-foam hover:bg-copper active:bg-copper-deep",
  accent:
    "bg-copper text-white hover:brightness-110 active:bg-copper-deep",
  secondary:
    "border border-ink/18 bg-transparent text-ink hover:border-ink/40 hover:shadow-[var(--shadow-lift)]",
  dark: "bg-ink text-foam hover:bg-copper",
  light:
    "bg-foam text-ink hover:bg-white",
};

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: CtaVariant;
  className?: string;
  "data-track"?: string;
  "data-source"?: string;
  "data-track-payload"?: string;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  className = "",
  "data-track": dataTrack,
  "data-source": dataSource,
  "data-track-payload": dataTrackPayload,
}: CtaButtonProps) {
  const hasDisplay = /\b(hidden|block|inline-block|inline-flex|flex)\b/.test(
    className,
  );
  const classes = `${hasDisplay ? "" : "inline-flex "}min-h-12 items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium tracking-tight transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 ${variants[variant]} ${className}`;
  const tracking = {
    "data-track": dataTrack,
    "data-source": dataSource,
    "data-track-payload": dataTrackPayload,
  };

  if (href.startsWith("/") || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <Link href={href} className={classes} {...tracking}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...tracking}>
      {children}
    </a>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

type CtaVariant = "primary" | "secondary" | "dark" | "light";

const variants: Record<CtaVariant, string> = {
  primary:
    "bg-copper text-foam hover:bg-copper-deep active:bg-copper-deep focus-visible:outline-offset-2",
  secondary:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-ink/[0.03] active:bg-ink/[0.05]",
  dark: "bg-ink text-foam hover:bg-ink-soft active:bg-ink-soft",
  light:
    "border border-foam/40 bg-transparent text-foam hover:border-foam hover:bg-foam/10",
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
  const classes = `inline-flex min-h-11 items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition duration-200 ${variants[variant]} ${className}`;
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

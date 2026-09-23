import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mt-10", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-4"
        : padding === "lg"
          ? "p-6 sm:p-8"
          : "p-5 sm:p-6";
  return (
    <div
      className={cx(
        "rounded-[22px] bg-foam",
        pad,
        className,
      )}
    >
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-foam hover:bg-copper",
  accent: "bg-copper text-white hover:brightness-110",
  secondary:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/35",
  ghost: "bg-mist text-ink hover:bg-stone",
  danger: "bg-[oklch(0.55_0.18_25)] text-white hover:brightness-110",
};

export function AdminButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium tracking-tight transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] disabled:opacity-55",
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminLinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium tracking-tight transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AdminChip({
  href,
  active = false,
  children,
  className = "",
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex min-h-9 items-center rounded-full px-3.5 text-[12px] font-medium tracking-tight transition",
        active
          ? "bg-ink text-foam"
          : "bg-foam text-ink-soft hover:bg-stone hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AdminLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("text-sm font-medium text-ink", className)}>
      {children}
    </span>
  );
}

const fieldClass =
  "w-full rounded-[14px] border border-ink/10 bg-mist px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-copper";

export function AdminInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldClass, className)} />;
}

export function AdminSelect({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx(fieldClass, className)}>
      {children}
    </select>
  );
}

export function AdminTextarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(fieldClass, "min-h-24", className)} />;
}

export function AdminMetricCard({
  label,
  value,
  href,
}: {
  label: string;
  value: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[22px] bg-foam p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </p>
      <p className="mt-3 text-[clamp(2rem,3.5vw,2.75rem)] font-semibold leading-none tracking-[-0.05em] text-ink">
        {value}
      </p>
    </Link>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <AdminCard>
      <p className="text-sm leading-relaxed text-ink-soft">{children}</p>
    </AdminCard>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LeadsListLink } from "@/components/admin/LeadsListUrlPersistence";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leady" },
  { href: "/admin/leads/discovery", label: "Discovery" },
  { href: "/admin/marketing", label: "Marketing" },
  { href: "/admin/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/leads/discovery") {
    return pathname.startsWith("/admin/leads/discovery");
  }
  if (href === "/admin/leads") {
    return (
      pathname === "/admin/leads" ||
      (pathname.startsWith("/admin/leads/") &&
        !pathname.startsWith("/admin/leads/discovery"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ href = "/admin" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center text-lg tracking-[0.02em] text-ink"
      aria-label="HAIRWEB Admin"
    >
      <span className="font-light">HAIR</span>
      <span className="font-extrabold">WEB</span>
      <span className="ml-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-medium tracking-[0.14em] text-ink-muted uppercase">
        Admin
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  const className = `rounded-full px-3.5 py-2 text-sm font-medium transition ${
    active ? "bg-ink text-foam" : "text-ink-soft hover:bg-mist hover:text-ink"
  }`;

  if (href === "/admin/leads") {
    return (
      <LeadsListLink className={className} onClick={onClick}>
        {label}
      </LeadsListLink>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-mist text-ink" data-admin>
      <header className="sticky top-0 z-40 px-4 pt-3.5 sm:px-6 sm:pt-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-full border border-ink/[0.07] bg-foam/85 px-4 py-2.5 pl-6 backdrop-blur-[14px] shadow-[0_20px_50px_-28px_rgba(17,17,16,0.22)] sm:px-3 sm:pl-7">
          <BrandMark />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Admin"
          >
            {nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {email ? (
              <span className="hidden max-w-[180px] truncate text-xs text-ink-muted xl:inline">
                {email}
              </span>
            ) : null}
            <form action="/admin/logout" method="post" className="hidden sm:block">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center rounded-full border border-ink/12 px-4 text-[13px] font-medium text-ink transition hover:border-ink/30"
              >
                Odhlásit
              </button>
            </form>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex w-4 flex-col gap-1">
                <span
                  className={`h-px w-full bg-ink transition ${open ? "translate-y-[5px] rotate-45" : ""}`}
                />
                <span
                  className={`h-px w-full bg-ink transition ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-px w-full bg-ink transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 bg-mist/95 px-5 pt-24 backdrop-blur-sm lg:hidden">
          <nav className="mx-auto flex max-w-md flex-col gap-2" aria-label="Admin mobile">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
                onClick={() => setOpen(false)}
              />
            ))}
            <form action="/admin/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ink/12 text-[14px] font-medium"
              >
                Odhlásit
              </button>
            </form>
          </nav>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1400px] px-[clamp(1.25rem,4vw,2.5rem)] py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}

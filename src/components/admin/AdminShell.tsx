import Link from "next/link";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="border-b border-line bg-foam">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-[family-name:var(--font-fraunces)] text-lg tracking-wide"
            >
              Hairweb Admin
            </Link>
            <nav className="hidden gap-4 text-sm text-ink-soft sm:flex">
              <Link href="/admin" className="hover:text-ink">
                Dashboard
              </Link>
              <Link href="/admin/leads" className="hover:text-ink">
                Leady
              </Link>
              <Link href="/admin/leads/discovery" className="hover:text-ink">
                Discovery
              </Link>
              <Link href="/admin/leads/import" className="hover:text-ink">
                Import
              </Link>
              <Link href="/admin/leads/imports" className="hover:text-ink">
                Importy
              </Link>
              <Link href="/admin/leads/new" className="hover:text-ink">
                Nový outbound
              </Link>
              <Link href="/admin/settings" className="hover:text-ink">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {email ? (
              <span className="hidden text-ink-soft sm:inline">{email}</span>
            ) : null}
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="border border-line px-3 py-1.5 text-sm transition hover:border-ink"
              >
                Odhlásit
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}

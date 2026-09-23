import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminCard } from "@/components/admin/ui";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-16" data-admin>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center text-2xl tracking-[0.02em] text-ink">
            <span className="font-light">HAIR</span>
            <span className="font-extrabold">WEB</span>
          </p>
          <p className="mt-3 eyebrow">Admin</p>
          <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-[-0.04em] text-ink">
            Přihlášení
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Pouze pro předem vytvořené účty. Registrace není dostupná.
          </p>
        </div>
        <AdminCard padding="lg">
          <Suspense
            fallback={
              <div className="min-h-48 animate-pulse rounded-[14px] bg-mist" />
            }
          >
            <LoginForm />
          </Suspense>
        </AdminCard>
      </div>
    </div>
  );
}

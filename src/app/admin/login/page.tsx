import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink">
          Hairweb Admin
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Pouze pro předem vytvořené účty. Registrace není dostupná.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="min-h-48 border border-line bg-foam" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AdminButton,
  AdminInput,
  AdminLabel,
} from "@/components/admin/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Neplatný e-mail nebo heslo.");
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Přihlášení se nepovedlo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <AdminLabel>E-mail</AdminLabel>
        <AdminInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <AdminLabel>Heslo</AdminLabel>
        <AdminInput
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error ? (
        <p className="text-sm text-[oklch(0.5_0.18_27)]" role="alert">
          {error}
        </p>
      ) : null}
      <AdminButton type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Přihlašuji…" : "Přihlásit se"}
      </AdminButton>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <form onSubmit={onSubmit} className="border border-line bg-foam p-6 sm:p-8">
      <label className="grid gap-2 text-sm">
        <span className="font-medium">E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line bg-mist px-3 py-2.5 outline-none focus:border-copper"
          autoComplete="email"
        />
      </label>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="font-medium">Heslo</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-line bg-mist px-3 py-2.5 outline-none focus:border-copper"
          autoComplete="current-password"
        />
      </label>
      {error ? (
        <p className="mt-4 text-sm text-copper-deep" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-ink px-4 text-sm font-medium text-foam transition hover:bg-ink-soft disabled:opacity-60"
      >
        {loading ? "Přihlašuji…" : "Přihlásit se"}
      </button>
    </form>
  );
}

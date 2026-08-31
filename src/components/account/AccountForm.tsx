"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AccountForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/account";
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === "register";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(registering ? "/api/account" : "/api/account/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">
        {registering ? "Create your account" : "Sign in"}
      </h1>
      {registering && (
        <label className="text-sm font-medium">
          Full name
          <input name="name" required className="input mt-1 w-full" />
        </label>
      )}
      <label className="text-sm font-medium">
        Email
        <input name="email" type="email" required className="input mt-1 w-full" />
      </label>
      <label className="text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={registering ? 8 : undefined}
          className="input mt-1 w-full"
        />
      </label>
      {registering && (
        <>
          <label className="text-sm font-medium">
            Phone
            <input name="phone" className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium">
            Delivery address
            <textarea name="address" rows={2} className="input mt-1 w-full" />
          </label>
        </>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting
          ? registering
            ? "Creating account..."
            : "Signing in..."
          : registering
            ? "Create account"
            : "Sign in"}
      </button>
      <p className="text-sm text-slate-400">
        {registering ? "Already have an account? " : "New here? "}
        <Link
          href={`${registering ? "/account/login" : "/account/register"}?next=${encodeURIComponent(next)}`}
          className="text-amber-400 hover:underline"
        >
          {registering ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

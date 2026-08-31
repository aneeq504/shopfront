"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { OtpForm } from "./OtpForm";

export function AccountForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/account";
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<{
    email: string;
    payload: Record<string, FormDataEntryValue>;
  } | null>(null);
  const registering = mode === "register";
  const endpoint = registering ? "/api/account" : "/api/account/session";

  async function requestCode(payload: Record<string, FormDataEntryValue>) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Something went wrong");
    return data.email as string;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const email = await requestCode(payload);
      setPending({ email, payload });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (pending) {
    return (
      <div className="card mx-auto flex max-w-sm flex-col gap-4 p-6">
        <OtpForm
          email={pending.email}
          purpose={registering ? "SIGNUP" : "LOGIN"}
          description={
            registering
              ? "Confirm your email address to finish creating your account."
              : "Confirm it is you before signing in."
          }
          onResend={async () => {
            await requestCode(pending.payload);
          }}
          onCancel={() => setPending(null)}
          onVerified={() => {
            router.push(next);
            router.refresh();
          }}
        />
      </div>
    );
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
        {submitting ? "Sending code..." : registering ? "Create account" : "Sign in"}
      </button>
      <p className="text-sm text-slate-400">
        We email you a 6-digit code to confirm it is you.
      </p>
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

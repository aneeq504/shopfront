"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function post(body: Record<string, string>) {
    setSubmitting(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/account/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...body }),
    });
    const data = (await response.json()) as { error?: string };
    setSubmitting(false);
    if (!response.ok) setError(data.error ?? "Something went wrong");
    return response.ok;
  }

  if (!sent) {
    return (
      <form
        key="email"
        className="card mx-auto flex max-w-sm flex-col gap-4 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await post({})) setSent(true);
        }}
      >
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted">
          Enter your account email and we&apos;ll send you a 6-digit code.
        </p>
        <label className="text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input mt-1 w-full"
          />
        </label>
        {error && <p className="text-sm text-berry">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Sending code..." : "Send code"}
        </button>
        <Link href="/account/login" className="text-sm text-coralDark hover:underline">
          Back to sign in
        </Link>
      </form>
    );
  }

  return (
    <form
      key="reset"
      className="card mx-auto flex max-w-sm flex-col gap-4 p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const ok = await post({
          code: String(form.get("code") ?? ""),
          password: String(form.get("password") ?? ""),
        });
        if (ok) {
          router.push("/account");
          router.refresh();
        }
      }}
    >
      <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
      <p className="text-sm text-muted">
        If an account exists for <span className="text-ink">{email}</span>, we emailed it
        a 6-digit code. It expires in 10 minutes.
      </p>
      <input
        name="code"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoFocus
        placeholder="000000"
        className="input text-center text-2xl tracking-[0.5em]"
      />
      <label className="text-sm font-medium">
        New password
        <input name="password" type="password" required minLength={8} className="input mt-1 w-full" />
      </label>
      {notice && <p className="text-sm text-leaf">{notice}</p>}
      {error && <p className="text-sm text-berry">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving..." : "Reset password"}
      </button>
      <div className="flex gap-4 text-sm">
        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            if (await post({})) setNotice("A new code is on its way.");
          }}
          className="text-coralDark hover:underline"
        >
          Resend code
        </button>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError("");
            setNotice("");
          }}
          className="text-muted hover:underline"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
}

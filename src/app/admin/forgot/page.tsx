"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function post(body: Record<string, string>) {
    setSubmitting(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string; email?: string };
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Something went wrong");
      return null;
    }
    return data;
  }

  if (done) {
    return (
      <div className="card mx-auto flex max-w-sm flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">Password changed</h1>
        <p className="text-sm text-slate-400">Log in with your new admin password.</p>
        <Link href="/admin/login" className="btn-primary text-center">
          Go to login
        </Link>
      </div>
    );
  }

  if (!sentTo) {
    return (
      <form
        key="request"
        className="card mx-auto flex max-w-sm flex-col gap-4 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = await post({});
          if (data?.email) setSentTo(data.email);
        }}
      >
        <h1 className="text-xl font-semibold">Reset admin password</h1>
        <p className="text-sm text-slate-400">
          We&apos;ll email a 6-digit code to the owner email so you can choose a new password.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Sending code..." : "Send code"}
        </button>
        <Link href="/admin/login" className="text-sm text-amber-400 hover:underline">
          Back to login
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
        const data = await post({
          code: String(form.get("code") ?? ""),
          newPassword: String(form.get("newPassword") ?? ""),
        });
        if (data) setDone(true);
      }}
    >
      <h1 className="text-xl font-semibold">Choose a new admin password</h1>
      <p className="text-sm text-slate-400">
        We emailed a code to <span className="text-slate-200">{sentTo}</span>. It expires in 10
        minutes.
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
        New password (at least 12 characters)
        <input
          name="newPassword"
          type="password"
          required
          minLength={12}
          className="input mt-1 w-full"
        />
      </label>
      {notice && <p className="text-sm text-emerald-400">{notice}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
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
          className="text-amber-400 hover:underline"
        >
          Resend code
        </button>
        <Link href="/admin/login" className="text-slate-400 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

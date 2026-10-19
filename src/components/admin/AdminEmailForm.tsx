"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminEmailForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function post(code?: string) {
    setSubmitting(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    });
    const data = (await response.json()) as { error?: string };
    setSubmitting(false);
    if (!response.ok) setError(data.error ?? "Could not change the owner email");
    return response.ok;
  }

  function reset() {
    setEditing(false);
    setCodeSent(false);
    setEmail("");
    setPassword("");
    setError("");
  }

  return (
    <section className="card flex flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Owner email</p>
          <p className="text-slate-400">
            {currentEmail || "Not set"} &middot; admin login codes are sent here
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost text-sm">
            Change email
          </button>
        )}
      </div>

      {notice && <p className="text-emerald-400">{notice}</p>}

      {editing && !codeSent && (
        <form
          key="details"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            if (await post()) setCodeSent(true);
          }}
        >
          <label className="flex-1">
            New email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input mt-1 w-full"
            />
          </label>
          <label className="flex-1">
            Admin password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? "Sending code..." : "Send code"}
            </button>
            <button type="button" onClick={reset} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editing && codeSent && (
        <form
          key="code"
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const code = String(new FormData(event.currentTarget).get("code") ?? "");
            if (await post(code)) {
              reset();
              setNotice(`Owner email changed to ${email.trim().toLowerCase()}.`);
              router.refresh();
            }
          }}
        >
          <p className="text-slate-400">
            We emailed a 6-digit code to <span className="text-slate-200">{email}</span>. Enter it
            to confirm the new address. It expires in 10 minutes.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              className="input text-center text-xl tracking-[0.4em] sm:w-48"
            />
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? "Verifying..." : "Confirm"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                if (await post()) setNotice("A new code is on its way.");
              }}
              className="btn-ghost text-sm"
            >
              Resend code
            </button>
            <button type="button" onClick={reset} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-red-400">{error}</p>}
    </section>
  );
}

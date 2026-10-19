"use client";

import { useState } from "react";

export function AdminPasswordForm() {
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function post(code?: string) {
    setSubmitting(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, code }),
    });
    const data = (await response.json()) as { error?: string; email?: string };
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Could not change the password");
      return null;
    }
    return data;
  }

  function reset() {
    setEditing(false);
    setSentTo(null);
    setCurrentPassword("");
    setNewPassword("");
    setError("");
  }

  return (
    <section className="card flex flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Admin password</p>
          <p className="text-slate-400">Changing it needs a code sent to the owner email.</p>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost text-sm">
            Change password
          </button>
        )}
      </div>

      {notice && <p className="text-emerald-400">{notice}</p>}

      {editing && !sentTo && (
        <form
          key="details"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = await post();
            if (data?.email) setSentTo(data.email);
          }}
        >
          <label className="flex-1">
            Current password
            <input
              type="password"
              name="currentPassword"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="input mt-1 w-full"
            />
          </label>
          <label className="flex-1">
            New password (12+ characters)
            <input
              type="password"
              name="newPassword"
              required
              minLength={12}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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

      {editing && sentTo && (
        <form
          key="code"
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const code = String(new FormData(event.currentTarget).get("code") ?? "");
            if (await post(code)) {
              reset();
              setNotice("Admin password changed. Use the new one next time you log in.");
            }
          }}
        >
          <p className="text-slate-400">
            We emailed a 6-digit code to <span className="text-slate-200">{sentTo}</span>. Enter
            it to confirm the new password. It expires in 10 minutes.
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
              {submitting ? "Saving..." : "Save password"}
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

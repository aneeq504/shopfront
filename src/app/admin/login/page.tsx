"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function post(body: { password: string; code?: string }) {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { response, data: (await response.json()) as { error?: string; email?: string } };
  }

  async function requestCode(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const { response, data } = await post({ password });
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Incorrect password");
      return;
    }
    setSentTo(data.email ?? "the owner email");
    if (event === undefined) setNotice("A new code is on its way.");
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const { response, data } = await post({ password, code });
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Could not verify that code");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  if (sentTo) {
    return (
      <form onSubmit={verifyCode} className="card mx-auto flex max-w-sm flex-col gap-4 p-6">
        <div>
          <h1 className="text-xl font-semibold">Enter the 6-digit code</h1>
          <p className="mt-1 text-sm text-slate-400">
            We emailed a login code to <span className="text-slate-200">{sentTo}</span>. It
            expires in 10 minutes.
          </p>
        </div>
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
        {error && <p className="text-sm text-red-400">{error}</p>}
        {notice && <p className="text-sm text-emerald-400">{notice}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Verifying..." : "Verify"}
        </button>
        <div className="flex gap-4 text-sm">
          <button
            type="button"
            className="text-amber-400 hover:underline"
            onClick={() => requestCode()}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-slate-400 hover:underline"
            onClick={() => {
              setSentTo("");
              setPassword("");
              setError("");
              setNotice("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={requestCode} className="card mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Owner login</h1>
      <input
        name="password"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Admin password"
        className="input"
      />
      <p className="text-xs text-slate-500">
        After your password we email a 6-digit code to the owner address.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Sending code..." : "Continue"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { OtpPurpose } from "@/lib/otp";

type Props = {
  email: string;
  purpose: OtpPurpose;
  description: string;
  onVerified: () => void;
  onResend?: () => Promise<void>;
  onCancel?: () => void;
};

export function OtpForm({
  email,
  purpose,
  description,
  onVerified,
  onResend,
  onCancel,
}: Props) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const code = new FormData(event.currentTarget).get("code");
    const response = await fetch("/api/account/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, purpose }),
    });
    const data = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Could not verify that code");
      return;
    }
    onVerified();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Enter the 6-digit code</h2>
        <p className="mt-1 text-sm text-slate-400">
          {description} We emailed a code to{" "}
          <span className="text-slate-200">{email}</span>. It expires in 10 minutes.
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
        {onResend && (
          <button
            type="button"
            className="text-amber-400 hover:underline"
            onClick={async () => {
              setError("");
              await onResend();
              setNotice("A new code is on its way.");
            }}
          >
            Resend code
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            className="text-slate-400 hover:underline"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

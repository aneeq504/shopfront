"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OtpForm } from "./OtpForm";

type Props = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export function ProfileForm({ name, email, phone, address }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<{
    email: string;
    payload: Record<string, FormDataEntryValue>;
  } | null>(null);

  async function requestCode(payload: Record<string, FormDataEntryValue>) {
    const response = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not save");
    return data.email as string;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const target = await requestCode(payload);
      setPending({ email: target, payload });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (pending) {
    return (
      <div className="card flex flex-col gap-4 p-6">
        <OtpForm
          email={pending.email}
          purpose="PROFILE_UPDATE"
          description="Confirm the changes to your account."
          onResend={async () => {
            await requestCode(pending.payload);
          }}
          onCancel={() => setPending(null)}
          onVerified={() => {
            setPending(null);
            setStatus("Your account has been updated.");
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <form
      key={`${name}|${email}|${phone}|${address}`}
      onSubmit={onSubmit}
      className="card flex flex-col gap-3 p-6"
    >
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="text-sm text-slate-400">
        Every change is confirmed with a 6-digit code emailed to you.
      </p>
      <label className="text-sm font-medium">
        Full name
        <input name="name" defaultValue={name} required className="input mt-1 w-full" />
      </label>
      <label className="text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="input mt-1 w-full"
        />
      </label>
      <label className="text-sm font-medium">
        Phone
        <input name="phone" defaultValue={phone} className="input mt-1 w-full" />
      </label>
      <label className="text-sm font-medium">
        Delivery address
        <textarea
          name="address"
          defaultValue={address}
          rows={3}
          className="input mt-1 w-full"
        />
      </label>
      <label className="text-sm font-medium">
        New password
        <input
          name="password"
          type="password"
          minLength={8}
          placeholder="Leave blank to keep current"
          className="input mt-1 w-full"
        />
      </label>
      <label className="text-sm font-medium">
        Current password
        <input
          name="currentPassword"
          type="password"
          placeholder="Required to change email or password"
          className="input mt-1 w-full"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status && <p className="text-sm text-emerald-400">{status}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Sending code..." : "Save changes"}
      </button>
    </form>
  );
}

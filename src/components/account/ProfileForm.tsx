"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  name: string;
  phone: string;
  address: string;
};

export function ProfileForm({ name, phone, address }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = await response.json();
    setSaving(false);
    setStatus(response.ok ? "Saved" : (data.error ?? "Could not save"));
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3 p-6">
      <h2 className="text-lg font-semibold">Your details</h2>
      <label className="text-sm font-medium">
        Full name
        <input name="name" defaultValue={name} required className="input mt-1 w-full" />
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
      {status && <p className="text-sm text-slate-400">{status}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}

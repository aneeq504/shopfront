"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (!response.ok) {
      setError("Incorrect password");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card mx-auto flex max-w-sm flex-col gap-4 p-6"
    >
      <h1 className="text-xl font-semibold">Owner login</h1>
      <input
        name="password"
        type="password"
        required
        placeholder="Admin password"
        className="input"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

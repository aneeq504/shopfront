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
      className="mx-auto flex max-w-sm flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6"
    >
      <h1 className="text-xl font-semibold">Owner login</h1>
      <input
        name="password"
        type="password"
        required
        placeholder="Admin password"
        className="rounded border border-gray-300 px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:bg-gray-300"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

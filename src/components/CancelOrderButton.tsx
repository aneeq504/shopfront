"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onCancel() {
    if (!window.confirm("Cancel this order?")) return;
    setSubmitting(true);
    setError("");
    const response = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    setSubmitting(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not cancel this order");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="btn-ghost w-fit bg-blush px-4 py-2 text-sm text-berry hover:bg-peach disabled:opacity-50"
      >
        {submitting ? "Cancelling..." : "Cancel order"}
      </button>
      {error && <p className="text-sm text-berry">{error}</p>}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderState } from "@/lib/orders";

export function AdminOrderActions({
  orderId,
  state,
  shippableFrom,
}: {
  orderId: string;
  state: OrderState;
  shippableFrom: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: "ship" | "deliver" | "cancel") {
    if (action === "cancel" && !window.confirm("Cancel this order and return its stock?")) {
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not update order");
      return;
    }
    router.refresh();
  }

  if (state === "CANCELLED" || state === "DELIVERED") return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {(state === "PENDING" || state === "CONFIRMED") && (
          <button
            type="button"
            disabled={busy || state === "PENDING"}
            onClick={() => run("ship")}
            title={state === "PENDING" ? `Can be shipped from ${shippableFrom}` : undefined}
            className="btn-primary px-3 py-1 text-xs"
          >
            Mark shipped
          </button>
        )}
        {state === "SHIPPED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run("deliver")}
            className="btn-primary px-3 py-1 text-xs"
          >
            Mark delivered
          </button>
        )}
        {(state === "PENDING" || state === "CONFIRMED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run("cancel")}
            className="rounded-full border-2 border-ink bg-blush px-3 py-1 text-xs font-semibold text-berry shadow-pop-sm transition hover:bg-peach disabled:opacity-50"
          >
            Cancel order
          </button>
        )}
        {state === "PENDING" && (
          <span className="text-xs text-muted">
            Customer can cancel until {shippableFrom}; shipping unlocks then.
          </span>
        )}
      </div>
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  );
}

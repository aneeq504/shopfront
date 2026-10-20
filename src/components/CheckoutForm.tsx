"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { lineKey, useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

type Props = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
};

export function CheckoutForm({
  customerName,
  customerEmail,
  customerPhone,
  address,
}: Props) {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        address: formData.get("address"),
        items: items.map((i) => ({
          productId: i.productId,
          colorId: i.colorId,
          quantity: i.quantity,
        })),
      }),
    });
    const data = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Could not place order");
      return;
    }
    clear();
    router.push(`/orders/${data.id}`);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink/15 bg-lavender/30 p-10 text-center text-muted">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-6">
        <h1 className="font-display text-3xl font-bold">Delivery details</h1>
        <p className="text-sm text-muted">
          Payment is cash on delivery for now — no online payment required. You can cancel the
          order within 24 hours; after that it is sent for delivery.
        </p>
        <label className="text-sm font-medium">
          Full name
          <input
            name="customerName"
            defaultValue={customerName}
            required
            className="input mt-1 w-full"
          />
        </label>
        <p className="text-sm text-muted">
          Ordering as <span className="text-ink">{customerEmail}</span>
        </p>
        <label className="text-sm font-medium">
          Phone
          <input
            name="customerPhone"
            defaultValue={customerPhone}
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium">
          Delivery address
          <textarea
            name="address"
            defaultValue={address}
            required
            rows={3}
            className="input mt-1 w-full"
          />
        </label>
        {error && <p className="text-sm text-berry">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary px-5">
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>

      <aside className="card h-fit p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Order summary</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={lineKey(item.productId, item.colorId)} className="flex justify-between gap-4">
              <span>
                {item.name} &times; {item.quantity}
                {item.colorName && (
                  <span className="block text-xs text-muted">Color: {item.colorName}</span>
                )}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-ink/15 pt-4 font-bold">
          <span>Total</span>
          <span className="text-coralDark">{formatPrice(totalCents)}</span>
        </p>
      </aside>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
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
        customerEmail: formData.get("customerEmail"),
        customerPhone: formData.get("customerPhone"),
        address: formData.get("address"),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
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
      <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-400">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Delivery details</h1>
        <p className="text-sm text-slate-400">
          Payment is cash on delivery for now — no online payment required. You can cancel the
          order within 24 hours; after that it is sent for delivery.
        </p>
        <label className="text-sm font-medium">
          Full name
          <input name="customerName" required className="input mt-1 w-full" />
        </label>
        <label className="text-sm font-medium">
          Email
          <input name="customerEmail" type="email" required className="input mt-1 w-full" />
        </label>
        <label className="text-sm font-medium">
          Phone
          <input name="customerPhone" className="input mt-1 w-full" />
        </label>
        <label className="text-sm font-medium">
          Delivery address
          <textarea name="address" required rows={3} className="input mt-1 w-full" />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary px-5">
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>

      <aside className="card h-fit p-6">
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4">
              <span>
                {item.name} &times; {item.quantity}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-slate-800 pt-4 font-bold">
          <span>Total</span>
          <span className="text-amber-400">{formatPrice(totalCents)}</span>
        </p>
      </aside>
    </div>
  );
}

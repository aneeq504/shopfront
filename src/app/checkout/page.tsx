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
      <p className="rounded border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Delivery details</h1>
        <p className="text-sm text-gray-500">
          Payment is cash on delivery for now — no online payment required. You can cancel the
          order within 24 hours; after that it is sent for delivery.
        </p>
        <label className="text-sm font-medium">
          Full name
          <input name="customerName" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium">
          Email
          <input name="customerEmail" type="email" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium">
          Phone
          <input name="customerPhone" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium">
          Delivery address
          <textarea name="address" required rows={3} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:bg-gray-300"
        >
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>

      <aside className="h-fit rounded-lg border border-gray-200 bg-white p-6">
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
        <p className="mt-4 flex justify-between border-t border-gray-200 pt-4 font-bold">
          <span>Total</span>
          <span className="text-orange-600">{formatPrice(totalCents)}</span>
        </p>
      </aside>
    </div>
  );
}

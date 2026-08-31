"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, totalCents, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
        <p className="text-slate-400">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-amber-400 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <div className="card divide-y divide-slate-800">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-800">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={`/products/${item.productId}`}
                className="font-medium transition hover:text-amber-400"
              >
                {item.name}
              </Link>
              <p className="text-sm text-slate-400">{formatPrice(item.priceCents)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="input w-20 px-2 py-1 text-sm"
              aria-label={`Quantity for ${item.name}`}
            />
            <p className="w-32 text-right font-semibold">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-between p-4">
        <button type="button" onClick={clear} className="text-sm text-slate-400 hover:underline">
          Clear cart
        </button>
        <div className="flex items-center gap-6">
          <p className="text-lg">
            Total: <span className="font-bold text-amber-400">{formatPrice(totalCents)}</span>
          </p>
          <Link href="/checkout" className="btn-primary px-5">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

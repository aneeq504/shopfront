"use client";

import Link from "next/link";
import { lineKey, useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, totalCents, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <p className="font-display text-xl font-semibold">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-coralDark hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Your cart</h1>
      <div className="card divide-y divide-ink/10">
        {items.map((item) => (
          <div key={lineKey(item.productId, item.colorId)} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-ink/15 bg-lavender/30">
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
                className="font-medium transition hover:text-coralDark"
              >
                {item.name}
              </Link>
              {item.colorName && (
                <p className="text-sm text-muted">Color: {item.colorName}</p>
              )}
              <p className="text-sm text-muted">{formatPrice(item.priceCents)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) =>
                setQuantity(lineKey(item.productId, item.colorId), Number(e.target.value))
              }
              className="input w-20 px-2 py-1 text-sm"
              aria-label={`Quantity for ${item.name}${item.colorName ? ` (${item.colorName})` : ""}`}
            />
            <p className="w-32 text-right font-semibold">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(lineKey(item.productId, item.colorId))}
              className="text-sm text-berry hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-between p-4">
        <button type="button" onClick={clear} className="text-sm text-muted hover:underline">
          Clear cart
        </button>
        <div className="flex items-center gap-6">
          <p className="text-lg">
            Total: <span className="font-bold text-coralDark">{formatPrice(totalCents)}</span>
          </p>
          <Link href="/checkout" className="btn-primary px-5">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

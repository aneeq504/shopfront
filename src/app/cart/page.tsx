"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, totalCents, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-orange-600 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
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
                className="font-medium hover:text-orange-600"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-500">{formatPrice(item.priceCents)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
              aria-label={`Quantity for ${item.name}`}
            />
            <p className="w-32 text-right font-semibold">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <button type="button" onClick={clear} className="text-sm text-gray-500 hover:underline">
          Clear cart
        </button>
        <div className="flex items-center gap-6">
          <p className="text-lg">
            Total: <span className="font-bold text-orange-600">{formatPrice(totalCents)}</span>
          </p>
          <Link
            href="/checkout"
            className="rounded bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

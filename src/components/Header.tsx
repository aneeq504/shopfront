"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-orange-200 bg-orange-500 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ShopFront
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            Products
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
          <Link
            href="/cart"
            className="rounded bg-white px-3 py-1.5 font-medium text-orange-600"
          >
            Cart ({totalQuantity})
          </Link>
        </nav>
      </div>
    </header>
  );
}

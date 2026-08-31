"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header({ customerName }: { customerName: string | null }) {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-amber-400">Shop</span>
          <span className="text-slate-100">Front</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-slate-300 transition hover:text-amber-400">
            Products
          </Link>
          <Link href="/admin" className="text-slate-300 transition hover:text-amber-400">
            Admin
          </Link>
          <Link
            href={customerName ? "/account" : "/account/login"}
            className="text-slate-300 transition hover:text-amber-400"
          >
            {customerName ? customerName.split(" ")[0] : "Sign in"}
          </Link>
          <Link
            href="/cart"
            className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Cart ({totalQuantity})
          </Link>
        </nav>
      </div>
    </header>
  );
}

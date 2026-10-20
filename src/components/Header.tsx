"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { Mascot } from "./Doodles";
import { NotificationBell } from "./NotificationBell";

export function Header({
  isAdmin,
  customerName,
  unreadNotifications,
}: {
  isAdmin: boolean;
  customerName: string | null;
  unreadNotifications: number;
}) {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight sm:text-2xl"
        >
          <Mascot className="h-9 w-9" />
          <span>
            <span className="text-coralDark">Shop</span>
            <span className="text-ink">Front</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
          <Link href="/" className="rounded-full px-2 py-1.5 font-semibold transition hover:bg-butter sm:px-3">
            Products
          </Link>
          {isAdmin && (
            <Link href="/admin" className="rounded-full px-2 py-1.5 font-semibold transition hover:bg-butter sm:px-3">
              Admin
            </Link>
          )}
          {customerName && (
            <NotificationBell unreadNotifications={unreadNotifications} />
          )}
          <Link
            href={customerName ? "/account" : "/account/login"}
            className="max-w-24 truncate rounded-full px-2 py-1.5 font-semibold transition hover:bg-butter sm:max-w-none sm:px-3"
          >
            {customerName ? customerName.split(" ")[0] : "Sign in"}
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart (${totalQuantity})`}
            className="btn-primary flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:gap-2 sm:px-4 sm:text-sm"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.4L21 8H6"
              />
              <circle cx="10" cy="20" r="1.2" fill="currentColor" />
              <circle cx="18" cy="20" r="1.2" fill="currentColor" />
            </svg>
            <span>Cart</span>
            <span className="min-w-5 rounded-full bg-ink px-1.5 text-center text-xs leading-5 text-cream">
              {totalQuantity}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

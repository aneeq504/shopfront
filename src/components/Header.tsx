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
    <header className="sticky top-0 z-20 border-b-[3px] border-ink bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1232px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-2xl font-bold leading-none tracking-tight sm:text-[30px]"
        >
          <Mascot className="h-8 w-8 sm:h-9 sm:w-9" />
          <span>
            <span className="text-coralDark">Shop</span>
            <span className="text-ink">Front</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-5 sm:text-lg">
          <Link href="/" className="font-display text-ink transition hover:text-coralDark">
            Products
          </Link>
          {isAdmin && (
            <Link href="/admin" className="font-display text-ink transition hover:text-coralDark">
              Admin
            </Link>
          )}
          {customerName && (
            <NotificationBell unreadNotifications={unreadNotifications} />
          )}
          <Link
            href={customerName ? "/account" : "/account/login"}
            className="max-w-24 truncate font-display text-ink transition hover:text-coralDark sm:max-w-none"
          >
            {customerName ? customerName.split(" ")[0] : "Sign in"}
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart (${totalQuantity})`}
            className="btn-primary flex items-center gap-1 px-2 py-1.5 text-xs sm:gap-2 sm:px-4 sm:text-sm"
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

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCart } from "./CartProvider";
import { Mascot } from "./Doodles";
import { NotificationBell } from "./NotificationBell";

function HeaderSearchForm({
  q,
  category,
  className,
}: {
  q: string;
  category: string | null;
  className: string;
}) {
  return (
    <form action="/" method="get" className={`flex min-w-0 gap-2 ${className}`}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search products</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m16 16 4 4" />
        </svg>
        <input
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="input w-full rounded-full pl-12 text-sm"
        />
      </label>
      {category && <input type="hidden" name="category" value={category} />}
      <button className="btn-primary shrink-0 text-sm">Search</button>
    </form>
  );
}

function HeaderSearch({ className }: { className: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const q = searchParams.get("q") ?? "";
  const category = pathname === "/" ? searchParams.get("category") : null;

  return <HeaderSearchForm q={q} category={category} className={className} />;
}

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
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-0.5 sm:gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 font-display text-base font-bold tracking-tight sm:gap-2 sm:text-2xl"
          >
            <Mascot className="h-8 w-8 sm:h-9 sm:w-9" />
            <span>
              <span className="text-coralDark">Shop</span>
              <span className="text-ink">Front</span>
            </span>
          </Link>
          <div className="hidden min-w-0 flex-1 md:block">
            <Suspense
              fallback={<HeaderSearchForm q="" category={null} className="mx-auto w-full max-w-2xl" />}
            >
              <HeaderSearch className="mx-auto w-full max-w-2xl" />
            </Suspense>
          </div>
          <nav className="flex shrink-0 items-center gap-0.5 text-[11px] sm:gap-2 sm:text-sm">
            <Link
              href="/"
              className="hidden rounded-full px-2 py-1.5 font-semibold transition hover:bg-butter sm:inline-flex sm:px-3"
            >
              Products
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full px-1 py-1.5 font-semibold transition hover:bg-butter sm:px-3"
              >
                Admin
              </Link>
            )}
            {customerName && (
              <NotificationBell unreadNotifications={unreadNotifications} />
            )}
            <Link
              href={customerName ? "/account" : "/account/login"}
              aria-label={customerName ?? undefined}
              className={`flex shrink-0 items-center justify-center rounded-full font-semibold transition hover:bg-butter ${
                customerName
                  ? "h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                  : "px-2 py-1.5 sm:px-3"
              }`}
            >
              {customerName ? (
                <>
                  <span className="hidden sm:inline">{customerName.split(" ")[0]}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 sm:hidden"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path strokeLinecap="round" d="M5 20c.7-3.5 3.2-5.5 7-5.5s6.3 2 7 5.5" />
                  </svg>
                </>
              ) : (
                "Sign in"
              )}
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart (${totalQuantity})`}
              className="btn-primary flex items-center gap-1 px-2 py-1.5 text-[11px] sm:gap-2 sm:px-4 sm:text-sm"
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
        <div className="mt-3 md:hidden">
          <Suspense fallback={<HeaderSearchForm q="" category={null} className="w-full" />}>
            <HeaderSearch className="w-full" />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

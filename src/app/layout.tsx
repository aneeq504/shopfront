import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { isAdmin } from "@/lib/auth";
import { currentCustomer } from "@/lib/customer-auth";
import { unreadNotificationCount } from "@/lib/notifications";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShopFront",
  description: "Browse products and place orders",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = isAdmin();
  const customer = await currentCustomer();
  const unreadCount = customer ? await unreadNotificationCount(customer.id) : 0;

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} text-slate-200 antialiased`}
      >
        <CartProvider>
          <Header
            isAdmin={admin}
            customerName={customer?.name ?? null}
            unreadNotifications={unreadCount}
          />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}

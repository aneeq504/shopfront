import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { BackgroundDoodles } from "@/components/Doodles";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isAdmin } from "@/lib/auth";
import { currentCustomer } from "@/lib/customer-auth";
import { unreadNotificationCount } from "@/lib/notifications";

const displayFont = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const bodyFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
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
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} isolate antialiased`}>
        <BackgroundDoodles />
        <CartProvider>
          <Header
            isAdmin={admin}
            customerName={customer?.name ?? null}
            unreadNotifications={unreadCount}
          />
          <main className="mx-auto min-h-[calc(100vh-15rem)] max-w-6xl px-4 py-8">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

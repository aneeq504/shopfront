import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminProductRow } from "@/components/admin/AdminProductRow";
import { AdminEmailForm } from "@/components/admin/AdminEmailForm";
import { AdminPasswordForm } from "@/components/admin/AdminPasswordForm";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { SalesOverview } from "@/components/admin/SalesOverview";
import { adminEmail, isAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import {
  cancellableUntil,
  formatDateTime,
  orderState,
  orderStateClasses,
  orderStateLabel,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { salesOverview } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");

  const [products, orders, ownerEmail] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { colors: { orderBy: { position: "asc" } } },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } }),
    adminEmail(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Admin panel</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="btn-primary text-sm"
          >
            Add product
          </Link>
          <LogoutButton />
        </div>
      </div>

      <SalesOverview periods={salesOverview(orders)} />

      <AdminEmailForm currentEmail={ownerEmail ?? ""} />
      <AdminPasswordForm />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">Products ({products.length})</h2>
        <div className="card divide-y divide-ink/10">
          {products.length === 0 ? (
            <p className="p-6 text-sm text-muted">No products yet.</p>
          ) : (
            products.map((product) => (
              <AdminProductRow
                key={`${product.id}:${product.stock}`}
                product={{
                  id: product.id,
                  name: product.name,
                  price: formatPrice(product.priceCents),
                  stock: product.stock,
                  category: product.category,
                  colors: product.colors.map(({ name, stock }) => ({ name, stock })),
                }}
              />
            ))
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">Orders ({orders.length})</h2>
        <div className="card divide-y divide-ink/10">
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-muted">No orders yet.</p>
          ) : (
            orders.map((order) => {
              const state = orderState(order);
              return (
              <div key={order.id} className="flex flex-col gap-1 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{order.customerName}</span>
                  <span className="font-semibold text-coralDark">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`w-fit rounded-full bg-lavender/30 px-2 py-0.5 ${orderStateClasses[state]}`}
                  >
                    {orderStateLabel(state)}
                  </span>
                  <span className="text-muted">
                    Ordered {formatDateTime(order.createdAt)}
                    {order.shippedAt && ` · shipped ${formatDateTime(order.shippedAt)}`}
                    {order.deliveredAt && ` · delivered ${formatDateTime(order.deliveredAt)}`}
                  </span>
                </div>
                <span className="text-muted">
                  {order.customerEmail} &middot; {order.customerPhone || "no phone"} &middot;{" "}
                  {order.address}
                </span>
                <span className="text-muted">
                  {order.items
                    .map((item) =>
                      `${item.productName}${item.colorName ? ` (${item.colorName})` : ""} x${item.quantity}`,
                    )
                    .join(", ")}
                </span>
                <AdminOrderActions
                  orderId={order.id}
                  state={state}
                  shippableFrom={formatDateTime(cancellableUntil(order.createdAt))}
                />
              </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

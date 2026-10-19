import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminProductRow } from "@/components/admin/AdminProductRow";
import { AdminEmailForm } from "@/components/admin/AdminEmailForm";
import { AdminPasswordForm } from "@/components/admin/AdminPasswordForm";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { LogoutButton } from "@/components/admin/LogoutButton";
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

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");

  const [products, orders, ownerEmail] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } }),
    adminEmail(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin panel</h1>
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

      <AdminEmailForm currentEmail={ownerEmail ?? ""} />
      <AdminPasswordForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Products ({products.length})</h2>
        <div className="card divide-y divide-slate-800">
          {products.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No products yet.</p>
          ) : (
            products.map((product) => (
              <AdminProductRow
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: formatPrice(product.priceCents),
                  stock: product.stock,
                  category: product.category,
                }}
              />
            ))
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Orders ({orders.length})</h2>
        <div className="card divide-y divide-slate-800">
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No orders yet.</p>
          ) : (
            orders.map((order) => {
              const state = orderState(order);
              return (
              <div key={order.id} className="flex flex-col gap-1 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{order.customerName}</span>
                  <span className="font-semibold text-amber-400">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`w-fit rounded-full bg-slate-800 px-2 py-0.5 ${orderStateClasses[state]}`}
                  >
                    {orderStateLabel(state)}
                  </span>
                  <span className="text-slate-500">
                    Ordered {formatDateTime(order.createdAt)}
                    {order.shippedAt && ` · shipped ${formatDateTime(order.shippedAt)}`}
                    {order.deliveredAt && ` · delivered ${formatDateTime(order.deliveredAt)}`}
                  </span>
                </div>
                <span className="text-slate-400">
                  {order.customerEmail} &middot; {order.customerPhone || "no phone"} &middot;{" "}
                  {order.address}
                </span>
                <span className="text-slate-400">
                  {order.items
                    .map((item) => `${item.productName} x${item.quantity}`)
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

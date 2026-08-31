import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminProductRow } from "@/components/admin/AdminProductRow";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { isAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { orderState, orderStateLabel } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");

  const [products, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin panel</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Add product
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Products ({products.length})</h2>
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {products.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No products yet.</p>
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
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-1 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{order.customerName}</span>
                  <span className="font-semibold text-orange-600">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {orderStateLabel(orderState(order))}
                </span>
                <span className="text-gray-500">
                  {order.customerEmail} &middot; {order.customerPhone || "no phone"} &middot;{" "}
                  {order.address}
                </span>
                <span className="text-gray-500">
                  {order.items
                    .map((item) => `${item.productName} x${item.quantity}`)
                    .join(", ")}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

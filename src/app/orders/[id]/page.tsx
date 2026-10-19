import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { currentCustomerId } from "@/lib/customer-auth";
import { formatPrice } from "@/lib/format";
import {
  CANCELLATION_WINDOW_HOURS,
  cancellableUntil,
  formatDateTime,
  hoursLeftToCancel,
  orderState,
  orderStateLabel,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();
  if (order.customerId && order.customerId !== currentCustomerId()) notFound();

  const state = orderState(order);

  return (
    <div className="card mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1
        className={`text-2xl font-semibold ${
          state === "CANCELLED" ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {state === "CANCELLED" ? "Order cancelled" : "Order placed"}
      </h1>
      <p className="text-sm text-slate-300">
        Thanks {order.customerName}, your order <span className="font-mono">{order.id}</span> is{" "}
        {orderStateLabel(state).toLowerCase()}. We will contact you at {order.customerEmail}.
      </p>
      <ul className="divide-y divide-slate-800 border-y border-slate-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.productName} &times; {item.quantity}
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between font-bold">
        <span>Total</span>
        <span className="text-amber-400">{formatPrice(order.totalCents)}</span>
      </p>
      <p className="text-sm text-slate-400">Delivery address: {order.address}</p>

      {state === "PENDING" && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-slate-200">
            You can cancel this order for the next {hoursLeftToCancel(order.createdAt)} hour(s) —
            until {formatDateTime(cancellableUntil(order.createdAt))}. After that it is prepared
            for dispatch and can no longer be cancelled.
          </p>
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
      {state === "CONFIRMED" && (
        <p className="rounded-lg border border-slate-800 bg-slate-800/40 p-4 text-sm text-slate-300">
          The {CANCELLATION_WINDOW_HOURS}-hour cancellation window has passed. Your order is
          confirmed and will be shipped soon.
        </p>
      )}
      {state === "SHIPPED" && order.shippedAt && (
        <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-slate-200">
          Shipped on {formatDateTime(order.shippedAt)}. Please keep {formatPrice(order.totalCents)}{" "}
          ready to pay in cash on delivery.
        </p>
      )}
      {state === "DELIVERED" && order.deliveredAt && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-slate-200">
          Delivered on {formatDateTime(order.deliveredAt)}. Thanks for shopping with us!
        </p>
      )}

      <Link href="/" className="text-amber-400 hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}

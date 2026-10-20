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
  if (order.customerId && order.customerId !== (await currentCustomerId())) notFound();

  const state = orderState(order);

  return (
    <div className="card mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1
        className={`font-display text-3xl font-bold ${
          state === "CANCELLED" ? "text-berry" : "text-leaf"
        }`}
      >
        {state === "CANCELLED" ? "Order cancelled" : "Order placed"}
      </h1>
      <p className="text-sm text-ink">
        Thanks {order.customerName}, your order <span className="font-mono">{order.id}</span> is{" "}
        {orderStateLabel(state).toLowerCase()}. We will contact you at {order.customerEmail}.
      </p>
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.productName}
              {item.colorName && ` (${item.colorName})`} &times; {item.quantity}
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between font-bold">
        <span>Total</span>
        <span className="font-display text-coralDark">{formatPrice(order.totalCents)}</span>
      </p>
      <p className="text-sm text-muted">Delivery address: {order.address}</p>

      {state === "PENDING" && (
        <div className="flex flex-col gap-2 rounded-[12px_30px_12px_24px] border-[2.5px] border-coral/30 bg-butter p-4">
          <p className="text-sm text-ink">
            You can cancel this order for the next {hoursLeftToCancel(order.createdAt)} hour(s) —
            until {formatDateTime(cancellableUntil(order.createdAt))}. After that it is prepared
            for dispatch and can no longer be cancelled.
          </p>
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
      {state === "CONFIRMED" && (
        <p className="rounded-[12px_30px_12px_24px] border-[2.5px] border-ink/15 bg-lavender/30 p-4 text-sm text-ink">
          The {CANCELLATION_WINDOW_HOURS}-hour cancellation window has passed. Your order is
          confirmed and will be shipped soon.
        </p>
      )}
      {state === "SHIPPED" && order.shippedAt && (
        <p className="rounded-[12px_30px_12px_24px] border-[2.5px] border-ocean/30 bg-skyblue p-4 text-sm text-ink">
          Shipped on {formatDateTime(order.shippedAt)}. Please keep {formatPrice(order.totalCents)}{" "}
          ready to pay in cash on delivery.
        </p>
      )}
      {state === "DELIVERED" && order.deliveredAt && (
        <p className="rounded-[12px_30px_12px_24px] border-[2.5px] border-leaf/30 bg-mint p-4 text-sm text-ink">
          Delivered on {formatDateTime(order.deliveredAt)}. Thanks for shopping with us!
        </p>
      )}

      <Link href="/" className="text-coralDark hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}

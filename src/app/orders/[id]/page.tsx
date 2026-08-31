import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { formatPrice } from "@/lib/format";
import {
  CANCELLATION_WINDOW_HOURS,
  cancellableUntil,
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

  const state = orderState(order);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <h1
        className={`text-2xl font-semibold ${
          state === "CANCELLED" ? "text-red-700" : "text-green-700"
        }`}
      >
        {state === "CANCELLED" ? "Order cancelled" : "Order placed"}
      </h1>
      <p className="text-sm text-gray-600">
        Thanks {order.customerName}, your order <span className="font-mono">{order.id}</span> is{" "}
        {orderStateLabel(state).toLowerCase()}. We will contact you at {order.customerEmail}.
      </p>
      <ul className="divide-y divide-gray-200 border-y border-gray-200">
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
        <span className="text-orange-600">{formatPrice(order.totalCents)}</span>
      </p>
      <p className="text-sm text-gray-500">Delivery address: {order.address}</p>

      {state === "PENDING" && (
        <div className="flex flex-col gap-2 rounded border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-gray-700">
            You can cancel this order for the next {hoursLeftToCancel(order.createdAt)} hour(s) —
            until {cancellableUntil(order.createdAt).toUTCString()}. After that it is sent for
            delivery and can no longer be cancelled.
          </p>
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
      {state === "DISPATCHED" && (
        <p className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          The {CANCELLATION_WINDOW_HOURS}-hour cancellation window has passed and this order has
          been sent for delivery.
        </p>
      )}

      <Link href="/" className="text-orange-600 hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}

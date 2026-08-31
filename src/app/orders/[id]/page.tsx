import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-green-700">Order placed</h1>
      <p className="text-sm text-gray-600">
        Thanks {order.customerName}, your order <span className="font-mono">{order.id}</span> is{" "}
        {order.status.toLowerCase()}. We will contact you at {order.customerEmail}.
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
      <Link href="/" className="text-orange-600 hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}

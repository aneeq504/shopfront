import { NextResponse } from "next/server";
import { currentCustomerId } from "@/lib/customer-auth";
import { CANCELLATION_WINDOW_HOURS, orderState } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.customerId && order.customerId !== currentCustomerId()) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }

  const state = orderState(order);
  if (state === "CANCELLED") {
    return NextResponse.json({ error: "Order is already cancelled" }, { status: 409 });
  }
  if (state === "DISPATCHED") {
    return NextResponse.json(
      {
        error: `Orders can only be cancelled within ${CANCELLATION_WINDOW_HOURS} hours; this one has been sent for delivery`,
      },
      { status: 409 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { cancelledAt: new Date() },
    });
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

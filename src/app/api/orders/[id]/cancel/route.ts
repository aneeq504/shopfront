import { NextResponse } from "next/server";
import { currentCustomerId } from "@/lib/customer-auth";
import { cancelOrder } from "@/lib/order-actions";
import { CANCELLATION_WINDOW_HOURS, orderState } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.customerId && order.customerId !== (await currentCustomerId())) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }

  if (orderState(order) === "CANCELLED") {
    return NextResponse.json({ error: "Order is already cancelled" }, { status: 409 });
  }

  if (!(await cancelOrder(order.id, { byCustomer: true }))) {
    const state = orderState(
      (await prisma.order.findUnique({ where: { id: order.id } })) ?? order,
    );
    return NextResponse.json(
      {
        error:
          state === "CANCELLED"
            ? "Order is already cancelled"
            : `Orders can only be cancelled within ${CANCELLATION_WINDOW_HOURS} hours of ordering`,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

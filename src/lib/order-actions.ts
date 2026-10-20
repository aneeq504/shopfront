import { CANCELLATION_WINDOW_HOURS } from "./orders";
import { notifyCustomer } from "./notifications";
import { prisma } from "./prisma";

function windowStart(): Date {
  return new Date(Date.now() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);
}

/** Cancels an unshipped order and returns its stock. Customers may only cancel inside the window. */
export async function cancelOrder(
  orderId: string,
  { byCustomer }: { byCustomer: boolean },
): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: {
      id: orderId,
      cancelledAt: null,
      shippedAt: null,
      ...(byCustomer ? { createdAt: { gt: windowStart() } } : {}),
    },
    data: { cancelledAt: new Date() },
  });
  if (!count) return false;

  const items = await prisma.orderItem.findMany({ where: { orderId } });
  try {
    await prisma.$transaction(
      items.flatMap((item) => [
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
        ...(item.colorId
          ? [
              prisma.productColor.updateMany({
                where: { id: item.colorId },
                data: { stock: { increment: item.quantity } },
              }),
            ]
          : []),
      ]),
    );
  } catch (error) {
    await prisma.order.update({ where: { id: orderId }, data: { cancelledAt: null } });
    throw error;
  }
  if (!byCustomer) {
    try {
      await notifyCustomer(orderId, "CANCELLED");
    } catch (error) {
      console.error("Failed to create cancellation notification", error);
    }
  }
  return true;
}

/** Marks an order shipped; only possible once the customer cancellation window has closed. */
export async function shipOrder(orderId: string): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: {
      id: orderId,
      cancelledAt: null,
      shippedAt: null,
      createdAt: { lte: windowStart() },
    },
    data: { shippedAt: new Date() },
  });
  if (!count) return false;
  try {
    await notifyCustomer(orderId, "SHIPPED");
  } catch (error) {
    console.error("Failed to create shipment notification", error);
  }
  return true;
}

export async function deliverOrder(orderId: string): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: {
      id: orderId,
      cancelledAt: null,
      shippedAt: { not: null },
      deliveredAt: null,
    },
    data: { deliveredAt: new Date() },
  });
  return count > 0;
}

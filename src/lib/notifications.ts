import { formatPrice } from "./format";
import { prisma } from "./prisma";

export type NotificationKind = "SHIPPED" | "CANCELLED";

export async function notifyCustomer(
  orderId: string,
  kind: NotificationKind,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { customerId: true },
  });
  if (!order?.customerId) return;
  await prisma.notification.create({
    data: { customerId: order.customerId, orderId, kind },
  });
}

export async function unreadNotificationCount(customerId: string): Promise<number> {
  return prisma.notification.count({
    where: { customerId, readAt: null },
  });
}

export function notificationText(
  kind: NotificationKind,
  order: { id: string; totalCents: number },
): string {
  const orderNumber = order.id.slice(-8);
  if (kind === "SHIPPED") {
    return `Order #${orderNumber} has been shipped. Please have ${formatPrice(order.totalCents)} cash ready.`;
  }
  return `Order #${orderNumber} was cancelled by the shop.`;
}

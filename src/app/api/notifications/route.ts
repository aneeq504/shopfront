import { NextResponse } from "next/server";
import { currentCustomerId } from "@/lib/customer-auth";
import { notificationText, unreadNotificationCount } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customerId = await currentCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [unreadCount, notifications] = await Promise.all([
    unreadNotificationCount(customerId),
    prisma.notification.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { order: { select: { id: true, totalCents: true } } },
    }),
  ]);

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      orderId: notification.orderId,
      kind: notification.kind,
      text: notificationText(
        notification.kind as "SHIPPED" | "CANCELLED",
        notification.order,
      ),
      read: notification.readAt !== null,
      createdAt: notification.createdAt,
    })),
  });
}

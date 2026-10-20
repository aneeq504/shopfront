export const CANCELLATION_WINDOW_HOURS = 24;

export type OrderState = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type OrderTimestamps = {
  createdAt: Date;
  cancelledAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
};

export function cancellableUntil(createdAt: Date): Date {
  return new Date(createdAt.getTime() + CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);
}

export function orderState(order: OrderTimestamps): OrderState {
  if (order.cancelledAt) return "CANCELLED";
  if (order.deliveredAt) return "DELIVERED";
  if (order.shippedAt) return "SHIPPED";
  return Date.now() >= cancellableUntil(order.createdAt).getTime()
    ? "CONFIRMED"
    : "PENDING";
}

export function orderStateLabel(state: OrderState): string {
  switch (state) {
    case "CANCELLED":
      return "Cancelled";
    case "DELIVERED":
      return "Delivered";
    case "SHIPPED":
      return "Shipped";
    case "CONFIRMED":
      return "Confirmed — awaiting dispatch";
    default:
      return "Pending — cancellable";
  }
}

export const orderStateClasses: Record<OrderState, string> = {
  CANCELLED: "text-berry",
  DELIVERED: "text-leaf",
  SHIPPED: "text-ocean",
  CONFIRMED: "text-ink",
  PENDING: "text-coralDark",
};

export function hoursLeftToCancel(createdAt: Date): number {
  const msLeft = cancellableUntil(createdAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  })
    .format(date)
    .replace(/\b(am|pm)\b/, (meridiem) => meridiem.toUpperCase());
}

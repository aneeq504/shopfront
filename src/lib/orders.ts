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
  CANCELLED: "text-red-400",
  DELIVERED: "text-emerald-400",
  SHIPPED: "text-sky-400",
  CONFIRMED: "text-slate-300",
  PENDING: "text-amber-400",
};

export function hoursLeftToCancel(createdAt: Date): number {
  const msLeft = cancellableUntil(createdAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";
}

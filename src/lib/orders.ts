export const CANCELLATION_WINDOW_HOURS = 24;

export type OrderState = "PENDING" | "CANCELLED" | "DISPATCHED";

export function cancellableUntil(createdAt: Date): Date {
  return new Date(createdAt.getTime() + CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);
}

export function orderState(order: {
  createdAt: Date;
  cancelledAt: Date | null;
}): OrderState {
  if (order.cancelledAt) return "CANCELLED";
  return Date.now() >= cancellableUntil(order.createdAt).getTime()
    ? "DISPATCHED"
    : "PENDING";
}

export function orderStateLabel(state: OrderState): string {
  switch (state) {
    case "CANCELLED":
      return "Cancelled";
    case "DISPATCHED":
      return "Sent for delivery";
    default:
      return "Pending — cancellable";
  }
}

export function hoursLeftToCancel(createdAt: Date): number {
  const msLeft = cancellableUntil(createdAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));
}

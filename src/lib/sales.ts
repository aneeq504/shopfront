const DAY_MS = 24 * 60 * 60 * 1000;
/** Pakistan Standard Time (UTC+5, no daylight saving) decides where "today" starts. */
const SHOP_UTC_OFFSET_MS = 5 * 60 * 60 * 1000;

type SaleOrder = {
  totalCents: number;
  createdAt: Date;
  cancelledAt: Date | null;
  deliveredAt: Date | null;
  items: { quantity: number }[];
};

export type SalesPeriod = {
  key: string;
  label: string;
  description: string;
  salesCents: number;
  deliveredCents: number;
  orders: number;
  items: number;
};

export function startOfShopDay(now: Date): Date {
  const local = now.getTime() + SHOP_UTC_OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS - SHOP_UTC_OFFSET_MS);
}

/** Totals for each overview period; cancelled orders are left out. */
export function salesOverview(orders: SaleOrder[], now = new Date()): SalesPeriod[] {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);
  const threeMonthsAgo = daysAgo(90);
  const periods: { key: string; label: string; description: string; includes: (at: Date) => boolean }[] = [
    { key: "today", label: "Today", description: "Since midnight", includes: (at) => at >= startOfShopDay(now) },
    { key: "week", label: "Last 7 days", description: "Past week", includes: (at) => at >= daysAgo(7) },
    { key: "month", label: "Last 30 days", description: "Past month", includes: (at) => at >= daysAgo(30) },
    { key: "quarter", label: "Last 3 months", description: "Past 90 days", includes: (at) => at >= threeMonthsAgo },
    { key: "older", label: "Older than 3 months", description: "Before the last 90 days", includes: (at) => at < threeMonthsAgo },
    { key: "all", label: "All time", description: "Every order", includes: () => true },
  ];

  const sold = orders.filter((order) => !order.cancelledAt);
  return periods.map(({ includes, ...period }) => {
    const inPeriod = sold.filter((order) => includes(order.createdAt));
    return {
      ...period,
      salesCents: inPeriod.reduce((sum, order) => sum + order.totalCents, 0),
      deliveredCents: inPeriod
        .filter((order) => order.deliveredAt)
        .reduce((sum, order) => sum + order.totalCents, 0),
      orders: inPeriod.length,
      items: inPeriod.reduce(
        (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
        0,
      ),
    };
  });
}

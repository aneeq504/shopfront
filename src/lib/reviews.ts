import { prisma } from "@/lib/prisma";

export type RatingSummary = { average: number; count: number };

export async function canReview(customerId: string, productId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      customerId,
      deliveredAt: { not: null },
      cancelledAt: null,
      items: { some: { productId } },
    },
    select: { id: true },
  });

  return Boolean(order);
}

export async function ratingSummaries(
  productIds: string[],
): Promise<Map<string, RatingSummary>> {
  if (productIds.length === 0) return new Map();

  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    rows.map((row) => [
      row.productId,
      { average: row._avg.rating ?? 0, count: row._count.rating },
    ]),
  );
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

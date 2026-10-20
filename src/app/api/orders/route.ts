import { NextResponse } from "next/server";
import { currentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type OrderRequestItem = { productId: string; colorId?: string | null; quantity: number };

type OrderRequest = {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  items?: OrderRequestItem[];
};

export async function POST(request: Request) {
  const customer = await currentCustomer();
  if (!customer) {
    return NextResponse.json(
      { error: "Sign in to place an order" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as OrderRequest;
  const { customerName, customerPhone, address, items } = body;

  if (!customerName || !address || !items?.length) {
    return NextResponse.json(
      { error: "Name, address and at least one item are required" },
      { status: 400 },
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { colors: { orderBy: { position: "asc" } } },
  });

  try {
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Unknown product ${item.productId}`);
      const requestedQuantity = Number(item.quantity);
      if (!Number.isFinite(requestedQuantity)) throw new Error("Invalid quantity");
      const quantity = Math.max(1, Math.floor(requestedQuantity));
      const color = product.colors.length
        ? product.colors.find((candidate) => candidate.id === item.colorId)
        : undefined;
      if (product.colors.length && !color) {
        throw new Error(`Choose a color for ${product.name}`);
      }
      if (color && quantity > color.stock) {
        throw new Error(`Only ${color.stock} left of ${product.name} (${color.name})`);
      }
      if (!color && quantity > product.stock) {
        throw new Error(`Only ${product.stock} left of ${product.name}`);
      }
      return {
        productId: product.id,
        productName: product.name,
        colorId: color?.id ?? null,
        colorName: color?.name ?? "",
        unitPriceCents: product.priceCents,
        quantity,
      };
    });

    const reserved = await prisma.$transaction(
      lineItems.map((item) =>
        item.colorId
          ? prisma.productColor.updateMany({
              where: {
                id: item.colorId,
                productId: item.productId,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            })
          : prisma.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            }),
      ),
    );
    const reservedItems = lineItems.filter((_, i) => reserved[i].count > 0);
    const reservedColors = reservedItems.filter((item) => item.colorId);
    let aggregateReservedItems: typeof lineItems = [];
    const releaseStock = () => {
      const operations = reservedItems.flatMap((item) => [
          ...(item.colorId
            ? [
                prisma.productColor.updateMany({
                  where: { id: item.colorId, productId: item.productId },
                  data: { stock: { increment: item.quantity } },
                }),
              ]
            : [
                prisma.product.updateMany({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                }),
              ]),
      ]);
      operations.push(
        ...aggregateReservedItems.map((item) =>
          prisma.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
      return operations.length ? prisma.$transaction(operations) : Promise.resolve([]);
    };
    let aggregateResults: { count: number }[] = [];
    try {
      if (reservedColors.length) {
        aggregateResults = await prisma.$transaction(
          reservedColors.map((item) =>
            prisma.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            }),
          ),
        );
      }
    } catch (error) {
      await releaseStock();
      throw error;
    }
    aggregateReservedItems = reservedColors.filter(
      (_, index) => aggregateResults[index].count > 0,
    );

    const shortItem = lineItems.find((_, i) => reserved[i].count === 0);
    if (shortItem) {
      await releaseStock();
      throw new Error(
        `Not enough stock left of ${shortItem.productName}${shortItem.colorName ? ` (${shortItem.colorName})` : ""}`,
      );
    }
    const shortAggregate = reservedColors.find(
      (_, index) => aggregateResults[index].count === 0,
    );
    if (shortAggregate) {
      await releaseStock();
      throw new Error(
        `Not enough stock left of ${shortAggregate.productName} (${shortAggregate.colorName})`,
      );
    }

    let order;
    try {
      order = await prisma.order.create({
        data: {
          customerId: customer.id,
          customerName,
          customerEmail: customer.email,
          customerPhone: customerPhone ?? "",
          address,
          totalCents: lineItems.reduce(
            (sum, i) => sum + i.unitPriceCents * i.quantity,
            0,
          ),
          items: { create: lineItems },
        },
      });
    } catch (error) {
      await releaseStock();
      throw error;
    }
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not place order" },
      { status: 400 },
    );
  }
}

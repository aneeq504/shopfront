import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderRequestItem = { productId: string; quantity: number };

type OrderRequest = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  items?: OrderRequestItem[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderRequest;
  const { customerName, customerEmail, customerPhone, address, items } = body;

  if (!customerName || !customerEmail || !address || !items?.length) {
    return NextResponse.json(
      { error: "Name, email, address and at least one item are required" },
      { status: 400 },
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  try {
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Unknown product ${item.productId}`);
      const quantity = Math.max(1, Math.floor(item.quantity));
      if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} left of ${product.name}`);
      }
      return {
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone: customerPhone ?? "",
          address,
          totalCents: lineItems.reduce(
            (sum, i) => sum + i.unitPriceCents * i.quantity,
            0,
          ),
          items: { create: lineItems },
        },
      });
      for (const item of lineItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return created;
    });
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not place order" },
      { status: 400 },
    );
  }
}

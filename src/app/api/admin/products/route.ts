import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProductInput, productData } from "./validate";

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseProductInput(await request.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { _min } = await prisma.product.aggregate({
    _min: { position: true },
  });
  const product = await prisma.product.create({
    data: { ...productData(parsed.data), position: (_min.position ?? 0) - 1 },
    include: { colors: { orderBy: { position: "asc" }, select: { id: true } } },
  });
  const colorImages = parsed.data.colors.flatMap((color, index) =>
    color.images.map((url, position) => ({
      productId: product.id,
      colorId: product.colors[index].id,
      url,
      position,
    })),
  );
  if (colorImages.length) {
    await prisma.productImage.createMany({ data: colorImages });
  }
  return NextResponse.json({ id: product.id }, { status: 201 });
}

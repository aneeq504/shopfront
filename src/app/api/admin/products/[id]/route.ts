import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploads } from "@/lib/uploads";
import { parseProductInput, productData } from "../validate";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseProductInput(await request.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const previous = await prisma.productImage.findMany({ where: { productId: params.id } });
  const data = productData(parsed.data);
  await prisma.product.update({
    where: { id: params.id },
    data: { ...data, images: { deleteMany: {}, ...data.images } },
  });
  await deleteUploads(
    previous.map((image) => image.url).filter((url) => !parsed.data.images.includes(url)),
  );
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { stock?: unknown };
  const stock = Number(body.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Stock must be a positive number" },
      { status: 400 },
    );
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { stock: Math.floor(stock) },
  });
  return NextResponse.json({ stock: product.stock });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ordered = await prisma.orderItem.count({ where: { productId: params.id } });
  if (ordered > 0) {
    return NextResponse.json(
      { error: "Product appears in orders; set stock to 0 instead of deleting" },
      { status: 409 },
    );
  }

  const images = await prisma.productImage.findMany({ where: { productId: params.id } });
  await prisma.product.delete({ where: { id: params.id } });
  await deleteUploads(images.map((image) => image.url));
  return NextResponse.json({ ok: true });
}

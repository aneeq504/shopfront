import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploads } from "@/lib/uploads";
import { parseProductInput, productUpdateData } from "../validate";

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

  const submittedIds = parsed.data.colors.flatMap((color) => color.id ? [color.id] : []);
  const existingColors = await prisma.productColor.findMany({
    where: { productId: params.id, id: { in: submittedIds } },
    select: { id: true },
  });
  if (existingColors.length !== submittedIds.length) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  const previous = await prisma.productImage.findMany({ where: { productId: params.id } });
  const data = productUpdateData(parsed.data);
  const submittedImageUrls = new Set([
    ...parsed.data.images,
    ...parsed.data.colors.flatMap((color) => color.images),
  ]);
  const colorOperations = [
    prisma.productColor.deleteMany({
      where: {
        productId: params.id,
        ...(submittedIds.length ? { id: { notIn: submittedIds } } : {}),
      },
    }),
    ...parsed.data.colors.map((color, position) =>
      color.id
        ? prisma.productColor.update({
            where: { id: color.id },
            data: {
              name: color.name,
              stock: color.stock,
              position,
              images: {
                create: color.images.map((url, imagePosition) => ({
                  url,
                  position: imagePosition,
                  product: { connect: { id: params.id } },
                })),
              },
            },
          })
        : prisma.productColor.create({
            data: {
              productId: params.id,
              name: color.name,
              stock: color.stock,
              position,
              images: {
                create: color.images.map((url, imagePosition) => ({
                  url,
                  position: imagePosition,
                  product: { connect: { id: params.id } },
                })),
              },
            },
          }),
    ),
  ];
  await prisma.$transaction([
    prisma.product.update({
      where: { id: params.id },
      data: { ...data, images: { deleteMany: {}, ...data.images } },
    }),
    ...colorOperations,
  ]);
  await deleteUploads(
    previous.map((image) => image.url).filter((url) => !submittedImageUrls.has(url)),
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

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    select: { _count: { select: { colors: true } } },
  });
  if (existing?._count.colors) {
    return NextResponse.json(
      { error: "This product's stock is set per color; edit the product to change it" },
      { status: 409 },
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

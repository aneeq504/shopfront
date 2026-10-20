import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CHANGED_LIST_ERROR =
  "The product list changed. Reload the page and try again.";

export async function PUT(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ids = (body as { ids?: unknown }).ids;
  if (
    !Array.isArray(ids) ||
    ids.some((id) => typeof id !== "string") ||
    new Set(ids).size !== ids.length
  ) {
    return NextResponse.json({ error: "Invalid product ids" }, { status: 400 });
  }

  const productIds = ids as string[];
  const existing = await prisma.product.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map(({ id }) => id));
  if (
    productIds.length !== existingIds.size ||
    productIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json({ error: CHANGED_LIST_ERROR }, { status: 409 });
  }

  await prisma.$transaction(
    productIds.map((id, position) =>
      prisma.product.update({
        where: { id },
        data: { position },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}

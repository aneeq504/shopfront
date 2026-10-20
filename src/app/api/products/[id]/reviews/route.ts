import { NextResponse } from "next/server";
import { currentCustomerId } from "@/lib/customer-auth";
import { canReview } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";

type ReviewRequest = {
  rating?: unknown;
  comment?: unknown;
};

function invalidReview() {
  return NextResponse.json(
    { error: "Rating must be an integer from 1 to 5 and comment must be at most 1000 characters" },
    { status: 400 },
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const customerId = await currentCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!(await canReview(customerId, product.id))) {
    return NextResponse.json(
      { error: "You can review this product after it's delivered to you." },
      { status: 403 },
    );
  }

  let body: ReviewRequest | null;
  try {
    body = (await request.json()) as ReviewRequest;
  } catch {
    return invalidReview();
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return invalidReview();
  }

  const rating = body.rating;
  const comment = body.comment === undefined ? "" : body.comment;
  if (
    !Number.isInteger(rating) ||
    (rating as number) < 1 ||
    (rating as number) > 5 ||
    typeof comment !== "string" ||
    comment.trim().length > 1000
  ) {
    return invalidReview();
  }

  const normalizedComment = comment.trim();
  const review = await prisma.review.upsert({
    where: {
      productId_customerId: { productId: product.id, customerId },
    },
    create: {
      productId: product.id,
      customerId,
      rating: rating as number,
      comment: normalizedComment,
    },
    update: { rating: rating as number, comment: normalizedComment },
  });

  return NextResponse.json({ review });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const customerId = await currentCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const result = await prisma.review.deleteMany({
    where: { productId: params.id, customerId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { ReviewSection } from "@/components/ReviewSection";
import { currentCustomer } from "@/lib/customer-auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { canReview, firstName, ratingSummaries } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { where: { colorId: null }, orderBy: { position: "asc" } },
      colors: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" } } },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      },
    },
  });
  if (!product) notFound();

  const customer = await currentCustomer();
  const [summaries, eligible, ownReview] = await Promise.all([
    ratingSummaries([product.id]),
    customer ? canReview(customer.id, product.id) : Promise.resolve(false),
    customer
      ? prisma.review.findUnique({
          where: {
            productId_customerId: { productId: product.id, customerId: customer.id },
          },
          select: { id: true, rating: true, comment: true },
        })
      : Promise.resolve(null),
  ]);
  const summary = summaries.get(product.id) ?? { average: 0, count: 0 };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-coralDark hover:underline">
        &larr; Back to products
      </Link>
      <ProductDetail
        product={{
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          stock: product.stock,
          category: product.category,
          description: product.description,
        }}
        mainImages={product.images.map((image) => image.url)}
        colors={product.colors.map(({ id, name, stock, images }) => ({
          id,
          name,
          stock,
          images: images.map((image) => image.url),
        }))}
      />
      <ReviewSection
        productId={product.id}
        average={summary.average}
        count={summary.count}
        reviews={product.reviews.map((review) => ({
          id: review.id,
          name: firstName(review.customer.name),
          rating: review.rating,
          comment: review.comment,
          date: formatDate(review.createdAt),
        }))}
        viewer={!customer ? "signedOut" : eligible ? "eligible" : "ineligible"}
        ownReview={ownReview}
      />
    </div>
  );
}

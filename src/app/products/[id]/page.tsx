import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { prisma } from "@/lib/prisma";

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
    },
  });
  if (!product) notFound();

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
    </div>
  );
}

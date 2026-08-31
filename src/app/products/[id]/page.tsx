import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-orange-600 hover:underline">
        &larr; Back to products
      </Link>
      <div className="grid gap-8 rounded-lg border border-gray-200 bg-white p-6 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded bg-gray-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            {product.category}
          </span>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-3xl font-bold text-orange-600">
            {formatPrice(product.priceCents)}
          </p>
          <p className="text-sm text-gray-600">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="whitespace-pre-line text-gray-700">{product.description}</p>
          <div className="max-w-xs">
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
              }}
              disabled={product.stock <= 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

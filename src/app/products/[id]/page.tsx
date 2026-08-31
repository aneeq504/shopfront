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
      <Link href="/" className="text-sm text-amber-400 hover:underline">
        &larr; Back to products
      </Link>
      <div className="card grid gap-8 p-6 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-800">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover ${
                product.stock <= 0 ? "opacity-40 grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              No image
            </div>
          )}
          {product.stock <= 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            {product.category}
          </span>
          <h1 className="text-2xl font-semibold text-slate-100">{product.name}</h1>
          <p className="text-3xl font-bold text-amber-400">
            {formatPrice(product.priceCents)}
          </p>
          <p
            className={`w-fit rounded-full px-3 py-1 text-sm ${
              product.stock > 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="whitespace-pre-line text-slate-300">{product.description}</p>
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

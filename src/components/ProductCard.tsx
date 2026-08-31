import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export type ProductCardData = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="card group relative flex flex-col overflow-hidden transition duration-200 hover:-translate-y-2 hover:scale-[1.03] hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                outOfStock ? "opacity-40 grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No image
            </div>
          )}
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-slate-950">
              Only {product.stock} left
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {product.category}
        </span>
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-medium text-slate-100 transition hover:text-amber-400"
        >
          {product.name}
        </Link>
        <p className="text-lg font-bold text-amber-400">
          {formatPrice(product.priceCents)}
        </p>
        <p className="text-xs text-slate-500">
          {outOfStock ? "Currently unavailable" : `${product.stock} in stock`}
        </p>
        <div className="mt-auto">
          <AddToCartButton
            product={{
              productId: product.id,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
            }}
            disabled={outOfStock}
          />
        </div>
      </div>
    </div>
  );
}

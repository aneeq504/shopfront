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
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square w-full bg-gray-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          {product.category}
        </span>
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-medium hover:text-orange-600"
        >
          {product.name}
        </Link>
        <p className="text-lg font-bold text-orange-600">
          {formatPrice(product.priceCents)}
        </p>
        <div className="mt-auto">
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
  );
}

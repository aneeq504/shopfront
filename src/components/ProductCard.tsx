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
  colorCount: number;
};

const imageTints = [
  "bg-peach",
  "bg-mint",
  "bg-lavender",
  "bg-skyblue",
  "bg-butter",
  "bg-blush",
];

export function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;
  const tintIndex = product.id
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0) % imageTints.length;

  return (
    <div className="card product-card group relative flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-[12px_40px_12px_30px] border-[2.5px] border-ink ${
            imageTints[tintIndex]
          }`}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                outOfStock ? "opacity-40 grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-muted">
              No photo yet
            </div>
          )}
          {outOfStock && (
            <span className="sticker absolute left-3 top-3 bg-blush">
              Sold out
            </span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="sticker absolute left-3 top-3 bg-butter">
              Only {product.stock} left!
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-1">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          {product.category}
        </span>
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 font-semibold text-ink transition hover:text-coralDark"
        >
          {product.name}
        </Link>
        <p className="font-display text-xl font-bold text-coralDark">
          {formatPrice(product.priceCents)}
        </p>
        <p className="text-xs font-semibold text-muted">
          {outOfStock ? "Currently unavailable" : `${product.stock} in stock`}
        </p>
        <div className="mt-auto pt-1">
          {product.colorCount > 0 ? (
            outOfStock ? (
              <button type="button" disabled className="btn-primary w-full px-3 py-2 text-sm">
                Out of stock
              </button>
            ) : (
              <Link
                href={`/products/${product.id}`}
                className="btn-primary block w-full px-3 py-2 text-center text-sm"
              >
                Choose color
              </Link>
            )
          ) : (
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
                stock: product.stock,
              }}
              disabled={outOfStock}
            />
          )}
        </div>
      </div>
    </div>
  );
}

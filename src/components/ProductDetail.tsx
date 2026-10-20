"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";
import type { CartItem } from "./CartProvider";
import { formatPrice } from "@/lib/format";

type ColorOption = { id: string; name: string; stock: number; images: string[] };
type Product = Omit<CartItem, "quantity" | "colorId" | "colorName" | "stock"> & {
  stock: number;
  category: string;
  description: string;
};

export function ProductDetail({
  product,
  mainImages,
  colors,
}: {
  product: Product;
  mainImages: string[];
  colors: ColorOption[];
}) {
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const selectedColor = colors.find((color) => color.id === selectedColorId);
  const galleryImages = selectedColor?.images.length
    ? selectedColor.images
    : !selectedColor && mainImages.length === 0
      ? colors.find((color) => color.images.length > 0)?.images ?? []
      : mainImages;
  const galleryOutOfStock =
    product.stock <= 0 || Boolean(selectedColor && selectedColor.stock <= 0);

  return (
    <div className="card grid gap-8 p-6 md:grid-cols-2">
      <ProductGallery
        key={selectedColorId ?? "main"}
        images={galleryImages}
        name={product.name}
        outOfStock={galleryOutOfStock}
      />
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
          {colors.length > 0 ? (
            <ProductPurchase
              product={product}
              colors={colors}
              selectedColorId={selectedColorId}
              onSelectColor={setSelectedColorId}
            />
          ) : (
            <AddToCartButton
              product={product}
              disabled={product.stock <= 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}

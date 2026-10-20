"use client";

import { AddToCartButton } from "./AddToCartButton";
import type { CartItem } from "./CartProvider";

type ColorOption = { id: string; name: string; stock: number; images: string[] };

export function ProductPurchase({
  product,
  colors,
  selectedColorId,
  onSelectColor,
}: {
  product: Omit<CartItem, "quantity" | "colorId" | "colorName">;
  colors: ColorOption[];
  selectedColorId: string | null;
  onSelectColor: (colorId: string) => void;
}) {
  const selectedColor = colors.find((color) => color.id === selectedColorId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" aria-label="Choose a color">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            aria-pressed={color.id === selectedColorId}
            onClick={() => onSelectColor(color.id)}
            className={`chip ${
              color.id === selectedColorId
                ? "bg-butter shadow-pop-sm"
                : "bg-white hover:bg-butter"
            } ${color.stock <= 0 ? "opacity-50 line-through" : ""}`}
          >
            {color.name}
          </button>
        ))}
      </div>
      {!selectedColor ? (
        <button type="button" disabled className="btn-primary w-full px-3 py-2 text-sm">
          Choose a color
        </button>
      ) : (
        <>
          {selectedColor.stock > 0 && (
            <p className="text-sm text-muted">
              {selectedColor.stock} left in {selectedColor.name}
            </p>
          )}
          <AddToCartButton
            product={{
              ...product,
              stock: selectedColor.stock,
              imageUrl: selectedColor.images[0] ?? product.imageUrl,
              colorId: selectedColor.id,
              colorName: selectedColor.name,
            }}
            disabled={selectedColor.stock <= 0}
            disabledText="Sold out"
          />
        </>
      )}
    </div>
  );
}

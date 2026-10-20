"use client";

import { useState } from "react";
import { lineKey, useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({
  product,
  disabled,
  disabledText,
}: {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
  disabledText?: string;
}) {
  const { items, addItem } = useCart();
  const [added, setAdded] = useState(false);
  const key = lineKey(product.productId, product.colorId);
  const inCart = items.find((i) => lineKey(i.productId, i.colorId) === key)?.quantity ?? 0;
  const atLimit = product.stock !== undefined && inCart >= product.stock;

  return (
    <button
      type="button"
      disabled={disabled || (atLimit && !added)}
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`btn-primary w-full px-3 py-2 text-sm ${
        added ? "bg-mint hover:bg-mint" : ""
      }`}
    >
      {disabled
        ? disabledText ?? "Out of stock"
        : added
          ? "Added to cart"
          : atLimit
            ? "All in stock added"
            : "Add to cart"}
    </button>
  );
}

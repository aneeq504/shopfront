"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({
  product,
  disabled,
}: {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
}) {
  const { items, addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inCart =
    items.find((i) => i.productId === product.productId)?.quantity ?? 0;
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
        added ? "bg-emerald-500 hover:bg-emerald-400" : ""
      }`}
    >
      {disabled
        ? "Out of stock"
        : added
          ? "Added to cart"
          : atLimit
            ? "All in stock added"
            : "Add to cart"}
    </button>
  );
}

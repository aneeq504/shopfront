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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`btn-primary w-full px-3 py-2 text-sm ${
        added ? "bg-emerald-500 hover:bg-emerald-400" : ""
      }`}
    >
      {disabled ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}

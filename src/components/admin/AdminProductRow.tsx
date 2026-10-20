"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminProductRow({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: string;
    stock: number;
    category: string;
    colors: { name: string; stock: number }[];
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);

  async function saveStock(next: number) {
    const value = Math.max(0, Math.floor(next));
    setStock(value);
    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: value }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json();
      setStock(product.stock);
      setError(data.error ?? "Could not update stock");
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not delete product");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 text-sm">
      <div className="min-w-48 flex-1">
        <p className="font-display text-lg font-semibold text-ink">{product.name}</p>
        <p className="text-muted">
          {product.category} &middot; {product.price}
        </p>
        {error && <p className="text-berry">{error}</p>}
      </div>

      {product.colors.length > 0 ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink">
            Stock {product.stock} <span className="text-muted">(per color)</span>
          </span>
          <span className="text-xs text-muted">
            {product.colors.map((color) => `${color.name} ${color.stock}`).join(" · ")}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted">Stock</span>
          <button
            type="button"
            onClick={() => saveStock(stock - 1)}
            disabled={saving || stock <= 0}
            className="btn-ghost h-9 w-9 px-0 py-0 text-ink disabled:opacity-40"
            aria-label={`Decrease stock for ${product.name}`}
          >
            &minus;
          </button>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            onBlur={(e) => saveStock(Number(e.target.value))}
            className="input w-20 px-2 py-1 text-center text-sm"
            aria-label={`Stock for ${product.name}`}
          />
          <button
            type="button"
            onClick={() => saveStock(stock + 1)}
            disabled={saving}
            className="btn-ghost h-9 w-9 px-0 py-0 text-ink disabled:opacity-40"
            aria-label={`Increase stock for ${product.name}`}
          >
            +
          </button>
          <span
            className={`rounded-full border-2 border-ink px-2 py-0.5 text-xs font-semibold ${
              stock > 0
                ? "bg-mint text-leaf"
                : "bg-blush text-berry"
            }`}
          >
            {stock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>
      )}

      <Link href={`/admin/products/${product.id}/edit`} className="btn-ghost px-3 py-1">
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="btn-ghost bg-blush px-3 py-1.5 text-berry hover:bg-peach"
      >
        Delete
      </button>
    </div>
  );
}

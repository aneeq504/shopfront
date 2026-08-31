"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminProductRow({
  product,
}: {
  product: { id: string; name: string; price: string; stock: number; category: string };
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
        <p className="font-medium text-slate-100">{product.name}</p>
        <p className="text-slate-400">
          {product.category} &middot; {product.price}
        </p>
        {error && <p className="text-red-400">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-500">Stock</span>
        <button
          type="button"
          onClick={() => saveStock(stock - 1)}
          disabled={saving || stock <= 0}
          className="h-8 w-8 rounded-lg border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-40"
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
          className="h-8 w-8 rounded-lg border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-40"
          aria-label={`Increase stock for ${product.name}`}
        >
          +
        </button>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            stock > 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {stock > 0 ? "In stock" : "Out of stock"}
        </span>
      </div>

      <Link href={`/admin/products/${product.id}/edit`} className="btn-ghost px-3 py-1">
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-500/40 px-3 py-1 text-red-400 transition hover:bg-red-500/10"
      >
        Delete
      </button>
    </div>
  );
}

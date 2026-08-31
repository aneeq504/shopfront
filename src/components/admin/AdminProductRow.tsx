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
    <div className="flex items-center gap-4 p-4 text-sm">
      <div className="flex-1">
        <p className="font-medium">{product.name}</p>
        <p className="text-gray-500">
          {product.category} &middot; {product.price} &middot; stock {product.stock}
        </p>
        {error && <p className="text-red-600">{error}</p>}
      </div>
      <Link
        href={`/admin/products/${product.id}/edit`}
        className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="rounded border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}

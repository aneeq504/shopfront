"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
  category: string;
};

export function ProductForm({
  initialValues,
  productId,
}: {
  initialValues: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      },
    );
    setSubmitting(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not save product");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card flex max-w-xl flex-col gap-4 p-6"
    >
      <label className="text-sm font-medium">
        Name
        <input
          name="name"
          required
          defaultValue={initialValues.name}
          className="input mt-1 w-full"
        />
      </label>
      <label className="text-sm font-medium text-slate-200">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={initialValues.description}
          className="input mt-1 w-full"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm font-medium">
          Price (Rs.)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initialValues.price}
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-sm font-medium">
          Stock
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={initialValues.stock}
            className="input mt-1 w-full"
          />
        </label>
      </div>
      <label className="text-sm font-medium">
        Category
        <input
          name="category"
          defaultValue={initialValues.category}
          className="input mt-1 w-full"
        />
      </label>
      <label className="text-sm font-medium">
        Image URL
        <input
          name="imageUrl"
          defaultValue={initialValues.imageUrl}
          placeholder="https://..."
          className="input mt-1 w-full"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

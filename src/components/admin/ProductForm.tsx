"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoPicker } from "@/components/admin/PhotoPicker";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  images: string[];
  stock: string;
  category: string;
  colors: { id?: string; name: string; stock: number; images: string[] }[];
};

export function ProductForm({
  initialValues,
  productId,
}: {
  initialValues: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialValues.images);
  const [stock, setStock] = useState(initialValues.stock);
  const [colors, setColors] = useState(
    initialValues.colors.map((color) => ({ ...color, stock: String(color.stock) })),
  );
  const [error, setError] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const totalColorStock = colors.reduce(
    (total, color) =>
      total +
      (Number.isFinite(Number(color.stock)) ? Math.floor(Number(color.stock)) : 0),
    0,
  );

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
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          stock: colors.length ? totalColorStock : stock,
          images,
          colors: colors.map((color) => ({ ...color, stock: Number(color.stock) })),
        }),
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
            value={colors.length ? totalColorStock : stock}
            onChange={(event) => setStock(event.target.value)}
            disabled={colors.length > 0}
            className="input mt-1 w-full"
          />
          {colors.length > 0 && (
            <span className="mt-1 block text-xs text-slate-500">Total of all colors</span>
          )}
        </label>
      </div>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Colors</h2>
          <button
            type="button"
            onClick={() =>
              setColors((current) => [...current, { name: "", stock: "0", images: [] }])
            }
            disabled={colors.length >= 20}
            className="btn-ghost text-sm"
          >
            Add color
          </button>
        </div>
        {colors.map((color, index) => (
          <div
            key={color.id ?? `new-${index}`}
            className="flex flex-col gap-3 rounded-lg border border-slate-800 p-3"
          >
            <div className="grid grid-cols-[1fr_6rem_auto] items-end gap-2">
              <label className="text-sm">
                Name
                <input
                  value={color.name}
                  maxLength={30}
                  onChange={(event) =>
                    setColors((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                  className="input mt-1 w-full"
                />
              </label>
              <label className="text-sm">
                Stock
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={color.stock}
                  onChange={(event) =>
                    setColors((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, stock: event.target.value } : item,
                      ),
                    )
                  }
                  className="input mt-1 w-full"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setColors((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
                disabled={activeUploads > 0}
                aria-label={`Remove ${color.name || "color"}`}
                className="btn-ghost px-3 py-2 text-red-400 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
            <PhotoPicker
              label="Color photos"
              images={color.images}
              onChange={(nextImages) =>
                setColors((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, images: nextImages } : item,
                  ),
                )
              }
              onUploadingChange={(uploading) =>
                setActiveUploads((count) => count + (uploading ? 1 : -1))
              }
            />
          </div>
        ))}
      </section>
      <label className="text-sm font-medium">
        Category
        <input
          name="category"
          defaultValue={initialValues.category}
          className="input mt-1 w-full"
        />
      </label>

      <PhotoPicker
        label="Photos"
        images={images}
        onChange={setImages}
        onUploadingChange={(uploading) =>
          setActiveUploads((count) => count + (uploading ? 1 : -1))
        }
        hint="JPG, PNG, GIF or WebP, up to 5 MB each. The first photo is the cover shown on product cards."
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting || activeUploads > 0} className="btn-primary">
        {submitting ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

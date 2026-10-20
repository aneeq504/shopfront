"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_IMAGES = 10;

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  images: string[];
  stock: string;
  category: string;
  colors: { id?: string; name: string; stock: number }[];
};

export function ProductForm({
  initialValues,
  productId,
}: {
  initialValues: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialValues.images);
  const [stock, setStock] = useState(initialValues.stock);
  const [colors, setColors] = useState(
    initialValues.colors.map((color) => ({ ...color, stock: String(color.stock) })),
  );
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const totalColorStock = colors.reduce(
    (total, color) =>
      total +
      (Number.isFinite(Number(color.stock)) ? Math.floor(Number(color.stock)) : 0),
    0,
  );

  async function onFilesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError(`A product can have at most ${MAX_IMAGES} photos`);
      return;
    }
    setUploading(true);
    setError("");
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    const response = await fetch("/api/admin/uploads", { method: "POST", body });
    const data = (await response.json()) as { urls?: string[]; error?: string };
    setUploading(false);
    if (data.urls?.length) setImages((current) => [...current, ...data.urls!]);
    if (!response.ok) setError(data.error ?? "Could not upload photos");
  }

  function makeCover(url: string) {
    setImages((current) => [url, ...current.filter((u) => u !== url)]);
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((u) => u !== url));
  }

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
            onClick={() => setColors((current) => [...current, { name: "", stock: "0" }])}
            disabled={colors.length >= 20}
            className="btn-ghost text-sm"
          >
            Add color
          </button>
        </div>
        {colors.map((color, index) => (
          <div
            key={color.id ?? `new-${index}`}
            className="grid grid-cols-[1fr_6rem_auto] items-end gap-2"
          >
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
              aria-label={`Remove ${color.name || "color"}`}
              className="btn-ghost px-3 py-2 text-red-400"
            >
              Remove
            </button>
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Photos ({images.length}/{MAX_IMAGES})
          </span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading || images.length >= MAX_IMAGES}
            className="btn-ghost text-sm"
          >
            {uploading ? "Uploading..." : "Upload photos"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            hidden
            onChange={onFilesChosen}
            data-testid="photo-input"
          />
        </div>
        <p className="text-xs text-slate-500">
          JPG, PNG, GIF or WebP, up to 5 MB each. The first photo is the cover shown on
          product cards.
        </p>
        {images.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((url, index) => (
              <li
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-slate-950/80 p-1 text-[11px]">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(url)}
                      className="text-amber-400 hover:underline"
                    >
                      Make cover
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
            No photos yet
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={submitting || uploading} className="btn-primary">
        {submitting ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

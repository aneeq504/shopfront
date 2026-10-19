"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  name,
  outOfStock,
}: {
  images: string[];
  name: string;
  outOfStock: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-800">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={name}
            className={`h-full w-full object-cover ${outOfStock ? "opacity-40 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">No image</div>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setActive((active - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 px-3 py-1.5 text-lg text-slate-100 transition hover:bg-slate-950"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setActive((active + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 px-3 py-1.5 text-lg text-slate-100 transition hover:bg-slate-950"
            >
              &rsaquo;
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/70 px-2 py-0.5 text-xs text-slate-200">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-label={`Show photo ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                index === active
                  ? "border-amber-500"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

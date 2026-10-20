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
      <div className="relative aspect-square w-full overflow-hidden rounded-[12px_40px_12px_30px] border-[2.5px] border-ink bg-skyblue">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={name}
            className={`h-full w-full object-cover ${outOfStock ? "opacity-40 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-semibold text-muted">
            No photo yet
          </div>
        )}
        {outOfStock && (
          <span className="sticker absolute left-3 top-3 bg-blush">
            Out of stock
          </span>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setActive((active - 1 + images.length) % images.length)}
              className="btn-ghost absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-lg"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setActive((active + 1) % images.length)}
              className="btn-ghost absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-lg"
            >
              &rsaquo;
            </button>
            <span className="sticker absolute bottom-2 right-2 bg-card">
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
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[8px_22px_10px_18px] border-[2.5px] transition ${
                index === active
                  ? "border-coral shadow-pop-sm"
                  : "border-ink/15 opacity-70 hover:opacity-100"
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

"use client";

import { useRef, useState } from "react";

const MAX_IMAGES = 10;

export function PhotoPicker({
  label,
  images,
  onChange,
  onUploadingChange,
  hint,
}: {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  hint?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
    onUploadingChange?.(true);
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    try {
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = (await response.json()) as { urls?: string[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not upload photos");
        return;
      }
      if (data.urls?.length) onChange([...images, ...data.urls]);
    } catch {
      setError("Could not upload photos");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function makeCover(url: string) {
    onChange([url, ...images.filter((image) => image !== url)]);
  }

  function removeImage(url: string) {
    onChange(images.filter((image) => image !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {label} ({images.length}/{MAX_IMAGES})
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
        />
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {images.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-[8px_22px_10px_18px] border-[2.5px] border-ink bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-coral px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-card/90 p-1 text-[11px]">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    disabled={uploading}
                    className="text-coralDark hover:underline disabled:opacity-50"
                  >
                    Make cover
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  disabled={uploading}
                  aria-label={`Remove photo ${index + 1}`}
                  className="text-berry hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-ink/15 p-4 text-center text-sm text-muted">
          No photos yet
        </p>
      )}
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  );
}

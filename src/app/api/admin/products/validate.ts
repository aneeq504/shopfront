import { MAX_PRODUCT_IMAGES, UPLOAD_URL_PATTERN } from "@/lib/uploads";

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: string;
  images: string[];
};

function isImageUrl(url: string): boolean {
  return UPLOAD_URL_PATTERN.test(url) || /^https?:\/\/\S+$/.test(url);
}

export function parseProductInput(
  body: unknown,
): { data: ProductInput } | { error: string } {
  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const price = Number(raw.price);
  const stock = Number(raw.stock ?? 0);
  const images = Array.isArray(raw.images) ? raw.images : [];

  if (!name) return { error: "Name is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a positive number" };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Stock must be a positive number" };
  if (images.length > MAX_PRODUCT_IMAGES) {
    return { error: `A product can have at most ${MAX_PRODUCT_IMAGES} photos` };
  }
  if (!images.every((url) => typeof url === "string" && isImageUrl(url))) {
    return { error: "Invalid photo" };
  }

  return {
    data: {
      name,
      description: typeof raw.description === "string" ? raw.description : "",
      priceCents: Math.round(price * 100),
      stock: Math.floor(stock),
      category:
        typeof raw.category === "string" && raw.category.trim()
          ? raw.category.trim()
          : "General",
      images: Array.from(new Set(images as string[])),
    },
  };
}

/** Prisma data for a product's fields; the first photo doubles as the cover `imageUrl`. */
export function productData({ images, ...fields }: ProductInput) {
  return {
    ...fields,
    imageUrl: images[0] ?? "",
    images: { create: images.map((url, position) => ({ url, position })) },
  };
}

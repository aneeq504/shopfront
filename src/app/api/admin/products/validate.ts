import { MAX_PRODUCT_IMAGES, UPLOAD_URL_PATTERN } from "@/lib/uploads";

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: string;
  images: string[];
  colors: { id?: string; name: string; stock: number }[];
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
  const images = Array.isArray(raw.images) ? raw.images : [];
  const rawColors = raw.colors === undefined ? [] : raw.colors;

  if (!name) return { error: "Name is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a positive number" };
  if (!Array.isArray(rawColors)) return { error: "Invalid colors" };
  if (rawColors.length > 20) return { error: "A product can have at most 20 colors" };

  const colors: ProductInput["colors"] = [];
  const colorNames = new Set<string>();
  const colorIds = new Set<string>();
  for (const value of rawColors) {
    if (!value || typeof value !== "object") return { error: "Invalid color" };
    const color = value as Record<string, unknown>;
    const colorName = typeof color.name === "string" ? color.name.trim() : "";
    const stock = Number(color.stock);
    const id = typeof color.id === "string" ? color.id.trim() : "";

    if (!colorName) return { error: "Color name is required" };
    if (colorName.length > 30) {
      return { error: "Color name must be 30 characters or fewer" };
    }
    const normalizedName = colorName.toLowerCase();
    if (colorNames.has(normalizedName)) {
      return { error: "Color names must be unique" };
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return { error: "Color stock must be a positive number" };
    }
    if (color.id !== undefined && typeof color.id !== "string") {
      return { error: "Invalid color" };
    }
    if (id && colorIds.has(id)) return { error: "Invalid color" };

    colorNames.add(normalizedName);
    if (id) colorIds.add(id);
    colors.push({ ...(id ? { id } : {}), name: colorName, stock: Math.floor(stock) });
  }

  const postedStock = Number(raw.stock ?? 0);
  if (colors.length === 0 && (!Number.isFinite(postedStock) || postedStock < 0)) {
    return { error: "Stock must be a positive number" };
  }
  const stock = colors.length
    ? colors.reduce((sum, color) => sum + color.stock, 0)
    : Math.floor(postedStock);
  if (!Number.isSafeInteger(stock)) return { error: "Stock is too large" };

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
      stock,
      category:
        typeof raw.category === "string" && raw.category.trim()
          ? raw.category.trim()
          : "General",
      images: Array.from(new Set(images as string[])),
      colors,
    },
  };
}

/** Prisma data for a product's fields; the first photo doubles as the cover `imageUrl`. */
function productFieldsData({ name, description, priceCents, stock, category, images }: ProductInput) {
  return {
    name,
    description,
    priceCents,
    stock,
    category,
    imageUrl: images[0] ?? "",
    images: { create: images.map((url, position) => ({ url, position })) },
  };
}

export function productData(input: ProductInput) {
  return {
    ...productFieldsData(input),
    colors: {
      create: input.colors.map((color, position) => ({
        name: color.name,
        stock: color.stock,
        position,
      })),
    },
  };
}

export function productUpdateData(input: ProductInput) {
  return productFieldsData(input);
}

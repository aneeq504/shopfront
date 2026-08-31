export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: string;
};

export function parseProductInput(
  body: unknown,
): { data: ProductInput } | { error: string } {
  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const price = Number(raw.price);
  const stock = Number(raw.stock ?? 0);

  if (!name) return { error: "Name is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a positive number" };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Stock must be a positive number" };

  return {
    data: {
      name,
      description: typeof raw.description === "string" ? raw.description : "",
      priceCents: Math.round(price * 100),
      imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "",
      stock: Math.floor(stock),
      category:
        typeof raw.category === "string" && raw.category.trim()
          ? raw.category.trim()
          : "General",
    },
  };
}

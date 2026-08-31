import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = (
    await prisma.product.groupBy({ by: ["category"], orderBy: { category: "asc" } })
  ).map((row) => row.category);

  return (
    <div className="flex flex-col gap-6">
      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
          Search
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/"
            className={`rounded-full border px-3 py-1 ${
              category ? "border-gray-300 bg-white" : "border-orange-500 bg-orange-100"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-3 py-1 ${
                category === c ? "border-orange-500 bg-orange-100" : "border-gray-300 bg-white"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No products yet. The store owner can add products from the admin panel.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

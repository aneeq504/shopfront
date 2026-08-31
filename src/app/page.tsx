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
      <section className="card flex flex-col gap-2 p-6">
        <h1 className="text-3xl font-bold text-slate-100">
          Everything you need, <span className="text-amber-400">delivered</span>
        </h1>
        <p className="muted text-sm">
          Cash on delivery. Cancel free within 24 hours of ordering.
        </p>
      </section>

      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="input w-full text-sm"
        />
        <button className="btn-primary text-sm">Search</button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/"
            className={`rounded-full border px-3 py-1 transition ${
              category
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                : "border-amber-500 bg-amber-500/10 text-amber-400"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-3 py-1 transition ${
                category === c
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-400">
          No products yet. The store owner can add products from the admin panel.
        </p>
      ) : (
        <div className="product-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

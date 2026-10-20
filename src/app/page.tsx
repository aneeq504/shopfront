import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Mascot, StoryScene } from "@/components/Doodles";
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
    include: { _count: { select: { colors: true } } },
  });

  const categories = (
    await prisma.product.groupBy({ by: ["category"], orderBy: { category: "asc" } })
  ).map((row) => row.category);

  return (
    <div className="flex flex-col gap-8">
      <section className="card relative overflow-hidden bg-skyblue p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10 flex flex-col items-start gap-5">
            <h1 className="font-display text-[38px] font-bold leading-none text-ink sm:text-[54px]">
              Everything you need,
              <br />
              <span className="hero-highlight">delivered to your door</span>
            </h1>
            <p className="text-lg font-semibold text-ink/80">
              Cash on delivery. Cancel free within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="sticker bg-card" style={{ transform: "rotate(-2deg)" }}>
                Cash on delivery
              </span>
              <span className="sticker bg-card" style={{ transform: "rotate(2deg)" }}>
                24h free cancel
              </span>
              <span className="sticker bg-card" style={{ transform: "rotate(-2deg)" }}>
                Fast delivery
              </span>
            </div>
            <Link href="#products" className="btn-primary">
              Start shopping →
            </Link>
          </div>
          <div className="flex min-h-[220px] items-center justify-center md:min-h-[300px]">
            <StoryScene className="w-full max-w-[400px]" />
          </div>
        </div>
      </section>

      <form className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products..."
            className="input w-full pl-12 text-sm"
          />
        </label>
        <button className="btn-primary text-sm">Search</button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`chip ${category ? "bg-card text-ink" : "bg-ink text-cream"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`chip ${
                category === c ? "bg-ink text-cream" : "text-ink"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <section id="products" className="scroll-mt-28">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-coralDark">
              Picked with care
            </p>
            <h2 className="font-display text-3xl font-bold text-ink">
              {q ? `Results for “${q}”` : "Fresh picks"}
            </h2>
          </div>
          <span className="hidden text-sm font-semibold text-muted sm:block">
            {products.length} cheerful finds
          </span>
        </div>
        {products.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <Mascot className="h-24 w-24" />
            <p className="font-display text-xl font-semibold">No finds just yet!</p>
            <p className="text-sm text-muted">Try another search or browse all the happy things.</p>
          </div>
        ) : (
          <div className="product-grid grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, colorCount: product._count.colors }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Mascot, Sparkle, Squiggle, Star, Truck } from "@/components/Doodles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const chipColors = ["bg-butter", "bg-mint", "bg-lavender", "bg-skyblue", "bg-blush", "bg-peach"];

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
      <section className="card relative overflow-hidden bg-gradient-to-br from-lavender via-blush to-peach p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10 flex flex-col items-start gap-5">
            <span className="sticker rotate-3 bg-butter">Made for happy days</span>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Everything you need,{" "}
              <span className="relative inline-block">
                delivered
                <Squiggle className="absolute -bottom-3 left-0 h-4 w-full" />
              </span>{" "}
              with a smile
            </h1>
            <p className="text-lg font-semibold text-ink/80">
              Cash on delivery. Cancel free within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="sticker rotate-2 bg-butter">Cash on delivery</span>
              <span className="sticker rotate-0 bg-mint">24h free cancel</span>
              <span className="sticker -rotate-3 bg-skyblue">Fast delivery</span>
            </div>
            <Link href="#products" className="btn-primary">
              Start shopping
            </Link>
          </div>
          <div className="relative flex min-h-[250px] items-center justify-center md:min-h-[300px]">
            <div className="animate-float relative z-10 -rotate-6">
              <Mascot className="h-48 w-48 drop-shadow-sm sm:h-56 sm:w-56" />
            </div>
            <div className="animate-float absolute bottom-2 right-0 z-20" style={{ animationDelay: "1.3s" }}>
              <Truck className="w-40 sm:w-48" />
            </div>
            <Star className="animate-float absolute left-6 top-4 w-12 rotate-12" />
            <div className="animate-float absolute right-5 top-7" style={{ animationDelay: "2s" }}>
              <Sparkle className="w-10" />
            </div>
            <Heart className="animate-float absolute bottom-12 left-6 w-10" />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`chip ${category ? "bg-white text-ink" : "bg-ink text-cream"}`}
          >
            All
          </Link>
          {categories.map((c, index) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`chip ${
                category === c ? "bg-ink text-cream" : `${chipColors[index % chipColors.length]} text-ink`
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
          <div className="product-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

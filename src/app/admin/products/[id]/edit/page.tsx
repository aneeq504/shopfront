import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description,
          price: (product.priceCents / 100).toFixed(2),
          imageUrl: product.imageUrl,
          stock: String(product.stock),
          category: product.category,
        }}
      />
    </div>
  );
}

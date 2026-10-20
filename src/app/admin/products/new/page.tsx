import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  if (!isAdmin()) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Add product</h1>
      <ProductForm
        initialValues={{
          name: "",
          description: "",
          price: "",
          images: [],
          stock: "0",
          category: "General",
          colors: [],
        }}
      />
    </div>
  );
}

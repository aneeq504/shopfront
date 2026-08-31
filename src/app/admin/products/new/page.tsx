import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  if (!isAdmin()) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add product</h1>
      <ProductForm
        initialValues={{
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          stock: "0",
          category: "General",
        }}
      />
    </div>
  );
}

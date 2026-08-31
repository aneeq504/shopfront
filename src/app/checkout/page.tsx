import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { currentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/account/login?next=%2Fcheckout");

  return (
    <CheckoutForm
      customerName={customer.name}
      customerEmail={customer.email}
      customerPhone={customer.phone}
      address={customer.address}
    />
  );
}

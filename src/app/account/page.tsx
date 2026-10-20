import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { currentCustomer } from "@/lib/customer-auth";
import { formatPrice } from "@/lib/format";
import { orderState, orderStateClasses, orderStateLabel } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/account/login?next=%2Faccount");

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col gap-4">
        <div className="card flex items-center justify-between gap-4 p-6">
          <div>
            <p className="font-display text-xl font-bold">{customer.name}</p>
            <p className="text-sm text-muted">{customer.email}</p>
          </div>
          <SignOutButton />
        </div>
        <ProfileForm
          name={customer.name}
          email={customer.email}
          phone={customer.phone}
          address={customer.address}
        />
      </div>

      <section className="card p-6">
        <h2 className="mb-4 font-display text-2xl font-bold">Your orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">
            No orders yet.{" "}
            <Link href="/" className="text-coralDark hover:underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {orders.map((order) => {
              const state = orderState(order);
              return (
                <li key={order.id} className="flex flex-col gap-1 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-coralDark hover:underline"
                    >
                      {order.id.slice(-8)}
                    </Link>
                    <span className={orderStateClasses[state]}>{orderStateLabel(state)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-muted">
                    <span>
                      {order.items.length} item(s) &middot;{" "}
                      {order.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })}
                    </span>
                    <span>{formatPrice(order.totalCents)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

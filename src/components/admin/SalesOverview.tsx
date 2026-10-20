import { formatPrice } from "@/lib/format";
import type { SalesPeriod } from "@/lib/sales";

const periodTints = [
  "bg-skyblue",
  "bg-mint",
  "bg-peach",
  "bg-lavender",
  "bg-butter",
];

export function SalesOverview({ periods }: { periods: SalesPeriod[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold">Sales overview</h2>
        <p className="text-sm text-muted">
          Cancelled orders are not counted. &ldquo;Delivered&rdquo; is cash already collected.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period, index) => (
          <div
            key={period.key}
            data-period={period.key}
            className={`card card-flat flex flex-col gap-1 p-4 ${
              period.key === "all" ? "bg-coral" : periodTints[index % periodTints.length]
            }`}
          >
            <p className="font-display text-lg font-semibold text-ink">{period.label}</p>
            <p className="text-xs text-ink/80">{period.description}</p>
            <p data-field="sales" className="mt-2 font-display text-2xl font-bold text-coralDark">
              {formatPrice(period.salesCents)}
            </p>
            <p className="text-sm text-ink/80">
              <span data-field="orders">{period.orders}</span>{" "}
              {period.orders === 1 ? "order" : "orders"} &middot;{" "}
              <span data-field="items">{period.items}</span>{" "}
              {period.items === 1 ? "item" : "items"} sold
            </p>
            <p className="text-xs text-ink">
              Delivered: <span data-field="delivered">{formatPrice(period.deliveredCents)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

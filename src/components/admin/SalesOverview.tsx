import { formatPrice } from "@/lib/format";
import type { SalesPeriod } from "@/lib/sales";

export function SalesOverview({ periods }: { periods: SalesPeriod[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-medium">Sales overview</h2>
        <p className="text-sm text-slate-400">
          Cancelled orders are not counted. &ldquo;Delivered&rdquo; is cash already collected.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <div
            key={period.key}
            data-period={period.key}
            className={`card flex flex-col gap-1 p-4 ${
              period.key === "all" ? "border-amber-500/40" : ""
            }`}
          >
            <p className="text-sm font-medium text-slate-300">{period.label}</p>
            <p className="text-xs text-slate-500">{period.description}</p>
            <p data-field="sales" className="mt-2 text-2xl font-semibold text-amber-400">
              {formatPrice(period.salesCents)}
            </p>
            <p className="text-sm text-slate-400">
              <span data-field="orders">{period.orders}</span>{" "}
              {period.orders === 1 ? "order" : "orders"} &middot;{" "}
              <span data-field="items">{period.items}</span>{" "}
              {period.items === 1 ? "item" : "items"} sold
            </p>
            <p className="text-xs text-emerald-400">
              Delivered: <span data-field="delivered">{formatPrice(period.deliveredCents)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

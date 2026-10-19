import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { cancelOrder, deliverOrder, shipOrder } from "@/lib/order-actions";

const actions = {
  ship: {
    run: shipOrder,
    error: "Only confirmed orders can be shipped, after the cancellation window ends",
  },
  deliver: { run: deliverOrder, error: "Only shipped orders can be marked delivered" },
  cancel: {
    run: (id: string) => cancelOrder(id, { byCustomer: false }),
    error: "Shipped or already cancelled orders cannot be cancelled",
  },
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = (await request.json()) as { action?: string };
  if (action !== "ship" && action !== "deliver" && action !== "cancel") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!(await actions[action].run(params.id))) {
    return NextResponse.json({ error: actions[action].error }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

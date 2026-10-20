import { NextResponse } from "next/server";
import { currentCustomerId } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const customerId = await currentCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { customerId, readAt: null },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

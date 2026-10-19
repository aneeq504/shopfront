import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  customerSessionResponse,
  verifyPassword,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const customer = email
    ? await prisma.customer.findUnique({
        where: { email: email.trim().toLowerCase() },
      })
    : null;

  if (!customer || !password || !verifyPassword(password, customer.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 },
    );
  }

  return customerSessionResponse(customer, { ok: true });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(CUSTOMER_COOKIE);
  return response;
}

import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  currentCustomerId,
  customerToken,
  hashPassword,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequest;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required" },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone: body.phone?.trim() ?? "",
      address: body.address?.trim() ?? "",
      passwordHash: hashPassword(password),
    },
  });

  const response = NextResponse.json({ id: customer.id }, { status: 201 });
  response.cookies.set(CUSTOMER_COOKIE, customerToken(customer.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function PUT(request: Request) {
  const id = currentCustomerId();
  if (!id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json()) as RegisterRequest;
  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone: body.phone?.trim() ?? "",
      address: body.address?.trim() ?? "",
    },
  });
  return NextResponse.json({ ok: true });
}

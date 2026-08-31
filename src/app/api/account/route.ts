import { NextResponse } from "next/server";
import { currentCustomer, hashPassword, verifyPassword } from "@/lib/customer-auth";
import { sendOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

type AccountRequest = {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  phone?: string;
  address?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AccountRequest;
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

  await sendOtp({
    email,
    purpose: "SIGNUP",
    payload: {
      name,
      email,
      phone: body.phone?.trim() ?? "",
      address: body.address?.trim() ?? "",
      passwordHash: hashPassword(password),
    },
  });

  return NextResponse.json({ otpRequired: true, email }, { status: 202 });
}

export async function PUT(request: Request) {
  const customer = await currentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json()) as AccountRequest;
  const name = body.name?.trim() ?? customer.name;
  const phone = body.phone?.trim() ?? customer.phone;
  const address = body.address?.trim() ?? customer.address;
  const email = body.email?.trim().toLowerCase() || customer.email;
  const newPassword = body.password ?? "";

  if (!name) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const emailChanged = email !== customer.email;
  const changed =
    emailChanged ||
    name !== customer.name ||
    phone !== customer.phone ||
    address !== customer.address ||
    newPassword.length > 0;

  if (!changed) {
    return NextResponse.json({ error: "Nothing to change" }, { status: 400 });
  }

  if (emailChanged || newPassword) {
    if (!body.currentPassword || !verifyPassword(body.currentPassword, customer.passwordHash)) {
      return NextResponse.json(
        { error: "Enter your current password to change your email or password" },
        { status: 401 },
      );
    }
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (emailChanged) {
    const taken = await prisma.customer.findUnique({ where: { email } });
    if (taken) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
  }

  await sendOtp({
    email,
    purpose: "PROFILE_UPDATE",
    customerId: customer.id,
    payload: {
      name,
      email,
      phone,
      address,
      passwordHash: newPassword ? hashPassword(newPassword) : null,
    },
  });

  return NextResponse.json({ otpRequired: true, email }, { status: 202 });
}

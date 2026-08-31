import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  currentCustomerId,
  customerToken,
} from "@/lib/customer-auth";
import { verifyOtp, type OtpPurpose } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

type VerifyRequest = {
  email?: string;
  code?: string;
  purpose?: OtpPurpose;
};

type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
};

type ProfilePayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string | null;
};

function sessionResponse(customerId: string, body: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(body, { status });
  response.cookies.set(CUSTOMER_COOKIE, customerToken(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function POST(request: Request) {
  const { email, code, purpose } = (await request.json()) as VerifyRequest;

  if (!email || !code || !purpose) {
    return NextResponse.json(
      { error: "Email, code and purpose are required" },
      { status: 400 },
    );
  }
  if (!["SIGNUP", "LOGIN", "PROFILE_UPDATE"].includes(purpose)) {
    return NextResponse.json({ error: "Unknown verification purpose" }, { status: 400 });
  }

  const sessionCustomerId = currentCustomerId();
  if (purpose === "PROFILE_UPDATE" && !sessionCustomerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const result = await verifyOtp({ email, purpose, code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (purpose === "SIGNUP") {
    const payload = result.payload as SignupPayload;
    const existing = await prisma.customer.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    const customer = await prisma.customer.create({ data: payload });
    return sessionResponse(customer.id, { id: customer.id }, 201);
  }

  if (purpose === "LOGIN") {
    const customer = await prisma.customer.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!customer) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    return sessionResponse(customer.id, { ok: true });
  }

  const customerId = sessionCustomerId;
  if (!customerId || customerId !== result.customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const payload = result.payload as ProfilePayload;
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      ...(payload.passwordHash ? { passwordHash: payload.passwordHash } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

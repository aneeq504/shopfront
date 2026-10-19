import { NextResponse } from "next/server";
import { currentCustomerId, customerSessionResponse } from "@/lib/customer-auth";
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

export async function POST(request: Request) {
  const { email, code, purpose } = (await request.json()) as VerifyRequest;

  if (!email || !code || !purpose) {
    return NextResponse.json(
      { error: "Email, code and purpose are required" },
      { status: 400 },
    );
  }
  if (!["SIGNUP", "PROFILE_UPDATE"].includes(purpose)) {
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
    return customerSessionResponse(customer.id, { id: customer.id }, 201);
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

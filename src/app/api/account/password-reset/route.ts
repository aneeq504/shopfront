import { NextResponse } from "next/server";
import { customerSessionResponse, hashPassword } from "@/lib/customer-auth";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

/**
 * Step 1: { email } -> emails a code if an account exists (the reply is the same either way).
 * Step 2: { email, code, password } -> sets the new password, signs out every other device
 * and signs this one in.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; code?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return NextResponse.json({ error: "Enter your email" }, { status: 400 });
  }

  if (!body.code) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
      await sendOtp({ email, purpose: "PASSWORD_RESET", customerId: customer.id });
    }
    return NextResponse.json({ otpRequired: true, email }, { status: 202 });
  }

  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "The new password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const result = await verifyOtp({ email, purpose: "PASSWORD_RESET", code: body.code });
  if (!result.ok || !result.customerId) {
    return NextResponse.json(
      { error: "That code is wrong or has expired — check it or request a new one" },
      { status: 400 },
    );
  }

  const customer = await prisma.customer.update({
    where: { id: result.customerId },
    data: { passwordHash: hashPassword(body.password), sessionVersion: { increment: 1 } },
  });
  return customerSessionResponse(customer, { ok: true });
}

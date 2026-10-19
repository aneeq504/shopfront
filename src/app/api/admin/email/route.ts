import { NextResponse } from "next/server";
import { ADMIN_EMAIL_SETTING, adminEmail, isAdmin, isAdminPassword } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 1: { email, password } -> emails a code to the new address.
 * Step 2: { email, password, code } -> saves the new owner email.
 */
export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string; password?: string; code?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const current = await adminEmail();

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (email === current) {
    return NextResponse.json({ error: "That is already the owner email" }, { status: 400 });
  }
  if (!body.password || !(await isAdminPassword(body.password))) {
    return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
  }

  if (!body.code) {
    await sendOtp({ email, purpose: "ADMIN_EMAIL_CHANGE" });
    return NextResponse.json({ otpRequired: true, email }, { status: 202 });
  }

  const result = await verifyOtp({ email, purpose: "ADMIN_EMAIL_CHANGE", code: body.code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await prisma.setting.upsert({
    where: { key: ADMIN_EMAIL_SETTING },
    create: { key: ADMIN_EMAIL_SETTING, value: email },
    update: { value: email },
  });

  if (current) {
    await sendMail({
      to: current,
      subject: "Your ShopFront owner email was changed",
      text: `The owner email for the ShopFront admin panel was changed to ${email}. Admin login codes will now go to that address.\n\nIf you did not make this change, change your admin password immediately.`,
    }).catch((error) => console.error("Could not send owner email change notice", error));
  }

  return NextResponse.json({ ok: true, email });
}

import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEmail, isAdminPassword, sessionToken } from "@/lib/auth";
import { sendOtp, verifyOtp } from "@/lib/otp";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

/**
 * Step 1: { password } -> emails a code to ADMIN_EMAIL.
 * Step 2: { password, code } -> sets the admin session cookie.
 */
export async function POST(request: Request) {
  const { password, code } = (await request.json()) as {
    password?: string;
    code?: string;
  };

  if (!password || !isAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const email = await adminEmail();
  if (!email) {
    return NextResponse.json(
      { error: "Admin login is disabled until ADMIN_EMAIL is set on the server" },
      { status: 503 },
    );
  }

  if (!code) {
    await sendOtp({ email, purpose: "ADMIN_LOGIN" });
    return NextResponse.json({ otpRequired: true, email: maskEmail(email) }, { status: 202 });
  }

  const result = await verifyOtp({ email, purpose: "ADMIN_LOGIN", code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

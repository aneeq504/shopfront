import { NextResponse } from "next/server";
import { adminEmail, adminPasswordProblem, maskEmail, setAdminPassword } from "@/lib/auth";
import { sendOtp, verifyOtp } from "@/lib/otp";

/**
 * Forgotten admin password.
 * Step 1: {} -> emails a code to the owner email.
 * Step 2: { code, newPassword } -> saves the new password.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string; newPassword?: string };

  const email = await adminEmail();
  if (!email) {
    return NextResponse.json(
      { error: "No owner email is set; set ADMIN_EMAIL on the server" },
      { status: 503 },
    );
  }

  if (!body.code) {
    await sendOtp({ email, purpose: "ADMIN_PASSWORD_RESET" });
    return NextResponse.json({ otpRequired: true, email: maskEmail(email) }, { status: 202 });
  }

  const problem = adminPasswordProblem(body.newPassword);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  const result = await verifyOtp({ email, purpose: "ADMIN_PASSWORD_RESET", code: body.code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setAdminPassword(body.newPassword!);
  return NextResponse.json({ ok: true });
}

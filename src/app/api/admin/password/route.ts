import { NextResponse } from "next/server";
import {
  adminEmail,
  adminPasswordProblem,
  isAdmin,
  isAdminPassword,
  maskEmail,
  setAdminPassword,
} from "@/lib/auth";
import { sendOtp, verifyOtp } from "@/lib/otp";

/**
 * Step 1: { currentPassword, newPassword } -> emails a code to the owner email.
 * Step 2: { currentPassword, newPassword, code } -> saves the new password.
 */
export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
    code?: string;
  };

  if (!body.currentPassword || !(await isAdminPassword(body.currentPassword))) {
    return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
  }
  const problem = adminPasswordProblem(body.newPassword);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }
  const email = await adminEmail();
  if (!email) {
    return NextResponse.json({ error: "Set an owner email first" }, { status: 503 });
  }

  if (!body.code) {
    await sendOtp({ email, purpose: "ADMIN_PASSWORD_CHANGE" });
    return NextResponse.json({ otpRequired: true, email: maskEmail(email) }, { status: 202 });
  }

  const result = await verifyOtp({ email, purpose: "ADMIN_PASSWORD_CHANGE", code: body.code });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setAdminPassword(body.newPassword!);
  return NextResponse.json({ ok: true });
}

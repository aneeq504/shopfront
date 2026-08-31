import { createHash, randomInt } from "crypto";
import { sendMail } from "./mailer";
import { prisma } from "./prisma";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "SIGNUP" | "LOGIN" | "PROFILE_UPDATE";

const subjects: Record<OtpPurpose, string> = {
  SIGNUP: "Your ShopFront sign-up code",
  LOGIN: "Your ShopFront sign-in code",
  PROFILE_UPDATE: "Confirm your ShopFront account changes",
};

const intros: Record<OtpPurpose, string> = {
  SIGNUP: "Use this code to finish creating your ShopFront account.",
  LOGIN: "Use this code to sign in to ShopFront.",
  PROFILE_UPDATE: "Use this code to confirm the changes to your ShopFront account.",
};

function hashCode(code: string): string {
  return createHash("sha256")
    .update(`${process.env.CUSTOMER_SESSION_SECRET ?? "dev-insecure-customer-secret"}:${code}`)
    .digest("hex");
}

export async function sendOtp(options: {
  email: string;
  purpose: OtpPurpose;
  payload?: unknown;
  customerId?: string;
}): Promise<void> {
  const email = options.email.trim().toLowerCase();
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.verificationCode.deleteMany({
    where: { email, purpose: options.purpose },
  });
  await prisma.verificationCode.create({
    data: {
      email,
      purpose: options.purpose,
      codeHash: hashCode(code),
      payload: options.payload ? JSON.stringify(options.payload) : "",
      customerId: options.customerId ?? null,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  const text = `${intros[options.purpose]}\n\nYour code is ${code}\nIt expires in ${OTP_TTL_MINUTES} minutes. If you did not request it, ignore this email.`;
  await sendMail({
    to: email,
    subject: subjects[options.purpose],
    text,
    html: `<p>${intros[options.purpose]}</p><p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p><p>It expires in ${OTP_TTL_MINUTES} minutes. If you did not request it, ignore this email.</p>`,
  });
}

type VerifyResult =
  | { ok: true; payload: unknown; customerId: string | null }
  | { ok: false; error: string };

export async function verifyOtp(options: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<VerifyResult> {
  const email = options.email.trim().toLowerCase();
  const record = await prisma.verificationCode.findFirst({
    where: { email, purpose: options.purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, error: "Request a new code" };
  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return { ok: false, error: "That code has expired — request a new one" };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return { ok: false, error: "Too many attempts — request a new code" };
  }
  if (hashCode(options.code.trim()) !== record.codeHash) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Incorrect code" };
  }

  await prisma.verificationCode.delete({ where: { id: record.id } });
  return {
    ok: true,
    payload: record.payload ? JSON.parse(record.payload) : null,
    customerId: record.customerId,
  };
}

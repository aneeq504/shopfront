import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "./customer-auth";
import { prisma } from "./prisma";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_SESSION_GRACE_MS = 60 * 1000;
const ADMIN_FUTURE_SKEW_MS = 60 * 1000;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-secret";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export const ADMIN_EMAIL_SETTING = "adminEmail";

/** The owner email set from the admin panel, falling back to ADMIN_EMAIL in .env. */
export async function adminEmail(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key: ADMIN_EMAIL_SETTING } });
  return setting?.value || process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

export const ADMIN_PASSWORD_SETTING = "adminPasswordHash";
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

/** Checks the password saved from the admin panel, or ADMIN_PASSWORD until one is saved. */
export async function isAdminPassword(password: string): Promise<boolean> {
  const stored = await prisma.setting.findUnique({ where: { key: ADMIN_PASSWORD_SETTING } });
  if (stored) return verifyPassword(password, stored.value);
  const expected = createHmac("sha256", secret()).update(adminPassword()).digest();
  const given = createHmac("sha256", secret()).update(password).digest();
  return timingSafeEqual(expected, given);
}

export function adminPasswordProblem(password: string | undefined): string | null {
  if (!password || password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    return `The new password must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export async function setAdminPassword(password: string): Promise<void> {
  const value = hashPassword(password);
  await prisma.setting.upsert({
    where: { key: ADMIN_PASSWORD_SETTING },
    create: { key: ADMIN_PASSWORD_SETTING, value },
    update: { value },
  });
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

export function sessionToken(issuedAt = Date.now()): string {
  const timestamp = String(issuedAt);
  const signature = createHmac("sha256", secret())
    .update(`admin:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const [timestamp, signature, extra] = token.split(".");
  if (extra !== undefined || !timestamp || !/^\d+$/.test(timestamp)) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || !Number.isInteger(issuedAt)) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret()).update(`admin:${timestamp}`).digest("hex"),
  );
  const given = Buffer.from(signature ?? "");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return false;
  }

  const age = Date.now() - issuedAt;
  return age <= ADMIN_IDLE_TIMEOUT_MS + ADMIN_SESSION_GRACE_MS &&
    issuedAt - Date.now() <= ADMIN_FUTURE_SKEW_MS;
}

export function setAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_IDLE_TIMEOUT_MS / 1000 + ADMIN_SESSION_GRACE_MS / 1000,
  });
  return response;
}

export function isAdmin(): boolean {
  return isValidToken(cookies().get(ADMIN_COOKIE)?.value);
}

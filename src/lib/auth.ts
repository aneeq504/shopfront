import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "./customer-auth";
import { prisma } from "./prisma";

export const ADMIN_COOKIE = "admin_session";

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

export function sessionToken(): string {
  return createHmac("sha256", secret()).update("admin").digest("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(sessionToken());
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function isAdmin(): boolean {
  return isValidToken(cookies().get(ADMIN_COOKIE)?.value);
}

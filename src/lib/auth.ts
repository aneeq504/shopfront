import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-secret";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
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

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const CUSTOMER_COOKIE = "customer_session";

function secret(): string {
  return process.env.CUSTOMER_SESSION_SECRET ?? "dev-insecure-customer-secret";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const given = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, given);
}

export function customerToken(customerId: string): string {
  const signature = createHmac("sha256", secret()).update(customerId).digest("hex");
  return `${customerId}.${signature}`;
}

export function customerIdFromToken(token: string | undefined): string | null {
  if (!token) return null;
  const [customerId, signature] = token.split(".");
  if (!customerId || !signature) return null;
  const expected = Buffer.from(
    createHmac("sha256", secret()).update(customerId).digest("hex"),
  );
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  return customerId;
}

export function currentCustomerId(): string | null {
  return customerIdFromToken(cookies().get(CUSTOMER_COOKIE)?.value);
}

export async function currentCustomer() {
  const id = currentCustomerId();
  if (!id) return null;
  return prisma.customer.findUnique({ where: { id } });
}

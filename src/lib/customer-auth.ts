import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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

type SessionCustomer = { id: string; sessionVersion: number };

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

/** `<id>.<sessionVersion>.<signature>`; bumping sessionVersion signs out every device. */
export function customerToken(customer: SessionCustomer): string {
  const value = `${customer.id}.${customer.sessionVersion}`;
  return `${value}.${sign(value)}`;
}

export function parseCustomerToken(token: string | undefined): SessionCustomer | null {
  if (!token) return null;
  const [id, version, signature] = token.split(".");
  if (!id || !version || !signature) return null;
  const expected = Buffer.from(sign(`${id}.${version}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  const sessionVersion = Number(version);
  return Number.isInteger(sessionVersion) ? { id, sessionVersion } : null;
}

export async function currentCustomer() {
  const session = parseCustomerToken(cookies().get(CUSTOMER_COOKIE)?.value);
  if (!session) return null;
  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  return customer?.sessionVersion === session.sessionVersion ? customer : null;
}

export async function currentCustomerId(): Promise<string | null> {
  return (await currentCustomer())?.id ?? null;
}

export function customerSessionResponse(
  customer: SessionCustomer,
  body: Record<string, unknown>,
  status = 200,
) {
  const response = NextResponse.json(body, { status });
  response.cookies.set(CUSTOMER_COOKIE, customerToken(customer), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

import { adminEmail } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import {
  CANCELLATION_WINDOW_HOURS,
  cancellableUntil,
  formatDateTime,
} from "@/lib/orders";

type EmailOrderItem = {
  productName: string;
  colorName: string;
  quantity: number;
  unitPriceCents: number;
};

type EmailOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  totalCents: number;
  createdAt: Date;
  items: EmailOrderItem[];
};

function orderNumber(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function itemText(items: EmailOrderItem[]): string[] {
  return items.map((item) => {
    const color = item.colorName ? ` (${item.colorName})` : "";
    return `- ${item.productName}${color} × ${item.quantity} — ${formatPrice(item.unitPriceCents * item.quantity)}`;
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlEmail(title: string, content: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f3ec;color:#263238;font-family:Arial,sans-serif"><main style="max-width:600px;margin:24px auto;padding:28px;background:#fff;border:2px solid #263238;border-radius:16px"><h1 style="margin:0 0 20px;font-size:24px">${escapeHtml(title)}</h1>${content}</main></body></html>`;
}

function htmlItems(items: EmailOrderItem[]): string {
  return `<ul style="padding-left:22px;line-height:1.7">${items
    .map((item) => {
      const color = item.colorName ? ` (${escapeHtml(item.colorName)})` : "";
      return `<li><strong>${escapeHtml(item.productName)}</strong>${color} × ${item.quantity} — ${formatPrice(item.unitPriceCents * item.quantity)}</li>`;
    })
    .join("")}</ul>`;
}

function htmlLink(url: string, label: string): string {
  return `<p style="margin-top:24px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 18px;background:#f7c948;color:#263238;text-decoration:none;border:2px solid #263238;border-radius:12px;font-weight:bold">${escapeHtml(label)}</a></p>`;
}

function orderLink(order: EmailOrder): string {
  return `${appUrl()}/orders/${encodeURIComponent(order.id)}`;
}

export function buildOrderPlacedCustomerEmail(order: EmailOrder) {
  const number = orderNumber(order.id);
  const url = orderLink(order);
  const total = formatPrice(order.totalCents);
  const deadline = formatDateTime(cancellableUntil(order.createdAt));
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Thanks for your order with ShopFront. Order #${number} has been received.`,
    "",
    "Items:",
    ...itemText(order.items),
    "",
    `Total: ${total}`,
    "",
    "Delivery details:",
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.address}`,
    "",
    `Cash on delivery — please keep ${total} ready.`,
    "",
    `You can cancel free until ${deadline}.`,
    "",
    `View your order: ${url}`,
  ].join("\n");
  const html = htmlEmail(
    `Order #${number} received`,
    `<p>Hi ${escapeHtml(order.customerName)},</p><p>Thanks for your order with ShopFront. Order #${number} has been received.</p><h2 style="font-size:18px">Items</h2>${htmlItems(order.items)}<p><strong>Total: ${total}</strong></p><h2 style="font-size:18px">Delivery details</h2><p style="line-height:1.6"><strong>Name:</strong> ${escapeHtml(order.customerName)}<br><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br><strong>Address:</strong> ${escapeHtml(order.address)}</p><p>Cash on delivery — please keep ${total} ready.</p><p>You can cancel free until ${escapeHtml(deadline)}.</p>${htmlLink(url, "View your order")}`,
  );
  return { to: order.customerEmail, subject: `Order #${number} received`, text, html };
}

export function buildNewOrderOwnerEmail(order: EmailOrder, recipient: string) {
  const number = orderNumber(order.id);
  const total = formatPrice(order.totalCents);
  const url = `${appUrl()}/admin`;
  const text = [
    `New order #${number}`,
    "",
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.address}`,
    "",
    "Items:",
    ...itemText(order.items),
    "",
    `Total: ${total}`,
    "",
    `Manage orders: ${url}`,
  ].join("\n");
  const html = htmlEmail(
    `New order #${number}`,
    `<h2 style="font-size:18px">Customer details</h2><p style="line-height:1.6"><strong>Name:</strong> ${escapeHtml(order.customerName)}<br><strong>Email:</strong> ${escapeHtml(order.customerEmail)}<br><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br><strong>Address:</strong> ${escapeHtml(order.address)}</p><h2 style="font-size:18px">Items</h2>${htmlItems(order.items)}<p><strong>Total: ${total}</strong></p>${htmlLink(url, "Open admin orders")}`,
  );
  return {
    to: recipient,
    subject: `New order #${number} — ${total}`,
    text,
    html,
  };
}

export function buildOrderConfirmedEmail(order: EmailOrder) {
  const number = orderNumber(order.id);
  const url = orderLink(order);
  const total = formatPrice(order.totalCents);
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Your order #${number} is confirmed.`,
    "It will be dispatched soon.",
    "",
    "Items:",
    ...itemText(order.items),
    "",
    `Total: ${total}`,
    `Please keep ${total} cash ready.`,
    "",
    `View your order: ${url}`,
  ].join("\n");
  const html = htmlEmail(
    `Order #${number} confirmed`,
    `<p>Hi ${escapeHtml(order.customerName)},</p><p>Your order is confirmed and will be dispatched soon.</p><h2 style="font-size:18px">Items</h2>${htmlItems(order.items)}<p><strong>Total: ${total}</strong></p><p>Please keep ${total} cash ready.</p>${htmlLink(url, "View your order")}`,
  );
  return {
    to: order.customerEmail,
    subject: `Order #${number} confirmed`,
    text,
    html,
  };
}

export async function sendOrderPlacedEmails(order: EmailOrder): Promise<void> {
  const customerMail = sendMail(buildOrderPlacedCustomerEmail(order)).catch((error) => {
    console.error("[order-email] customer receipt failed", error);
  });
  const ownerMail = adminEmail()
    .then((recipient) => {
      if (recipient) {
        return sendMail(buildNewOrderOwnerEmail(order, recipient)).catch((error) => {
          console.error("[order-email] owner alert failed", error);
        });
      }
    })
    .catch((error) => {
      console.error("[order-email] could not resolve owner email", error);
    });
  await Promise.allSettled([customerMail, ownerMail]);
}

export async function sendDueConfirmationEmails(): Promise<void> {
  const now = new Date();
  const cutoff = new Date(
    now.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000,
  );
  const dueOrders = await prisma.order.findMany({
    where: {
      confirmationEmailSentAt: null,
      cancelledAt: null,
      createdAt: { lte: cutoff },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: { items: true },
  });
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of dueOrders) {
    const claim = await prisma.order.updateMany({
      where: {
        id: order.id,
        confirmationEmailSentAt: null,
        cancelledAt: null,
      },
      data: { confirmationEmailSentAt: now },
    });
    if (claim.count !== 1) {
      skipped += 1;
      continue;
    }

    try {
      await sendMail(buildOrderConfirmedEmail(order));
      sent += 1;
    } catch (error) {
      failed += 1;
      try {
        await prisma.order.updateMany({
          where: { id: order.id },
          data: { confirmationEmailSentAt: null },
        });
      } catch (resetError) {
        console.error(`[order-confirmation] failed to reset claim for ${order.id}`, resetError);
      }
      console.error(`[order-confirmation] confirmation failed for ${order.id}`, error);
    }
  }

  console.info(
    `[order-confirmation] checked=${dueOrders.length} sent=${sent} skipped=${skipped} failed=${failed}`,
  );
}

import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function transporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  if (!cached) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    cached = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return cached;
}

export function mailFrom(): string {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "no-reply@shopfront.local";
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const transport = transporter();
  if (!transport) {
    // No SMTP configured (local development): log the message instead of sending.
    console.info(`[mail:dev] to=${options.to} subject=${options.subject}\n${options.text}`);
    return;
  }
  await transport.sendMail({ from: mailFrom(), ...options });
}

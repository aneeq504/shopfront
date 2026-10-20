const schedulerGlobal = globalThis as typeof globalThis & {
  __shopfrontOrderConfirmationScheduler?: boolean;
};

export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    schedulerGlobal.__shopfrontOrderConfirmationScheduler
  ) {
    return;
  }

  schedulerGlobal.__shopfrontOrderConfirmationScheduler = true;
  const { sendDueConfirmationEmails } = await import("./lib/order-emails");
  let inFlight = false;

  const run = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      await sendDueConfirmationEmails();
    } catch (error) {
      console.error("[order-confirmation] scheduler run failed", error);
    } finally {
      inFlight = false;
    }
  };

  setTimeout(() => void run(), 10_000);
  setInterval(() => void run(), 5 * 60 * 1000);
}

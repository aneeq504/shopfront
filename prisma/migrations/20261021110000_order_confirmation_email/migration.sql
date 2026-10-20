-- AlterTable
ALTER TABLE "Order" ADD COLUMN "confirmationEmailSentAt" DATETIME;

-- Backfill
UPDATE "Order"
SET "confirmationEmailSentAt" = CAST(strftime('%s', 'now') AS INTEGER) * 1000
WHERE "cancelledAt" IS NOT NULL
   OR "createdAt" <= CAST(strftime('%s', 'now', '-24 hours') AS INTEGER) * 1000;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Backfill
UPDATE "Product"
SET "position" = (
  SELECT COUNT(*)
  FROM "Product" p2
  WHERE p2."createdAt" > "Product"."createdAt"
     OR (p2."createdAt" = "Product"."createdAt" AND p2."id" > "Product"."id")
);

-- CreateIndex
CREATE INDEX "Product_position_idx" ON "Product"("position");

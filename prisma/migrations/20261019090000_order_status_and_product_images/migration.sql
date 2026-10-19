-- AlterTable
ALTER TABLE "Order" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "deliveredAt" DATETIME;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductImage_productId_position_idx" ON "ProductImage"("productId", "position");

-- Existing single images become each product's first photo
INSERT INTO "ProductImage" ("id", "productId", "url", "position")
SELECT 'img_' || "id", "id", "imageUrl", 0 FROM "Product" WHERE "imageUrl" <> '';

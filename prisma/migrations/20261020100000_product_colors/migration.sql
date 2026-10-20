-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_productId_name_key" ON "ProductColor"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductColor_productId_position_idx" ON "ProductColor"("productId", "position");

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "colorId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "colorName" TEXT NOT NULL DEFAULT '';

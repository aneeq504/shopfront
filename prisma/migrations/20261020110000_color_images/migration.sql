-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "colorId" TEXT REFERENCES "ProductColor" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ProductImage_colorId_position_idx" ON "ProductImage"("colorId", "position");

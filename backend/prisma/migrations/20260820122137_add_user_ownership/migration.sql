-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_by" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "created_by" TEXT;

-- CreateIndex
CREATE INDEX "categories_created_by_idx" ON "categories"("created_by");

-- CreateIndex
CREATE INDEX "products_created_by_idx" ON "products"("created_by");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

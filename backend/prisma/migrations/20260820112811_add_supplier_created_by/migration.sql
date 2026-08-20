-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "created_by" TEXT;

-- CreateIndex
CREATE INDEX "suppliers_created_by_idx" ON "suppliers"("created_by");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

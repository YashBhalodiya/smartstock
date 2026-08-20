import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Clearing all feeded data from database...');

  await prisma.notification.deleteMany({});
  await prisma.restockOrderItem.deleteMany({});
  await prisma.restockOrder.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ All database tables successfully cleared. Database is completely fresh!');
}

cleanDatabase()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma Database Seeding...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.notification.deleteMany();
  await prisma.restockOrderItem.deleteMany();
  await prisma.restockOrder.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create Shopkeeper User
  const passwordHash = await bcrypt.hash('password', 10);
  const shopkeeper = await prisma.user.create({
    data: {
      name: 'Shopkeeper Admin',
      email: 'store@stockflow.com',
      passwordHash,
      role: 'SHOPKEEPER',
      isActive: true
    }
  });

  console.log(`👤 Created Shopkeeper User: ${shopkeeper.email} (ID: ${shopkeeper.id})`);

  // 3. Create Categories
  const categoriesData = [
    { name: 'Food', description: 'Packaged foods, snacks, and daily groceries' },
    { name: 'Personal Care', description: 'Soaps, shampoos, hygiene & personal care' },
    { name: 'Cleaning', description: 'Detergents, cleaners, and household care' },
    { name: 'Grains', description: 'Rice, wheat atta, pulses, and cooking oils' },
    { name: 'Beverages', description: 'Tea, coffee, packaged juices & soft drinks' }
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`🏷️ Created ${categoryMap.size} Categories.`);

  // 4. Create Suppliers
  const suppliersData = [
    {
      name: 'ABC Distributors',
      email: 'abc@example.com',
      phone: '+91 98765 43210',
      address: '12, Sector A, GIDC, Ahmedabad'
    },
    {
      name: 'Shree Wholesale',
      email: 'shree@example.com',
      phone: '+91 99887 76655',
      address: '45, Market Lane, Surat'
    },
    {
      name: 'Gujarat FMCG Supply',
      email: 'gujfmcg@example.com',
      phone: '+91 91234 56789',
      address: '88, Ring Road, Rajkot'
    },
    {
      name: 'Metro Distributors',
      email: 'metro@example.com',
      phone: '+91 94455 66778',
      address: '101, Mall Area, Vadodara'
    }
  ];

  const supplierMap = new Map();
  for (const sup of suppliersData) {
    const created = await prisma.supplier.create({ data: { ...sup, createdBy: shopkeeper.id } });
    supplierMap.set(sup.name, created.id);
  }
  console.log(`🏢 Created ${supplierMap.size} Suppliers.`);

  // 5. Create 15 Products with realistic store inventory
  const productsData = [
    {
      name: 'Maggi 2-Min Noodles 280g',
      sku: 'SKU-1001',
      barcode: '8901058002316',
      categoryName: 'Food',
      supplierName: 'ABC Distributors',
      purchasePrice: 11.00,
      sellingPrice: 14.00,
      currentStock: 9, // Low stock! (min = 15)
      minimumStock: 15,
      restockQuantity: 50
    },
    {
      name: 'Dove Soap 100g',
      sku: 'SKU-1002',
      barcode: '8901030753021',
      categoryName: 'Personal Care',
      supplierName: 'ABC Distributors',
      purchasePrice: 42.00,
      sellingPrice: 55.00,
      currentStock: 7, // Low stock! (min = 12)
      minimumStock: 12,
      restockQuantity: 30
    },
    {
      name: 'Aashirvaad Atta 5kg',
      sku: 'SKU-1003',
      barcode: '8901725181229',
      categoryName: 'Grains',
      supplierName: 'Shree Wholesale',
      purchasePrice: 210.00,
      sellingPrice: 260.00,
      currentStock: 25,
      minimumStock: 10,
      restockQuantity: 20
    },
    {
      name: 'Fortune Sunflower Oil 1L',
      sku: 'SKU-1004',
      barcode: '8906007281014',
      categoryName: 'Grains',
      supplierName: 'Shree Wholesale',
      purchasePrice: 115.00,
      sellingPrice: 145.00,
      currentStock: 0, // Out of stock! (min = 10)
      minimumStock: 10,
      restockQuantity: 40
    },
    {
      name: 'Surf Excel Easy Wash 1kg',
      sku: 'SKU-1005',
      barcode: '8901030704382',
      categoryName: 'Cleaning',
      supplierName: 'Gujarat FMCG Supply',
      purchasePrice: 135.00,
      sellingPrice: 170.00,
      currentStock: 18,
      minimumStock: 8,
      restockQuantity: 15
    },
    {
      name: 'Colgate MaxFresh 150g',
      sku: 'SKU-1006',
      barcode: '8901123004566',
      categoryName: 'Personal Care',
      supplierName: 'ABC Distributors',
      purchasePrice: 75.00,
      sellingPrice: 95.00,
      currentStock: 35,
      minimumStock: 12,
      restockQuantity: 25
    },
    {
      name: 'Tata Tea Premium 1kg',
      sku: 'SKU-1007',
      barcode: '8901052005085',
      categoryName: 'Beverages',
      supplierName: 'Metro Distributors',
      purchasePrice: 340.00,
      sellingPrice: 420.00,
      currentStock: 14,
      minimumStock: 8,
      restockQuantity: 15
    },
    {
      name: 'Parle-G Gold 1kg',
      sku: 'SKU-1008',
      barcode: '8901063004059',
      categoryName: 'Food',
      supplierName: 'Gujarat FMCG Supply',
      purchasePrice: 95.00,
      sellingPrice: 120.00,
      currentStock: 4, // Low stock! (min = 10)
      minimumStock: 10,
      restockQuantity: 50
    },
    {
      name: 'Sugar Premium 1kg',
      sku: 'SKU-1009',
      barcode: '8906002003055',
      categoryName: 'Food',
      supplierName: 'Shree Wholesale',
      purchasePrice: 36.00,
      sellingPrice: 45.00,
      currentStock: 65,
      minimumStock: 20,
      restockQuantity: 100
    },
    {
      name: 'Rice Basmati 5kg',
      sku: 'SKU-1010',
      barcode: '8901725112230',
      categoryName: 'Grains',
      supplierName: 'Shree Wholesale',
      purchasePrice: 450.00,
      sellingPrice: 550.00,
      currentStock: 4, // Low stock! (min = 8)
      minimumStock: 8,
      restockQuantity: 15
    },
    {
      name: 'Tata Salt 1kg',
      sku: 'SKU-1011',
      barcode: '8901058002330',
      categoryName: 'Food',
      supplierName: 'ABC Distributors',
      purchasePrice: 22.00,
      sellingPrice: 28.00,
      currentStock: 50,
      minimumStock: 15,
      restockQuantity: 50
    },
    {
      name: 'Lays Potato Chips 52g',
      sku: 'SKU-1012',
      barcode: '8901491001201',
      categoryName: 'Food',
      supplierName: 'Gujarat FMCG Supply',
      purchasePrice: 16.00,
      sellingPrice: 20.00,
      currentStock: 40,
      minimumStock: 15,
      restockQuantity: 60
    },
    {
      name: 'Dettol Antiseptic Liquid 250ml',
      sku: 'SKU-1013',
      barcode: '8901396001050',
      categoryName: 'Personal Care',
      supplierName: 'ABC Distributors',
      purchasePrice: 98.00,
      sellingPrice: 125.00,
      currentStock: 15,
      minimumStock: 10,
      restockQuantity: 20
    },
    {
      name: 'Vim Dishwash Liquid 500ml',
      sku: 'SKU-1014',
      barcode: '8901030612011',
      categoryName: 'Cleaning',
      supplierName: 'Gujarat FMCG Supply',
      purchasePrice: 85.00,
      sellingPrice: 110.00,
      currentStock: 22,
      minimumStock: 10,
      restockQuantity: 20
    },
    {
      name: 'Nescafe Classic Instant Coffee 50g',
      sku: 'SKU-1015',
      barcode: '8901058852101',
      categoryName: 'Beverages',
      supplierName: 'Metro Distributors',
      purchasePrice: 140.00,
      sellingPrice: 175.00,
      currentStock: 12,
      minimumStock: 8,
      restockQuantity: 15
    }
  ];

  const productMap = new Map();

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categoryName);
    const supplierId = supplierMap.get(prod.supplierName);

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        categoryId,
        supplierId,
        purchasePrice: prod.purchasePrice,
        sellingPrice: prod.sellingPrice,
        currentStock: prod.currentStock,
        minimumStock: prod.minimumStock,
        restockQuantity: prod.restockQuantity,
        isActive: true
      }
    });

    productMap.set(prod.sku, createdProduct);

    // Create Initial Inventory Transaction ledger record
    await prisma.inventoryTransaction.create({
      data: {
        productId: createdProduct.id,
        type: 'INITIAL_STOCK',
        quantityChange: prod.currentStock,
        stockBefore: 0,
        stockAfter: prod.currentStock,
        referenceType: 'INITIALIZATION',
        reason: 'Initial store inventory seed',
        createdBy: shopkeeper.id
      }
    });
  }

  console.log(`📦 Created ${productsData.length} Products and Initial Inventory Ledger Entries.`);

  // 6. Create Seed Restock Orders
  const abcSupplierId = supplierMap.get('ABC Distributors');
  const shreeSupplierId = supplierMap.get('Shree Wholesale');
  const gujSupplierId = supplierMap.get('Gujarat FMCG Supply');

  const maggi = productMap.get('SKU-1001');
  const dove = productMap.get('SKU-1002');
  const tataSalt = productMap.get('SKU-1011');
  const atta = productMap.get('SKU-1003');
  const oil = productMap.get('SKU-1004');
  const surf = productMap.get('SKU-1005');

  // Restock Order 1: PENDING_APPROVAL
  const ro1Total = (Number(maggi.purchasePrice) * maggi.restockQuantity) +
                   (Number(dove.purchasePrice) * dove.restockQuantity) +
                   (Number(tataSalt.purchasePrice) * tataSalt.restockQuantity);

  const ro1 = await prisma.restockOrder.create({
    data: {
      orderNumber: 'RO-1004',
      supplierId: abcSupplierId,
      status: 'PENDING_APPROVAL',
      totalAmount: ro1Total,
      createdBy: shopkeeper.id,
      items: {
        create: [
          { productId: maggi.id, quantity: maggi.restockQuantity, unitPurchasePrice: maggi.purchasePrice, subtotal: Number(maggi.purchasePrice) * maggi.restockQuantity },
          { productId: dove.id, quantity: dove.restockQuantity, unitPurchasePrice: dove.purchasePrice, subtotal: Number(dove.purchasePrice) * dove.restockQuantity },
          { productId: tataSalt.id, quantity: tataSalt.restockQuantity, unitPurchasePrice: tataSalt.purchasePrice, subtotal: Number(tataSalt.purchasePrice) * tataSalt.restockQuantity }
        ]
      }
    }
  });

  // Restock Order 2: SENT / EMAIL SENT
  const ro2Total = (Number(atta.purchasePrice) * atta.restockQuantity) +
                   (Number(oil.purchasePrice) * oil.restockQuantity);

  await prisma.restockOrder.create({
    data: {
      orderNumber: 'RO-1003',
      supplierId: shreeSupplierId,
      status: 'SENT',
      totalAmount: ro2Total,
      createdBy: shopkeeper.id,
      approvedAt: new Date(Date.now() - 86400000),
      sentAt: new Date(Date.now() - 82800000),
      items: {
        create: [
          { productId: atta.id, quantity: atta.restockQuantity, unitPurchasePrice: atta.purchasePrice, subtotal: Number(atta.purchasePrice) * atta.restockQuantity },
          { productId: oil.id, quantity: oil.restockQuantity, unitPurchasePrice: oil.purchasePrice, subtotal: Number(oil.purchasePrice) * oil.restockQuantity }
        ]
      }
    }
  });

  // Restock Order 3: RECEIVED
  const ro3Total = Number(surf.purchasePrice) * surf.restockQuantity;

  await prisma.restockOrder.create({
    data: {
      orderNumber: 'RO-1002',
      supplierId: gujSupplierId,
      status: 'RECEIVED',
      totalAmount: ro3Total,
      createdBy: shopkeeper.id,
      approvedAt: new Date(Date.now() - 172800000),
      sentAt: new Date(Date.now() - 169200000),
      receivedAt: new Date(Date.now() - 86400000),
      items: {
        create: [
          { productId: surf.id, quantity: surf.restockQuantity, unitPurchasePrice: surf.purchasePrice, subtotal: ro3Total }
        ]
      }
    }
  });

  console.log('📋 Created Seed Restock Orders (Pending, Sent, Received).');

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: shopkeeper.id,
        type: 'LOW_STOCK',
        title: 'Out of Stock Alert',
        message: 'Fortune Sunflower Oil 1L (SKU-1004) is out of stock.',
        referenceType: 'PRODUCT',
        referenceId: oil.id,
        isRead: false
      },
      {
        userId: shopkeeper.id,
        type: 'RESTOCK_ORDER_CREATED',
        title: 'Restock Order Pending Approval',
        message: `Restock order ${ro1.orderNumber} generated for ABC Distributors.`,
        referenceType: 'RESTOCK_ORDER',
        referenceId: ro1.id,
        isRead: false
      },
      {
        userId: shopkeeper.id,
        type: 'RESTOCK_RECEIVED',
        title: 'Inventory Order Received',
        message: 'Restock order RO-1002 has been received and stock updated.',
        referenceType: 'RESTOCK_ORDER',
        referenceId: 'RO-1002',
        isRead: true
      }
    ]
  });

  console.log('🔔 Created Initial System Notifications.');
  console.log('✅ Prisma Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

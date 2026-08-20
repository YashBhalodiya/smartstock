import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createProduct(userId, data) {
  // Check SKU uniqueness per shopkeeper
  const existingSku = await prisma.product.findFirst({
    where: {
      sku: data.sku,
      createdBy: userId,
      isActive: true
    }
  });

  if (existingSku) {
    throw new AppError(`Product with SKU "${data.sku}" already exists in your inventory`, 400, 'DUPLICATE_SKU');
  }

  // Create product explicitly linked to authenticated shopkeeper (createdBy: userId)
  const product = await prisma.$transaction(async (tx) => {
    const newProd = await tx.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        restockQuantity: data.restockQuantity,
        createdBy: userId,
        isActive: true
      },
      include: {
        category: true,
        supplier: true
      }
    });

    // Record initial inventory transaction linked to shopkeeper
    if (data.currentStock > 0) {
      await tx.inventoryTransaction.create({
        data: {
          productId: newProd.id,
          type: 'INITIAL_STOCK',
          quantityChange: data.currentStock,
          stockBefore: 0,
          stockAfter: data.currentStock,
          reason: 'Initial Product Inventory Setup',
          createdBy: userId
        }
      });
    }

    return newProd;
  });

  return formatProduct(product);
}

export async function getProducts(userId) {
  const products = await prisma.product.findMany({
    where: {
      createdBy: userId,
      isActive: true
    },
    include: {
      category: true,
      supplier: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map(formatProduct);
}

export async function getProductById(userId, productId) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      createdBy: userId
    },
    include: {
      category: true,
      supplier: true
    }
  });

  if (!product) {
    throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
  }

  return formatProduct(product);
}

export async function updateProduct(userId, productId, data) {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      createdBy: userId
    }
  });

  if (!existing) {
    throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
    include: {
      category: true,
      supplier: true
    }
  });

  return formatProduct(updated);
}

export async function deleteProduct(userId, productId) {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      createdBy: userId
    }
  });

  if (!existing) {
    throw new AppError('Product not found or access denied', 404, 'PRODUCT_NOT_FOUND');
  }

  // Soft delete product
  const deactivated = await prisma.product.update({
    where: { id: productId },
    data: { isActive: false }
  });

  return deactivated;
}

function formatProduct(p) {
  return {
    id: p.id,
    title: p.name,
    sku: p.sku,
    barcode: p.barcode || '',
    categoryId: p.categoryId,
    category: p.category ? p.category.name : '',
    supplierId: p.supplierId,
    supplierName: p.supplier ? p.supplier.name : '',
    purchasePrice: Number(p.purchasePrice),
    sellingPrice: Number(p.sellingPrice),
    currentStock: p.currentStock,
    minStock: p.minimumStock,
    restockQty: p.restockQuantity,
    createdBy: p.createdBy,
    status: p.isActive ? 'Active' : 'Inactive',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

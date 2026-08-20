import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createSale(userId, data) {
  const { cartItems, paymentMethod = 'CASH', discount = 0 } = data;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError('Cart cannot be empty', 400, 'EMPTY_CART');
  }

  // Calculate invoice subtotal & tax
  let subtotal = 0;
  for (const item of cartItems) {
    const itemSubtotal = Number(item.sellingPrice || item.unitPrice || 0) * Number(item.quantity || 1);
    subtotal += itemSubtotal;
  }

  const numericDiscount = Number(discount) || 0;
  const taxableSubtotal = Math.max(0, subtotal - numericDiscount);
  const tax = Math.round((taxableSubtotal * 0.05) * 100) / 100;
  const totalAmount = taxableSubtotal + tax;

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  // Execute database transaction for Sale creation & stock updates
  const sale = await prisma.$transaction(async (tx) => {
    // 1. Create Sale header
    const createdSale = await tx.sale.create({
      data: {
        invoiceNumber,
        subtotal,
        discount: numericDiscount,
        tax,
        totalAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'COMPLETED',
        createdBy: userId
      }
    });

    // 2. Process each sale item and deduct product stock
    for (const item of cartItems) {
      // Find product by id or sku
      const product = await tx.product.findFirst({
        where: {
          OR: [
            { id: item.productId || item.id },
            { sku: item.sku }
          ],
          createdBy: userId
        }
      });

      if (!product) {
        throw new AppError(`Product "${item.title || item.name || item.sku}" not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.sellingPrice || item.unitPrice || product.sellingPrice);
      const itemSubtotal = unitPrice * qty;

      // Create SaleItem
      await tx.saleItem.create({
        data: {
          saleId: createdSale.id,
          productId: product.id,
          quantity: qty,
          unitPrice,
          subtotal: itemSubtotal
        }
      });

      // Update product current stock
      const stockBefore = product.currentStock;
      const stockAfter = Math.max(0, stockBefore - qty);

      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: stockAfter }
      });

      // Log inventory ledger transaction
      await tx.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: 'SALE',
          quantityChange: -qty,
          stockBefore,
          stockAfter,
          referenceType: 'SALE',
          referenceId: createdSale.id,
          reason: `POS Sale Invoice ${invoiceNumber}`,
          createdBy: userId
        }
      });
    }

    return tx.sale.findUnique({
      where: { id: createdSale.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  });

  return formatSale(sale);
}

export async function getSales(userId) {
  const sales = await prisma.sale.findMany({
    where: {
      createdBy: userId
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return sales.map(formatSale);
}

function formatSale(s) {
  return {
    id: s.id,
    invoiceNo: s.invoiceNumber,
    subtotal: Number(s.subtotal),
    discount: Number(s.discount),
    tax: Number(s.tax),
    totalAmount: Number(s.totalAmount),
    paymentMethod: s.paymentMethod,
    itemsCount: s.items.reduce((acc, item) => acc + item.quantity, 0),
    status: s.status,
    createdBy: s.createdBy,
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    items: s.items.map(i => ({
      id: i.id,
      productId: i.productId,
      title: i.product ? i.product.name : 'Unknown Product',
      sku: i.product ? i.product.sku : '',
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal)
    }))
  };
}

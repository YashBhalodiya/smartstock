import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendRestockOrderEmail } from '../../utils/mailer.js';

/**
 * Check if product stock is 0 (out of stock) and auto-generate pending restock order
 */
export async function checkAndCreateAutoRestockOrder(txOrPrisma, productId, userId) {
  const client = txOrPrisma || prisma;

  const product = await client.product.findUnique({
    where: { id: productId },
    include: { supplier: true }
  });

  if (!product || product.currentStock > 0) {
    return null;
  }

  const effectiveUserId = userId || product.createdBy;
  if (!effectiveUserId) return null;

  let targetSupplierId = product.supplierId;
  if (!targetSupplierId) {
    const defaultSupplier = await client.supplier.findFirst({
      where: { createdBy: effectiveUserId, isActive: true }
    });
    if (defaultSupplier) {
      targetSupplierId = defaultSupplier.id;
      await client.product.update({
        where: { id: product.id },
        data: { supplierId: defaultSupplier.id }
      });
    }
  }

  if (!targetSupplierId) return null;

  // 1. Check if there is already an active pending restock order for this supplier
  const existingPendingOrder = await client.restockOrder.findFirst({
    where: {
      supplierId: targetSupplierId,
      status: 'PENDING_APPROVAL',
      createdBy: effectiveUserId
    },
    include: { items: true }
  });

  const orderQty = product.restockQuantity > 0 ? product.restockQuantity : 10;
  const unitPrice = Number(product.purchasePrice || 0);
  const subtotal = orderQty * unitPrice;

  if (existingPendingOrder) {
    // Check if item already exists in this pending order
    const existingItem = existingPendingOrder.items.find(i => i.productId === productId);
    if (!existingItem) {
      await client.restockOrderItem.create({
        data: {
          restockOrderId: existingPendingOrder.id,
          productId,
          quantity: orderQty,
          unitPurchasePrice: unitPrice,
          subtotal
        }
      });

      const newTotal = Number(existingPendingOrder.totalAmount) + subtotal;
      await client.restockOrder.update({
        where: { id: existingPendingOrder.id },
        data: { totalAmount: newTotal }
      });
    }
    return existingPendingOrder;
  }

  // Check if there is an APPROVED or SENT order created in the last 24 hours to prevent spam
  const recentSentOrder = await client.restockOrder.findFirst({
    where: {
      supplierId: targetSupplierId,
      status: { in: ['APPROVED', 'SENT'] },
      createdBy: effectiveUserId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    include: {
      items: true
    }
  });

  if (recentSentOrder && recentSentOrder.items.some(i => i.productId === productId)) {
    console.log(`ℹ️ Restock order for product ${product.name} recently sent. Skipping duplicate creation.`);
    return null;
  }

  // 2. Create new Restock Order in PENDING_APPROVAL status
  const orderNumber = `RO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const newOrder = await client.restockOrder.create({
    data: {
      orderNumber,
      supplierId: targetSupplierId,
      status: 'PENDING_APPROVAL',
      totalAmount: subtotal,
      createdBy: effectiveUserId,
      items: {
        create: [
          {
            productId,
            quantity: orderQty,
            unitPurchasePrice: unitPrice,
            subtotal
          }
        ]
      }
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  // 3. Create Notification for Shopkeeper
  await client.notification.create({
    data: {
      userId: effectiveUserId,
      type: 'RESTOCK_ORDER_CREATED',
      title: '🚨 Out of Stock Alert & Restock Generated',
      message: `Product "${product.name}" is OUT OF STOCK (0 units left). Restock Order #${orderNumber} automatically created and pending your approval.`,
      referenceType: 'RESTOCK_ORDER',
      referenceId: newOrder.id
    }
  });

  console.log(`✨ Auto-generated Restock Order #${orderNumber} for out-of-stock product "${product.name}"`);
  return newOrder;
}

export async function scanAndCreateAutoRestockOrders(userId) {
  if (!userId) return;
  try {
    const zeroStockProducts = await prisma.product.findMany({
      where: {
        createdBy: userId,
        currentStock: { lte: 0 },
        isActive: true
      }
    });

    for (const prod of zeroStockProducts) {
      await checkAndCreateAutoRestockOrder(prisma, prod.id, userId);
    }
  } catch (err) {
    console.error('Error scanning zero stock products for restock:', err.message);
  }
}

export async function getRestockOrders(userId) {
  await scanAndCreateAutoRestockOrders(userId);

  const orders = await prisma.restockOrder.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { createdBy: null }
      ]
    },
    include: {
      supplier: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(formatRestockOrder);
}

export async function createRestockOrder(userId, data) {
  const { supplierId, productId, quantity } = data;

  const product = await prisma.product.findFirst({
    where: { id: productId, createdBy: userId }
  });

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const suppId = supplierId || product.supplierId;
  const qtyToOrder = Number(quantity) || product.restockQuantity || 10;
  const unitPrice = Number(product.purchasePrice || 0);
  const subtotal = qtyToOrder * unitPrice;

  // Check if pending order exists for supplier
  const pendingOrder = await prisma.restockOrder.findFirst({
    where: { supplierId: suppId, status: 'PENDING_APPROVAL', createdBy: userId },
    include: { items: true }
  });

  if (pendingOrder) {
    const existingItem = pendingOrder.items.find(i => i.productId === productId);
    if (existingItem) {
      const updatedQty = existingItem.quantity + qtyToOrder;
      const updatedSub = updatedQty * unitPrice;
      await prisma.restockOrderItem.update({
        where: { id: existingItem.id },
        data: { quantity: updatedQty, subtotal: updatedSub }
      });
    } else {
      await prisma.restockOrderItem.create({
        data: {
          restockOrderId: pendingOrder.id,
          productId,
          quantity: qtyToOrder,
          unitPurchasePrice: unitPrice,
          subtotal
        }
      });
    }

    // Recalculate total amount
    const allItems = await prisma.restockOrderItem.findMany({ where: { restockOrderId: pendingOrder.id } });
    const newTotal = allItems.reduce((acc, i) => acc + Number(i.subtotal), 0);

    const updated = await prisma.restockOrder.update({
      where: { id: pendingOrder.id },
      data: { totalAmount: newTotal },
      include: { supplier: true, items: { include: { product: true } } }
    });

    return formatRestockOrder(updated);
  }

  const orderNumber = `RO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder = await prisma.restockOrder.create({
    data: {
      orderNumber,
      supplierId: suppId,
      status: 'PENDING_APPROVAL',
      totalAmount: subtotal,
      createdBy: userId,
      items: {
        create: [
          {
            productId,
            quantity: qtyToOrder,
            unitPurchasePrice: unitPrice,
            subtotal
          }
        ]
      }
    },
    include: { supplier: true, items: { include: { product: true } } }
  });

  await prisma.notification.create({
    data: {
      userId,
      type: 'RESTOCK_ORDER_CREATED',
      title: 'Restock Order Created',
      message: `Manual restock order #${orderNumber} created for supplier ${newOrder.supplier.name} awaiting your approval.`,
      referenceType: 'RESTOCK_ORDER',
      referenceId: newOrder.id
    }
  });

  return formatRestockOrder(newOrder);
}

export async function approveRestockOrder(userId, orderId) {
  let order = await prisma.restockOrder.findFirst({
    where: {
      OR: [
        { id: orderId },
        { orderNumber: orderId }
      ],
      ...(userId ? {
        OR: [
          { createdBy: userId },
          { createdBy: null }
        ]
      } : {})
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  if (!order) {
    order = await prisma.restockOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        supplier: true,
        items: { include: { product: true } }
      }
    });
  }

  if (!order) {
    throw new AppError('Restock order not found', 404, 'ORDER_NOT_FOUND');
  }

  if (order.status !== 'PENDING_APPROVAL') {
    throw new AppError(`Restock order cannot be approved from current state "${order.status}"`, 400, 'INVALID_STATUS');
  }

  const shopkeeper = await prisma.user.findUnique({ where: { id: userId } });

  const updatedOrder = await prisma.restockOrder.update({
    where: { id: order.id },
    data: {
      status: 'SENT',
      approvedAt: new Date(),
      sentAt: new Date()
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  const formatted = formatRestockOrder(updatedOrder);

  // Send purchase order email to supplier
  const supplierEmail = order.supplier?.email;
  if (supplierEmail) {
    await sendRestockOrderEmail(supplierEmail, formatted, shopkeeper);
  }

  // Create notification
  const notifUserId = userId || order.createdBy;
  if (notifUserId) {
    await prisma.notification.create({
      data: {
        userId: notifUserId,
        type: 'RESTOCK_EMAIL_SENT',
        title: 'Restock Order Approved & Emailed',
        message: `Restock order #${order.orderNumber} approved! Purchase order email sent to supplier ${order.supplier?.name || 'Supplier'} (${supplierEmail || 'No Email'}).`,
        referenceType: 'RESTOCK_ORDER',
        referenceId: order.id
      }
    });
  }

  return formatted;
}

export async function receiveRestockOrder(userId, orderId) {
  let order = await prisma.restockOrder.findFirst({
    where: {
      OR: [
        { id: orderId },
        { orderNumber: orderId }
      ],
      ...(userId ? {
        OR: [
          { createdBy: userId },
          { createdBy: null }
        ]
      } : {})
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  if (!order) {
    order = await prisma.restockOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        supplier: true,
        items: { include: { product: true } }
      }
    });
  }

  if (!order) {
    throw new AppError('Restock order not found', 404, 'ORDER_NOT_FOUND');
  }

  if (order.status === 'RECEIVED' || order.status === 'CANCELLED') {
    throw new AppError(`Order is already ${order.status}`, 400, 'INVALID_STATUS');
  }

  // Execute database transaction to update stock & log ledger entries
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const stockBefore = product.currentStock;
        const stockAfter = stockBefore + item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: stockAfter }
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: 'RESTOCK',
            quantityChange: item.quantity,
            stockBefore,
            stockAfter,
            referenceType: 'RESTOCK_ORDER',
            referenceId: order.id,
            reason: `Restock Order #${order.orderNumber} received from ${order.supplier?.name || 'Supplier'}`,
            createdBy: userId || order.createdBy
          }
        });
      }
    }

    const recOrder = await tx.restockOrder.update({
      where: { id: order.id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date()
      },
      include: {
        supplier: true,
        items: { include: { product: true } }
      }
    });

    if (userId || order.createdBy) {
      await tx.notification.create({
        data: {
          userId: userId || order.createdBy,
          type: 'RESTOCK_RECEIVED',
          title: 'Restock Inventory Received',
          message: `Restock order #${order.orderNumber} received. Stock levels have been successfully updated in inventory.`,
          referenceType: 'RESTOCK_ORDER',
          referenceId: order.id
        }
      });
    }

    return recOrder;
  });

  return formatRestockOrder(updated);
}

export async function cancelRestockOrder(userId, orderId) {
  let order = await prisma.restockOrder.findFirst({
    where: {
      OR: [
        { id: orderId },
        { orderNumber: orderId }
      ],
      ...(userId ? {
        OR: [
          { createdBy: userId },
          { createdBy: null }
        ]
      } : {})
    }
  });

  if (!order) {
    order = await prisma.restockOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      }
    });
  }

  if (!order) {
    throw new AppError('Restock order not found', 404, 'ORDER_NOT_FOUND');
  }

  const updated = await prisma.restockOrder.update({
    where: { id: order.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date()
    },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  return formatRestockOrder(updated);
}

function formatRestockOrder(r) {
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    supplierId: r.supplierId,
    supplierName: r.supplier ? r.supplier.name : 'Unknown Supplier',
    email: r.supplier ? r.supplier.email : '',
    supplierPhone: r.supplier ? r.supplier.phone : '',
    supplierAddress: r.supplier ? r.supplier.address : '',
    itemsCount: r.items ? r.items.length : 0,
    totalAmount: Number(r.totalAmount || 0),
    status: mapStatusLabel(r.status),
    rawStatus: r.status,
    createdAt: r.createdAt,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    approvedAt: r.approvedAt,
    sentAt: r.sentAt,
    receivedAt: r.receivedAt,
    cancelledAt: r.cancelledAt,
    products: (r.items || []).map(i => ({
      id: i.id,
      productId: i.productId,
      sku: i.product ? i.product.sku : 'SKU-UNKNOWN',
      title: i.product ? i.product.name : 'Product',
      currentStock: i.product ? i.product.currentStock : 0,
      orderQty: i.quantity,
      unitPurchasePrice: Number(i.unitPurchasePrice || 0),
      subtotal: Number(i.subtotal || 0),
      minStock: i.product ? i.product.minimumStock : 0
    }))
  };
}

function mapStatusLabel(raw) {
  switch (raw) {
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'APPROVED':
    case 'SENT':
      return 'Email Sent';
    case 'RECEIVED':
      return 'Received';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return raw;
  }
}

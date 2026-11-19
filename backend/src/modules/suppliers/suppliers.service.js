import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createSupplier(userId, data) {
  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      createdBy: userId,
      isActive: true
    }
  });

  return supplier;
}

export async function getSuppliers(userId) {
  const suppliers = await prisma.supplier.findMany({
    where: {
      createdBy: userId,
      isActive: true
    },
    include: {
      _count: {
        select: {
          products: true,
          restockOrders: {
            where: {
              status: {
                in: ['PENDING_APPROVAL', 'APPROVED', 'SENT']
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return suppliers.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    address: s.address || '',
    productsSupplied: s._count.products,
    activeOrders: s._count.restockOrders,
    isActive: s.isActive,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }));
}

export async function getSupplierById(userId, supplierId) {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      createdBy: userId
    },
    include: {
      products: {
        where: { isActive: true }
      },
      restockOrders: true
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
  }

  return supplier;
}

export async function updateSupplier(userId, supplierId, data) {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      createdBy: userId
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found or access denied', 404, 'SUPPLIER_NOT_FOUND');
  }

  const updatedSupplier = await prisma.supplier.update({
    where: { id: supplierId },
    data
  });

  return updatedSupplier;
}

export async function deleteSupplier(userId, supplierId) {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      createdBy: userId
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found or access denied', 404, 'SUPPLIER_NOT_FOUND');
  }

  // Soft delete supplier to preserve historical restock orders & products
  const deactivated = await prisma.supplier.update({
    where: { id: supplierId },
    data: { isActive: false }
  });

  return deactivated;
}

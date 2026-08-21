import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getCategories(userId) {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { createdBy: null }
      ],
      isActive: true
    },
    include: {
      products: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return categories.map((c, index) => ({
    id: c.id,
    displayId: `CAT-${101 + index}`,
    name: c.name,
    description: c.description || '',
    count: c.products ? c.products.length : 0,
    status: c.isActive ? 'Active' : 'Inactive',
    isActive: c.isActive,
    createdDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Aug 20, 2026',
    createdAt: c.createdAt,
    createdBy: c.createdBy
  }));
}

export async function createCategory(userId, data) {
  const existing = await prisma.category.findFirst({
    where: {
      name: data.name,
      OR: [
        { createdBy: userId },
        { createdBy: null }
      ]
    }
  });

  if (existing) {
    return existing;
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null,
      createdBy: userId,
      isActive: true
    }
  });

  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    createdBy: category.createdBy,
    isActive: category.isActive
  };
}

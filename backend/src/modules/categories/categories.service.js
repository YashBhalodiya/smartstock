import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getCategories(userId) {
  const categories = await prisma.category.findMany({
    where: {
      createdBy: userId,
      isActive: true
    },
    include: {
      products: {
        where: {
          createdBy: userId,
          isActive: true
        }
      }
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
    createdDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Today',
    createdAt: c.createdAt,
    createdBy: c.createdBy
  }));
}

export async function createCategory(userId, data) {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: data.name, mode: 'insensitive' },
      createdBy: userId,
      isActive: true
    }
  });

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      description: existing.description || '',
      createdBy: existing.createdBy,
      isActive: existing.isActive
    };
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

export async function updateCategory(userId, categoryId, data) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      createdBy: userId
    }
  });

  if (!category) {
    throw new AppError('Category not found or access denied', 404, 'CATEGORY_NOT_FOUND');
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description || '',
    status: updated.isActive ? 'Active' : 'Inactive',
    isActive: updated.isActive
  };
}

export async function deleteCategory(userId, categoryId) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      createdBy: userId
    }
  });

  if (!category) {
    throw new AppError('Category not found or access denied', 404, 'CATEGORY_NOT_FOUND');
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false }
  });

  return { success: true, message: 'Category removed' };
}

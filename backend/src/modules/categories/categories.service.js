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
    orderBy: {
      name: 'asc'
    }
  });

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    createdBy: c.createdBy,
    isActive: c.isActive
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

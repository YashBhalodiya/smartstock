import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler.js';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  sku: z.string().trim().min(2, 'SKU is required'),
  barcode: z.string().trim().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(5),
  restockQuantity: z.number().int().min(1, 'Restock quantity must be at least 1').default(50)
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').optional(),
  sku: z.string().trim().min(2, 'SKU is required').optional(),
  barcode: z.string().trim().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  currentStock: z.number().int().min(0).optional(),
  minimumStock: z.number().int().min(0).optional(),
  restockQuantity: z.number().int().min(1).optional(),
  isActive: z.boolean().optional()
});

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issueDetails = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', issueDetails));
      }
      next(error);
    }
  };
}

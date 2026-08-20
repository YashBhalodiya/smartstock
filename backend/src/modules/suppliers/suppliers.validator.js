import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler.js';

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional()
});

export const updateSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name must be at least 2 characters').optional(),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
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

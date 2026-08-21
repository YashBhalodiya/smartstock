import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  code: z.string().trim().length(6, 'Verification code must be exactly 6 digits')
});

export const verify2FASchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  code: z.string().trim().length(6, '2FA code must be exactly 6 digits')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
  phone: z.string().trim().optional().nullable(),
  isTwoFactorEnabled: z.boolean().optional()
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

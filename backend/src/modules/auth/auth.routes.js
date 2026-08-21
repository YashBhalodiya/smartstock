import { Router } from 'express';
import * as authController from './auth.controller.js';
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  verify2FASchema, 
  updateProfileSchema, 
  validateRequest 
} from './auth.validator.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

// Public Auth Endpoints
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/verify-2fa', validateRequest(verify2FASchema), authController.verify2FA);

// Protected Auth Endpoints
router.get('/me', authenticateUser, authController.getMe);
router.patch('/profile', authenticateUser, validateRequest(updateProfileSchema), authController.updateProfile);

export default router;

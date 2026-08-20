import { Router } from 'express';
import * as authController from './auth.controller.js';
import { registerSchema, loginSchema, validateRequest } from './auth.validator.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

// Public auth routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

// Protected route
router.get('/me', authenticateUser, authController.getMe);

export default router;

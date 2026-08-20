import { Router } from 'express';
import * as salesController from './sales.controller.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateUser);

router.post('/', salesController.createSale);
router.get('/', salesController.getSales);

export default router;

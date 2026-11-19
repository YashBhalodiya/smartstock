import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import * as restockController from './restock.controller.js';

const router = Router();

// Public Supplier Delivery Confirmation Webhook (Clicked from supplier email)
router.get('/confirm-delivery/:id', restockController.confirmDeliveryFromEmail);

// Protected routes (Require Shopkeeper authentication)
router.use(authenticateUser);

router.get('/', restockController.getRestockOrders);
router.post('/', restockController.createRestockOrder);
router.post('/:id/approve', restockController.approveRestockOrder);
router.post('/:id/receive', restockController.receiveRestockOrder);
router.post('/:id/cancel', restockController.cancelRestockOrder);

export default router;

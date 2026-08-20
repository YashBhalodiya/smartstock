import { Router } from 'express';
import * as suppliersController from './suppliers.controller.js';
import { createSupplierSchema, updateSupplierSchema, validateRequest } from './suppliers.validator.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all supplier routes
router.use(authenticateUser);

router.post('/', validateRequest(createSupplierSchema), suppliersController.createSupplier);
router.get('/', suppliersController.getSuppliers);
router.get('/:id', suppliersController.getSupplierById);
router.patch('/:id', validateRequest(updateSupplierSchema), suppliersController.updateSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

export default router;

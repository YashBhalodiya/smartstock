import { Router } from 'express';
import * as productsController from './products.controller.js';
import { createProductSchema, updateProductSchema, validateRequest } from './products.validator.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all product endpoints
router.use(authenticateUser);

router.post('/', validateRequest(createProductSchema), productsController.createProduct);
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
router.patch('/:id', validateRequest(updateProductSchema), productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

export default router;

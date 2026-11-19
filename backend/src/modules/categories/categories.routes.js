import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', categoriesController.getCategories);
router.post('/', categoriesController.createCategory);
router.patch('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;

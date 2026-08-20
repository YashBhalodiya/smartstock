import * as categoriesService from './categories.service.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await categoriesService.getCategories(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await categoriesService.createCategory(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    next(err);
  }
}

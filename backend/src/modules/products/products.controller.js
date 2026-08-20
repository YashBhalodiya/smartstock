import * as productsService from './products.service.js';

export async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req, res, next) {
  try {
    const products = await productsService.getProducts(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.user.id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
}

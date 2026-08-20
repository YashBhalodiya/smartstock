import * as suppliersService from './suppliers.service.js';

export async function createSupplier(req, res, next) {
  try {
    const supplier = await suppliersService.createSupplier(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (err) {
    next(err);
  }
}

export async function getSuppliers(req, res, next) {
  try {
    const suppliers = await suppliersService.getSuppliers(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Suppliers retrieved successfully',
      data: suppliers
    });
  } catch (err) {
    next(err);
  }
}

export async function getSupplierById(req, res, next) {
  try {
    const supplier = await suppliersService.getSupplierById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Supplier details retrieved successfully',
      data: supplier
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const supplier = await suppliersService.updateSupplier(req.user.id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    await suppliersService.deleteSupplier(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Supplier deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
}

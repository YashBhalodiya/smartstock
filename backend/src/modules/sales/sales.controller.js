import * as salesService from './sales.service.js';

export async function createSale(req, res, next) {
  try {
    const sale = await salesService.createSale(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Sale transaction completed successfully',
      data: sale
    });
  } catch (err) {
    next(err);
  }
}

export async function getSales(req, res, next) {
  try {
    const sales = await salesService.getSales(req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      message: 'Sales transactions retrieved successfully',
      data: sales
    });
  } catch (err) {
    next(err);
  }
}

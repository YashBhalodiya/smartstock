import * as restockService from './restock.service.js';

export async function getRestockOrders(req, res, next) {
  try {
    const orders = await restockService.getRestockOrders(req.user.id);
    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

export async function createRestockOrder(req, res, next) {
  try {
    const order = await restockService.createRestockOrder(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Restock order created successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
}

export async function approveRestockOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await restockService.approveRestockOrder(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Restock order approved and purchase email dispatched to supplier',
      data: order
    });
  } catch (err) {
    next(err);
  }
}

export async function receiveRestockOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await restockService.receiveRestockOrder(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Restock order marked as received and inventory stock updated',
      data: order
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelRestockOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await restockService.cancelRestockOrder(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Restock order cancelled',
      data: order
    });
  } catch (err) {
    next(err);
  }
}

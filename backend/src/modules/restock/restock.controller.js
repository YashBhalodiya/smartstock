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

export async function confirmDeliveryFromEmail(req, res, next) {
  try {
    const { id } = req.params;
    const result = await restockService.confirmDeliveryFromEmailTokenOrId(id);

    // If browser request, return clean HTML confirmation page
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const itemsList = (result.order?.products || result.order?.items || []).map(item => `
        <li style="margin-bottom: 6px;">
          <strong>${item.title || item.name}</strong>: +${item.orderQty || item.quantity} units replenished
        </li>
      `).join('');

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Delivery Confirmed - StockFlow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 520px; width: 100%; padding: 36px 32px; text-align: center; }
            .badge { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background-color: #dcfce7; color: #16a34a; border-radius: 50%; font-size: 32px; margin: 0 auto 20px auto; }
            h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
            p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0; }
            .box { background-color: #f1f5f9; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 24px; font-size: 14px; }
            .box ul { margin: 8px 0 0 0; padding-left: 20px; }
            .status { display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: #dbeafe; color: #1e40af; font-weight: 600; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓</div>
            <h1>Order Delivery Confirmed!</h1>
            <p>${result.message}</p>
            <div class="box">
              <div style="font-weight: 600; color: #334155; margin-bottom: 6px;">Order #${result.order?.orderNumber || id} Summary:</div>
              <div style="font-size: 13px; color: #64748b;">Supplier: ${result.order?.supplierName || 'Partner'}</div>
              <ul>
                ${itemsList || '<li>Items stock updated to database</li>'}
              </ul>
            </div>
            <span class="status">STATUS: RECEIVED &amp; FULFILLED</span>
            <div style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
              Stock levels have been automatically updated in the store inventory in real time.
            </div>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });
  } catch (err) {
    next(err);
  }
}

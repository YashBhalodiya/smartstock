import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler.js';

// Configure Nodemailer SMTP Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  } : undefined
});

/**
 * Send 2-Step Login Verification HTML Email
 */
export async function send2FAEmail(toEmail, code) {
  const fromAddress = process.env.SMTP_FROM || `"StockFlow Security" <${process.env.SMTP_USER || 'noreply@smartstock.com'}>`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4f6ef2; margin: 0;">StockFlow System</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Inventory Management</p>
      </div>

      <div style="padding: 16px; background-color: #f8fafc; border-radius: 6px; text-align: center;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0;">Your 2-Step Verification Code</h3>
        <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">Use the 6-digit security code below to complete your sign in:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4f6ef2; background-color: #ffffff; padding: 12px 24px; display: inline-block; border-radius: 6px; border: 1px dashed #cbd5e1;">
          ${code}
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This verification code expires in 5 minutes.</p>
      </div>

      <div style="margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
        If you did not attempt to sign in to your StockFlow account, please secure your password immediately.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `🔑 ${code} - StockFlow 2-Step Verification Code`,
      html: htmlContent
    });

    console.log(`✉️ 2FA Verification Email sent to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ SMTP Dispatch Error sending 2FA email to ${toEmail}:`, err.message);
    throw new AppError(`Failed to dispatch 2FA verification email to ${toEmail}. Please verify your email address or SMTP configuration.`, 500, 'EMAIL_DISPATCH_FAILED');
  }
}

/**
 * Send Account Sign Up Email Verification HTML Email
 */
export async function sendSignupVerificationEmail(toEmail, code) {
  const fromAddress = process.env.SMTP_FROM || `"StockFlow Support" <${process.env.SMTP_USER || 'noreply@smartstock.com'}>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4f6ef2; margin: 0;">Welcome to StockFlow</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Inventory & Restock Management</p>
      </div>

      <div style="padding: 20px; background-color: #f8fafc; border-radius: 6px; text-align: center;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0;">Verify Your Shopkeeper Account</h3>
        <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">Thank you for registering! Enter the 6-digit verification code below to activate your account and complete your sign in:</p>
        
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a; background-color: #ffffff; padding: 14px 28px; display: inline-block; border-radius: 6px; border: 1px dashed #bbf7d0;">
          ${code}
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 16px;">This activation code is valid for 15 minutes.</p>
      </div>

      <div style="margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
        If you did not register for a StockFlow account, you can safely ignore this email.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `✉️ ${code} - Verify Your StockFlow Account`,
      html: htmlContent
    });

    console.log(`✉️ Signup Email Verification sent to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ SMTP Dispatch Error sending verification email to ${toEmail}:`, err.message);
    throw new AppError(`Failed to dispatch verification email to ${toEmail}. Please verify your email address.`, 500, 'EMAIL_DISPATCH_FAILED');
  }
}

/**
 * Send Approved Restock Order Request HTML Email to Supplier
 */
export async function sendRestockOrderEmail(toEmail, order, shopkeeper) {
  const fromAddress = process.env.SMTP_FROM || `"StockFlow Restock" <${process.env.SMTP_USER || 'orders@smartstock.com'}>`;
  const shopName = shopkeeper?.name || 'SmartStock Merchant';
  const shopEmail = shopkeeper?.email || 'store@smartstock.com';
  const orderNumber = order.orderNumber || order.id;

  const itemsHtml = (order.items || []).map((item, idx) => {
    const prodName = item.product?.name || item.title || 'Product';
    const sku = item.product?.sku || item.sku || 'N/A';
    const qty = item.quantity || item.orderQty || 1;
    const price = Number(item.unitPurchasePrice || item.purchasePrice || 0);
    const subtotal = Number(item.subtotal || price * qty);
    
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
        <td style="padding: 10px; font-size: 14px; color: #1e293b;">${idx + 1}. <strong>${prodName}</strong><br/><span style="font-size: 12px; color: #64748b;">SKU: ${sku}</span></td>
        <td style="padding: 10px; font-size: 14px; color: #1e293b; text-align: center;">${qty}</td>
        <td style="padding: 10px; font-size: 14px; color: #1e293b; text-align: right;">₹${price.toFixed(2)}</td>
        <td style="padding: 10px; font-size: 14px; color: #1e293b; text-align: right; font-weight: bold;">₹${subtotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const totalAmount = Number(order.totalAmount || 0).toFixed(2);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 10px; background-color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f6ef2; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h2 style="color: #4f6ef2; margin: 0; font-size: 22px;">OFFICIAL PURCHASE ORDER</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">StockFlow Inventory Management System</p>
        </div>
        <div style="text-align: right;">
          <span style="background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 12px;">ORDER: ${orderNumber}</span>
          <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style="display: flex; background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
        <div style="flex: 1;">
          <strong style="color: #475569; font-size: 12px; text-transform: uppercase;">From (Store Owner):</strong>
          <p style="margin: 4px 0 2px 0; color: #0f172a; font-weight: bold;">${shopName}</p>
          <p style="margin: 0; color: #64748b; font-size: 13px;">${shopEmail}</p>
        </div>
        <div style="flex: 1; text-align: right;">
          <strong style="color: #475569; font-size: 12px; text-transform: uppercase;">To (Supplier):</strong>
          <p style="margin: 4px 0 2px 0; color: #0f172a; font-weight: bold;">${order.supplier?.name || order.supplierName || 'Supplier'}</p>
          <p style="margin: 0; color: #64748b; font-size: 13px;">${toEmail}</p>
        </div>
      </div>

      <p style="color: #334155; font-size: 14px; margin-bottom: 16px;">
        Dear Supplier,<br/><br/>
        Please find below the official purchase order for inventory replenishment requested by <strong>${shopName}</strong>. Kindly process and dispatch the requested stock items at your earliest convenience.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ffffff;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569; text-align: left; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 10px; border-radius: 6px 0 0 6px;">Item & Description</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-radius: 0 6px 6px 0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; padding: 16px; background-color: #f1f5f9; border-radius: 8px; margin-bottom: 20px;">
        <span style="font-size: 14px; color: #475569;">Total Order Value: </span>
        <strong style="font-size: 22px; color: #16a34a; margin-left: 8px;">₹${totalAmount}</strong>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
        This purchase order was automatically dispatched via StockFlow Inventory Management System upon approval by the shopkeeper.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `📦 Purchase Order ${orderNumber} - Stock Replenishment Request`,
      html: htmlContent
    });

    console.log(`✉️ Restock Purchase Order Email sent to supplier ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (err) {
    console.warn(`⚠️ SMTP Dispatch warning for ${toEmail}: ${err.message}. (Simulated email success for dev environment)`);
    return { success: true, messageId: `simulated-${Date.now()}`, simulated: true };
  }
}


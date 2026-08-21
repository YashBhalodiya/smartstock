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

import { prisma } from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { send2FAEmail, sendSignupVerificationEmail } from '../../utils/mailer.js';
import { AppError } from '../../middleware/errorHandler.js';

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    isEmailVerified: Boolean(user.isEmailVerified),
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function registerUser({ name, email, password, role = 'SHOPKEEPER' }) {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      isEmailVerified: false,
      emailVerificationCode,
      emailVerificationExpires,
      isActive: true
    }
  });

  // Dispatch Nodemailer signup verification email to user's inbox
  await sendSignupVerificationEmail(user.email, emailVerificationCode);

  return {
    requiresVerification: true,
    email: user.email,
    message: 'Account registered successfully! A 6-digit verification code has been dispatched to your email inbox.'
  };
}

export async function verifyEmailCode({ email, code }) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !user.emailVerificationCode || !user.emailVerificationExpires) {
    throw new AppError('No email verification code requested or session expired', 400, 'INVALID_VERIFICATION_SESSION');
  }

  if (new Date() > user.emailVerificationExpires) {
    throw new AppError('Email verification code has expired. Please sign in to request a new code.', 400, 'VERIFICATION_CODE_EXPIRED');
  }

  if (user.emailVerificationCode !== code.trim()) {
    throw new AppError('Invalid email verification code', 400, 'INVALID_VERIFICATION_CODE');
  }

  // Activate user email verification
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null
    }
  });

  const token = generateToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

  return { user: sanitizeUser(updatedUser), token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.passwordHash) {
    throw new AppError('Invalid account credentials. Please reset your password or sign up.', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if account email verification is incomplete
  if (!user.isEmailVerified) {
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationCode, emailVerificationExpires }
    });

    await sendSignupVerificationEmail(user.email, emailVerificationCode);

    return {
      requiresVerification: true,
      email: user.email,
      message: 'Account email is not verified. A new 6-digit verification code has been dispatched to your email inbox.'
    };
  }

  // 2-Step Verification Email Dispatch Flow
  if (user.isTwoFactorEnabled) {
    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
    const twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode, twoFactorExpires }
    });

    await send2FAEmail(user.email, twoFactorCode);

    return {
      requires2FA: true,
      email: user.email,
      message: '2-Step verification code sent to your email address. Please verify to complete sign in.'
    };
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function verifyTwoFactorCode({ email, code }) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !user.twoFactorCode || !user.twoFactorExpires) {
    throw new AppError('No 2-Step verification code requested or session expired', 400, 'INVALID_2FA_SESSION');
  }

  if (new Date() > user.twoFactorExpires) {
    throw new AppError('2-Step verification code has expired. Please log in again.', 400, '2FA_CODE_EXPIRED');
  }

  if (user.twoFactorCode !== code.trim()) {
    throw new AppError('Invalid 2-Step verification code', 400, 'INVALID_2FA_CODE');
  }

  // Clear 2FA code after successful verification
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorCode: null, twoFactorExpires: null }
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), token };
}

export async function updateUserProfile(userId, updateData) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new AppError('User account not found', 404, 'USER_NOT_FOUND');
  }

  // Check email uniqueness if email is changed
  if (updateData.email && updateData.email.toLowerCase() !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: updateData.email.toLowerCase() }
    });
    if (emailTaken) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
    }
  }

  // Check phone uniqueness if phone is changed
  if (updateData.phone && updateData.phone.trim() !== existingUser.phone) {
    const phoneTaken = await prisma.user.findFirst({
      where: { phone: updateData.phone.trim() }
    });
    if (phoneTaken) {
      throw new AppError('An account with this phone number already exists', 409, 'PHONE_EXISTS');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(updateData.name ? { name: updateData.name.trim() } : {}),
      ...(updateData.email ? { email: updateData.email.toLowerCase() } : {}),
      ...(updateData.phone !== undefined ? { phone: updateData.phone ? updateData.phone.trim() : null } : {}),
      ...(updateData.isTwoFactorEnabled !== undefined ? { isTwoFactorEnabled: Boolean(updateData.isTwoFactorEnabled) } : {})
    }
  });

  return sanitizeUser(updatedUser);
}

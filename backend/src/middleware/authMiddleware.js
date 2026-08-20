import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { AppError } from './errorHandler.js';

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('User account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

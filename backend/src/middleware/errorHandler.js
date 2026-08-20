/**
 * Centralized Error Handling Middleware for Express
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details: err.details || null
    }
  });
}

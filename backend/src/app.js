import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { checkDatabaseConnection } from './config/prisma.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

const app = express();

// CORS Configuration (Allows frontend and API testing tools like Postman)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, cURL, server-to-server)
    if (!origin) return callback(null, true);
    if (config.nodeEnv === 'development' || origin === config.frontendUrl) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    
    return res.status(200).json({
      success: true,
      message: 'Smart Inventory Backend API is operational',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      services: {
        api: 'healthy',
        database: dbConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (err) {
    next(err);
  }
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;

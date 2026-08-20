import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Smart Inventory Backend Server running on http://${HOST}:${PORT} [${config.nodeEnv}]`);
  console.log(`🔗 Health Check Endpoint: http://localhost:${PORT}/api/health`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

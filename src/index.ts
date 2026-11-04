import http from 'http';
import os from 'os';
import app from './app';
import { PORT, NODE_ENV } from './env';
import logger from './logger/winston.logger';
import { dataService } from './services/dataService';

const server = http.createServer(app);

function getNetworkAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

function bootstrap(): void {
  server.listen(PORT, () => {
    const networkAddress = getNetworkAddress();
    const stats = dataService.getStats();

    console.log(`\n===========================================================`);
    console.log(` 📺 Live TV Server running at: http://localhost:${PORT}`);
    if (networkAddress) {
      console.log(` 🌐 Network:                  http://${networkAddress}:${PORT}`);
    }
    console.log(` 📦 Environment:              ${NODE_ENV}`);
    console.log(` 📡 Channels Loaded:          ${stats.totalChannels} channels across ${stats.totalCountries} countries`);
    console.log(`===========================================================\n`);

    logger.info(`Live TV Server started on port ${PORT} [${NODE_ENV}]`);
  });
}

// ─── Process Handling ─────────────────────────────────────────────────────────
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down Live TV server gracefully...`);
  server.close(() => {
    logger.info('Live TV server HTTP connections closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

bootstrap();

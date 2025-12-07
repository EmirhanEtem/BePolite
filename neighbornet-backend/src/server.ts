import { env } from './config/env.js';
import logger from './config/logger.js';
import { createApp } from './app.js';
import { disconnectPrisma } from './database/prisma.js';

async function start() {
  try {
    const app = await createApp();

    // Start server
    await app.listen({ port: env.PORT, host: env.HOST });

    logger.info(
      { port: env.PORT, host: env.HOST },
      `NeighborNet Backend Server running`
    );
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await disconnectPrisma();
  process.exit(0);
});

start();

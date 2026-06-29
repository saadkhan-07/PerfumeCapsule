import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

/**
 * Process entry point: connect to the database, start the HTTP server, and wire
 * up graceful shutdown so connections are released cleanly.
 */
const start = async (): Promise<void> => {
  try {
    await prisma.$connect();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = (signal: string): void => {
      // eslint-disable-next-line no-console
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(() => {
        void prisma.$disconnect().finally(() => process.exit(0));
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void start();

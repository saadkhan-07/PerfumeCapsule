import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error.middleware';

/**
 * Builds and configures the Express application (no network binding here, so it
 * can be imported by tests). Security middleware first, then routes, then the
 * 404 + global error handlers last.
 */
export const createApp = (): Application => {
  const app = express();

  app.disable('x-powered-by');

  // Secure HTTP headers.
  app.use(helmet());

  // CORS. TODO (Phase 4/7): restrict `origin` to the known frontend domain(s)
  // via configuration once the frontend is deployed. Permissive in development.
  app.use(cors({ origin: true, credentials: true }));

  // Body parsing with a small cap to limit abuse.
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Liveness probe.
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'OK',
      data: { status: 'healthy', uptime: process.uptime() },
      errors: null,
    });
  });

  // Feature routes.
  app.use('/api', routes);

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

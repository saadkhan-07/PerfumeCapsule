import { AuthContext } from './auth.types';

/**
 * Augment Express's Request with the authenticated identity set by
 * the verifyToken middleware. Present only on protected routes.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};

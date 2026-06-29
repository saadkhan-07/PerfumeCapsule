/**
 * Auth roles map to the two account tables: `user` → User, `admin` → Admin.
 */
export type AuthRole = 'user' | 'admin';

/** The minimal, trusted identity attached to a request after token verification. */
export interface AuthContext {
  id: string;
  role: AuthRole;
}

/** Shape of the JWT payload we sign and expect back. */
export interface AppJwtPayload {
  sub: string;
  role: AuthRole;
}

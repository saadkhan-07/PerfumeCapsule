import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * Data-access for the User table. The only layer that talks to Prisma for users.
 * Returns full records (including password hash) — callers must sanitize before
 * sending anything to a client.
 */
export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
};

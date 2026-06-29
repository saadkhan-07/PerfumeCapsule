import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * Data-access for the Admin table. Returns full records (including password
 * hash) — callers must sanitize before sending anything to a client.
 */
export const adminRepository = {
  findByEmail: (email: string) => prisma.admin.findUnique({ where: { email } }),

  findById: (id: string) => prisma.admin.findUnique({ where: { id } }),

  create: (data: Prisma.AdminCreateInput) => prisma.admin.create({ data }),
};

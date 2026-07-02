import { prisma } from '../config/prisma';

/**
 * Data-access for PasswordResetToken. Only the SHA-256 hash of a token is ever
 * persisted (the raw token lives solely in the emailed link). The only layer
 * that talks to Prisma for reset tokens.
 */
export const passwordResetTokenRepository = {
  create: (data: { tokenHash: string; userId: string; expiresAt: Date }) =>
    prisma.passwordResetToken.create({ data }),

  findByTokenHash: (tokenHash: string) =>
    prisma.passwordResetToken.findUnique({ where: { tokenHash } }),

  /** Remove a user's unused tokens so only the newest link ever works. */
  deleteUnusedByUserId: (userId: string) =>
    prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } }),

  /**
   * Consume a token and reset the password atomically: hash the new password,
   * mark the token used, and delete the user's other outstanding tokens.
   */
  consumeAndResetPassword: (tokenId: string, userId: string, passwordHash: string) =>
    prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { password: passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId, id: { not: tokenId } },
      }),
    ]),
};

import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';

/**
 * Creates the single admin account.
 *
 *   npm run create:admin -- <email> <password> "<name>"
 *
 * Credentials are passed as CLI args so they never get written to a file.
 * Refuses to run if an admin with the same email already exists.
 */
async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];
  const name = process.argv[4];

  if (!email || !password || !name) {
    console.error('Usage: npm run create:admin -- <email> <password> "<name>"');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.error(`An admin with email "${email}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, password: passwordHash, name },
  });

  console.log('✅ Admin created:', { id: admin.id, email: admin.email, name: admin.name });
}

main()
  .catch((error) => {
    console.error('Failed to create admin:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

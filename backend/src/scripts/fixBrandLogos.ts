import { prisma } from '../config/prisma';
import { buildTransformedUrl } from '../services/upload.service';

/**
 * One-off maintenance: brand logos uploaded before the `fit` transform fix were
 * stored with a square `fill` crop baked into their URL, which chopped the sides
 * off wide wordmarks (e.g. Dior). The original assets are untouched in
 * Cloudinary, so we simply re-derive each logoUrl from its publicId using the
 * correct `logo` (fit) preset and update the row. Safe to re-run (idempotent).
 *
 *   npm run fix:brand-logos
 */
async function main(): Promise<void> {
  const brands = await prisma.brand.findMany({
    where: { logoPublicId: { not: null } },
    select: { id: true, name: true, logoPublicId: true },
  });

  if (brands.length === 0) {
    console.log('No brands with a stored logo — nothing to fix.');
    return;
  }

  for (const brand of brands) {
    const url = buildTransformedUrl(brand.logoPublicId!, 'logo');
    await prisma.brand.update({ where: { id: brand.id }, data: { logoUrl: url } });
    console.log(`✅ ${brand.name} → ${url}`);
  }

  console.log(`\nUpdated ${brands.length} brand logo URL(s).`);
}

main()
  .catch((error) => {
    console.error('Failed to fix brand logos:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

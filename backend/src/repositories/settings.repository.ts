import { Prisma, SiteSettings } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * Data-access for SiteSettings — a SINGLETON row (fixed primary key "singleton").
 * There is no create/delete/list: the row is materialized on first access with
 * schema defaults and only ever read or updated.
 */
const SINGLETON_ID = 'singleton';

// siteName is the only required field without a schema-level default, so it must
// be supplied when the row is first materialized.
const DEFAULT_SITE_NAME = 'Perfume Capsules';

export const settingsRepository = {
  /** Read the singleton (may be null if never accessed). */
  find: (): Promise<SiteSettings | null> =>
    prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } }),

  /** Read the singleton, creating it with defaults on first access. */
  getOrCreate: (): Promise<SiteSettings> =>
    prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID, siteName: DEFAULT_SITE_NAME },
    }),

  /** Update the singleton. Caller must ensure the row exists (via getOrCreate). */
  update: (data: Prisma.SiteSettingsUpdateInput): Promise<SiteSettings> =>
    prisma.siteSettings.update({ where: { id: SINGLETON_ID }, data }),
};

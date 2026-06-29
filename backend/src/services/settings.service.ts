import { Prisma, SiteSettings } from '@prisma/client';
import { settingsRepository } from '../repositories/settings.repository';
import { uploadImage, deleteImage } from './upload.service';
import { UpdateSettingsInput } from '../validators/settings.validator';

/**
 * Business logic for the site settings singleton. Holds the editable, site-wide
 * organization details (identity, contact, social, commerce/shipping config) that
 * the frontend renders dynamically instead of hardcoding.
 *
 * NOTE (per schema): secrets/operational config are intentionally NOT here — the
 * WhatsApp number and payment details live in backend env vars only.
 */
export const settingsService = {
  /** Public read — returns the singleton, materializing it with defaults if needed. */
  get: (): Promise<SiteSettings> => settingsRepository.getOrCreate(),

  /**
   * Admin update. Applies a partial change-set and, when a new logo and/or favicon
   * file is provided, uploads it to Cloudinary and removes the previous asset
   * afterward (no orphans). Image URLs/publicIds are never taken from the body.
   */
  async update(
    input: UpdateSettingsInput,
    files: { logoPath?: string; faviconPath?: string } = {},
  ): Promise<SiteSettings> {
    const existing = await settingsRepository.getOrCreate();

    const data: Prisma.SiteSettingsUpdateInput = { ...input };

    if (files.logoPath) {
      const logo = await uploadImage(files.logoPath, 'site');
      data.logoUrl = logo.url;
      data.logoPublicId = logo.publicId;
    }
    if (files.faviconPath) {
      const favicon = await uploadImage(files.faviconPath, 'site');
      data.faviconUrl = favicon.url;
      data.faviconPublicId = favicon.publicId;
    }

    const updated = await settingsRepository.update(data);

    // Remove old assets only after the replacements are safely stored.
    if (files.logoPath && existing.logoPublicId) {
      await deleteImage(existing.logoPublicId);
    }
    if (files.faviconPath && existing.faviconPublicId) {
      await deleteImage(existing.faviconPublicId);
    }

    return updated;
  },
};

import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

/**
 * The single gateway to Cloudinary. Controllers and routes must never touch the
 * Cloudinary SDK directly — they go through these functions.
 *
 * Free-plan discipline (CLAUDE.md): transformations are applied EAGERLY at upload
 * time (not per request) so the monthly transformation quota is spent once per
 * asset, and delivery uses the returned secure_url with automatic format/quality.
 */

const ROOT_FOLDER = 'perfume-capsules';

export interface UploadResult {
  publicId: string;
  url: string;
}

/**
 * Eager transformation presets, one per image type (CLAUDE.md transformation
 * table). `fill` crops to a square — correct for product imagery, but it would
 * chop the sides off a wide brand wordmark, so logos use `fit` (whole logo,
 * scaled down inside the box, never cropped).
 */
export type TransformPreset = 'product' | 'logo';

const TRANSFORMS: Record<TransformPreset, { width: number; height: number; crop: string }> = {
  product: { width: 800, height: 800, crop: 'fill' },
  logo: { width: 400, height: 400, crop: 'fit' },
};

/**
 * Builds the delivery URL for an already-stored asset using the given preset's
 * transformation. Shared by uploads (so the saved URL matches the eager
 * derivative) and by maintenance scripts that re-derive URLs for existing
 * assets without re-uploading them.
 */
export const buildTransformedUrl = (
  publicId: string,
  preset: TransformPreset = 'product',
): string => {
  const t = TRANSFORMS[preset];
  return cloudinary.url(publicId, {
    ...t,
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
  });
};

/**
 * Uploads a local file to `perfume-capsules/{folder}` with a standard eager
 * transformation chosen by `preset` (WebP/auto format, auto quality). Returns
 * the stored identifiers — persist BOTH publicId and url in the database.
 */
export const uploadImage = async (
  filePath: string,
  folder: string,
  preset: TransformPreset = 'product',
): Promise<UploadResult> => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image storage is not configured');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: `${ROOT_FOLDER}/${folder}`,
    resource_type: 'image',
    eager: [
      {
        ...TRANSFORMS[preset],
        fetch_format: 'auto',
        quality: 'auto',
      },
    ],
  });

  // Prefer the eagerly-transformed derivative's URL when available.
  const url = result.eager?.[0]?.secure_url ?? result.secure_url;

  return { publicId: result.public_id, url };
};

/**
 * Permanently removes an asset from Cloudinary. Called whenever the owning
 * database record is deleted so no orphaned files remain.
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image storage is not configured');
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

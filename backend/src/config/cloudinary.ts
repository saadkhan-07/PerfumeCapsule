import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

/**
 * Configure the Cloudinary v2 SDK once at startup from environment variables.
 * Credentials live only in the backend env (CLAUDE.md security rule). Never
 * import this module from controllers or routes — all image work goes through
 * `services/upload.service.ts`.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** True only when all three credentials are present, so uploads can be guarded. */
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

export default cloudinary;

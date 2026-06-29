import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { settingsService } from '../services/settings.service';
import { removeTempFile } from '../utils/tempFile';

/** Thin controllers: delegate to the service, clean up temp uploads, shape the response. */

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.get();
  sendSuccess(res, 200, 'Settings retrieved', settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  // multer.fields → req.files is keyed by field name, each an array of files.
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const logoPath = files?.logo?.[0]?.path;
  const faviconPath = files?.favicon?.[0]?.path;

  try {
    const settings = await settingsService.update(req.body, { logoPath, faviconPath });
    sendSuccess(res, 200, 'Settings updated', settings);
  } finally {
    await removeTempFile(logoPath);
    await removeTempFile(faviconPath);
  }
});

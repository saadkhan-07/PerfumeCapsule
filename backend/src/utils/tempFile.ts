import fs from 'fs/promises';

/**
 * Best-effort removal of a multer temp upload file. Never throws — a failed
 * cleanup must not turn a successful request into an error.
 */
export const removeTempFile = async (filePath?: string): Promise<void> => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore: the OS will reclaim the temp directory regardless.
  }
};

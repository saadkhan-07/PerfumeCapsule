import os from 'os';
import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Multer configuration for image uploads. Files are written to the OS temp
 * directory and handed to the upload service by path; the controller removes the
 * temp file once Cloudinary has the asset. Memory storage is avoided so large
 * uploads don't sit in the heap.
 *
 * Limits mirror the Cloudinary free plan: max 10 MB per file, images only.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `pc-${unique}-${file.originalname}`);
  },
});

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.unprocessable('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

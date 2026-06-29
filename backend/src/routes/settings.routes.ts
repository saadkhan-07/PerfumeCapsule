import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';

const router = Router();

// Public read — the frontend renders org details (name, logo, announcement,
// currency, shipping config) dynamically from this.
router.get('/', settingsController.getSettings);

// Admin-only update. The image file parts (`logo`, `favicon`) are parsed first so
// multipart text fields populate req.body before validation; then validate; then
// the controller.
router.put(
  '/',
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  validate(updateSettingsSchema),
  settingsController.updateSettings,
);

export default router;

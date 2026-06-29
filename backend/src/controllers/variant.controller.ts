import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { variantService } from '../services/variant.service';

export const listVariants = asyncHandler(async (req, res) => {
  const variants = await variantService.list(req.params.id as string);
  sendSuccess(res, 200, 'Variants retrieved', variants);
});

export const createVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.create(req.params.id as string, req.body);
  sendSuccess(res, 201, 'Variant created', variant);
});

export const updateVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.update(
    req.params.productId as string,
    req.params.variantId as string,
    req.body,
  );
  sendSuccess(res, 200, 'Variant updated', variant);
});

export const deleteVariant = asyncHandler(async (req, res) => {
  await variantService.delete(req.params.productId as string, req.params.variantId as string);
  sendSuccess(res, 200, 'Variant deleted', null);
});

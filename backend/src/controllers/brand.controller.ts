import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { brandService } from '../services/brand.service';
import { removeTempFile } from '../utils/tempFile';

/** Thin controllers: delegate to the service, clean up temp uploads, shape the response. */

export const listBrands = asyncHandler(async (_req, res) => {
  const brands = await brandService.list();
  sendSuccess(res, 200, 'Brands retrieved', brands);
});

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.getById(req.params.id as string);
  sendSuccess(res, 200, 'Brand retrieved', brand);
});

export const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await brandService.create(req.body, req.file?.path);
    sendSuccess(res, 201, 'Brand created', brand);
  } finally {
    await removeTempFile(req.file?.path);
  }
});

export const updateBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await brandService.update(req.params.id as string, req.body, req.file?.path);
    sendSuccess(res, 200, 'Brand updated', brand);
  } finally {
    await removeTempFile(req.file?.path);
  }
});

export const deleteBrand = asyncHandler(async (req, res) => {
  await brandService.delete(req.params.id as string);
  sendSuccess(res, 200, 'Brand deleted', null);
});

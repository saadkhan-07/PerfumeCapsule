import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { productImageService } from '../services/productImage.service';

export const addProductImages = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const images = await productImageService.addImages(
    req.params.id as string,
    files.map((f) => f.path),
  );
  sendSuccess(res, 201, 'Images uploaded', images);
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  await productImageService.deleteImage(
    req.params.productId as string,
    req.params.imageId as string,
  );
  sendSuccess(res, 200, 'Image deleted', null);
});

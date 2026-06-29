import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { productService } from '../services/product.service';
import { listProductsQuery } from '../validators/product.validator';

export const listProducts = asyncHandler(async (req, res) => {
  // Already validated by `validate(listProductsSchema)`; re-parse to get coerced
  // page/limit numbers (Express 5 query is read-only).
  const query = listProductsQuery.parse(req.query);
  const result = await productService.list(query);
  sendSuccess(res, 200, 'Products retrieved', result);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id as string);
  sendSuccess(res, 200, 'Product retrieved', product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  sendSuccess(res, 201, 'Product created', product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id as string, req.body);
  sendSuccess(res, 200, 'Product updated', product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.delete(req.params.id as string);
  sendSuccess(res, 200, 'Product deleted', null);
});

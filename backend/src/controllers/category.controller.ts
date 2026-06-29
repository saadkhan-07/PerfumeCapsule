import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { categoryService } from '../services/category.service';

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.list();
  sendSuccess(res, 200, 'Categories retrieved', categories);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id as string);
  sendSuccess(res, 200, 'Category retrieved', category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  sendSuccess(res, 201, 'Category created', category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id as string, req.body);
  sendSuccess(res, 200, 'Category updated', category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.delete(req.params.id as string);
  sendSuccess(res, 200, 'Category deleted', null);
});

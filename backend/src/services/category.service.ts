import { Category } from '@prisma/client';
import { categoryRepository } from '../repositories/category.repository';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slug';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

/** Business logic for categories. Owns slug generation. */
export const categoryService = {
  list: (): Promise<Category[]> => categoryRepository.findAll(),

  async getById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  },

  create(input: CreateCategoryInput): Promise<Category> {
    return categoryRepository.create({
      name: input.name,
      slug: slugify(input.name),
    });
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.getById(id);
    return categoryRepository.update(id, {
      name: input.name,
      slug: slugify(input.name),
    });
  },

  async delete(id: string): Promise<void> {
    await this.getById(id);
    // ProductCategory links cascade on delete, so this only unlinks — products remain.
    await categoryRepository.delete(id);
  },
};

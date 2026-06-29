/**
 * Generates a URL-safe slug from a display name: lowercased, non-alphanumeric
 * runs collapsed to single hyphens, leading/trailing hyphens trimmed.
 * Used for Brand, Category, and Product slugs (all `@unique` in the schema).
 */
export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

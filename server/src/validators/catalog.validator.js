import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const option = z.object({ name: z.string(), priceDelta: z.number().default(0) });

export const idParamSchema = z.object({ params: z.object({ id: objectId }) });

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    description: z.string().max(500).optional(),
    image: z.string().url().optional(),
    icon: z.string().optional(),
    parent: objectId.nullable().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: objectId }),
  body: createCategorySchema.shape.body.partial(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(4000).optional(),
    category: objectId,
    price: z.number().nonnegative(),
    compareAtPrice: z.number().nonnegative().optional(),
    images: z.array(z.string().url()).optional(),
    thumbnail: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    calories: z.number().nonnegative().optional(),
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    isVegetarian: z.boolean().optional(),
    isVegan: z.boolean().optional(),
    isGlutenFree: z.boolean().optional(),
    spicyLevel: z.number().min(0).max(3).optional(),
    preparationTime: z.number().positive().optional(),
    sizes: z.array(option).optional(),
    extras: z.array(option).optional(),
    addons: z.array(option).optional(),
    stock: z.number().int().nonnegative().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: createProductSchema.shape.body.partial(),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    category: objectId.optional(),
    tag: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    featured: z.enum(["true", "false"]).optional(),
    popular: z.enum(["true", "false"]).optional(),
    vegetarian: z.enum(["true", "false"]).optional(),
  }),
});

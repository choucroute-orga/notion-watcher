import { z } from 'zod';

export const ingredientType = z.enum([
  'vegetable',
  'fruit',
  'meat',
  'fish',
  'dairy',
  'spice',
  'cereals',
  'nuts',
  'sugar',
  'other',
]);

export type IngredientType = z.infer<typeof ingredientType>;

export const ingredientUnit = z.enum(['g', 'kg', 'ml', 'l', 'u', 'tbsp', 'tsp', 'cup', 'mg', 'unit', 'i']);

export type IngredientUnit = z.infer<typeof ingredientUnit>;

export const ingredient = z.object({
  id: z.string().length(24),
  name: z.string().min(1),
  image_url: z.string().url(),
  type: ingredientType,
});

export type Ingredient = z.infer<typeof ingredient>;

export const apiError = z.object({
  message: z.string(),
  code: z.number({}).gte(200).lte(599),
  error: z.string(),
  issued_at: z.string().datetime({ offset: true }),
  errors: z.string().array().optional(),
});

export type ApiError = z.infer<typeof apiError>;

export const ingredientPostRequest = z.object({
  id: z.string(),
  amount: z.number().min(0),
  unit: ingredientUnit,
});

export type IngredientPostRequest = z.infer<typeof ingredientPostRequest>;

const apiDish = z.enum(['starter', 'main', 'dessert']);
export type ApiDish = z.infer<typeof apiDish>;
export const recipePostRequest = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  description: z.string(),
  dish: apiDish,
  servings: z.number().min(1),
  metadata: z.object({ 'cook time': z.string() }),
  timers: z.array(z.object({ name: z.string(), amount: z.number(), unit: z.string() })),
  ingredients: z.array(ingredientPostRequest),
  steps: z.array(z.string()),
});

export type RecipePostRequest = z.infer<typeof recipePostRequest>;

const ingredientGetResponse = z.array(
  z.object({
    id: z.string(),
    amount: z.number(),
    unit: ingredientUnit,
    type: ingredientType,
    name: z.string(),
  }),
);

export const shoppingListGetResponse = z.object({
  ingredients: ingredientGetResponse,
  recipes: z.array(
    z.object({
      id: z.string().length(24),
      name: z.string(),
      ingredients: ingredientGetResponse,
    }),
  ),
});

export type ShoppingListGetResponse = z.infer<typeof shoppingListGetResponse>;

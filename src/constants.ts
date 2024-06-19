import { IngredientTypes } from './models';

export const API_URL = process.env.API_URL || 'http://localhost:3000';

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
export const SHOPPING_LIST_PAGE_ID = 'da7ed00695a64c66a0c77836f181dfb9';
export const RECIPE_DB_ID = '49c22ed91a644251ab2e682d771db25f';
export const INGREDIENT_DB_ID = '8a2856a7f29c47c4a4924828806b1a10';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

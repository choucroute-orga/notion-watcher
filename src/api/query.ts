import { z } from 'zod';
import api from './api';
import { RecipePostRequest, ingredient, recipePostRequest } from './types';

export const getIngredients = async () => {
  const res = await api({
    method: 'GET',
    path: '/ingredient',
    requestSchema: z.void(),
    responseSchema: z.array(ingredient),
  })();
  console.log(res);
  return res;
};

export const postRecipe = async (recipe: RecipePostRequest) => {
  return await api({
    method: 'POST',
    path: '/recipe',
    requestSchema: recipePostRequest,
    responseSchema: recipePostRequest,
  })(recipe);
};

export const getRecipes = async () => {
  return await api({
    method: 'GET',
    path: '/recipe',
    requestSchema: z.void(),
    responseSchema: z.array(recipePostRequest),
  })();
};

export const getRecipe = async (id: string) => {
  return await api({
    method: 'GET',
    path: `/recipe/${id}`,
    requestSchema: z.void(),
    responseSchema: recipePostRequest,
  })();
};

export const putRecipe = async (recipe: RecipePostRequest) => {
  return await api({
    method: 'PUT',
    path: `/recipe/${recipe.id}`,
    requestSchema: recipePostRequest,
    responseSchema: recipePostRequest,
  })(recipe);
};

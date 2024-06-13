import * as notion from 'notion-types';
import { NotionBlock, NotionDish, NotionRecipe, RedisRecipe, notionIngredient } from './types';
import { createRedisClient } from '../redis';
import {
  ApiDish,
  IngredientPostRequest,
  IngredientUnit,
  RecipePostRequest,
  ingredient,
  ingredientUnit,
} from '../api/types';
import { postRecipe } from '../api/query';
import RedisClient, { RedisClientType } from '@redis/client/dist/lib/client';
import { RedisFunctions, RedisModules, RedisScripts } from '@redis/client';
import { Logger } from 'pino';

export const retrieveRecipesIDs = async (notion: any, recipeID: string) => {
  let response = await notion.databases.query({
    database_id: recipeID,
    sorts: [
      {
        property: 'Last edited time',
        direction: 'ascending',
      },
    ],
  });
  response = await notion.pages.retrieve({
    page_id: 'f91140651a9e40a0944a2b77f4a4a6f7',
    // page_size: 100,
  });
  console.log(JSON.stringify(response, null, 2));
  // ids = response.results.map(async(recipe) => recipe.id);
  // notionIngredient.safeParse(response);
  // notionIngredient.parse(response);
  return response;
};

type RecipeResult = {
  properties: {};
};

export const getRecipeResult = () => {};

export const notionDishToApiDish = (dish?: NotionDish): ApiDish => {
  switch (dish?.name ?? '🍲Main') {
    case '🥗Starter':
      return 'starter';
    case '🍲Main':
      return 'main';
    case '🍮Dessert':
      return 'dessert';
    default:
      return 'main';
  }
};

export const transformRecipe = (recipe: NotionRecipe, ingredients?: IngredientPostRequest[]): RedisRecipe => ({
  notionID: recipe.id,
  id: recipe.properties.ID.rich_text.at(0)?.text?.content ?? '',
  author: recipe.properties.Author.rich_text.at(0)?.text?.content ?? '',
  name: recipe.properties.Name.title.at(0)?.text?.content ?? '',
  description: recipe.properties.Description.rich_text.at(0)?.text?.content ?? '',
  created_time: recipe.properties['Created time'].created_time,
  last_edited_time: recipe.properties['Last edited time'].last_edited_time,
  dish: notionDishToApiDish(recipe.properties.Dish.select ?? undefined),
  addToList: recipe.properties.AddToList.checkbox,
  preparation: recipe.properties.Preparation.number ?? 0,
  servings: recipe.properties.Servings.number ?? 0,
  cooking: recipe.properties.Cooking.number ?? 0,
  ingredientsID: recipe.properties['🍅 Ingredients List'].relation.map((ingredient) => ingredient.id),
  ingredients: ingredients ?? [],
});

export const transformRedisToApi = (
  recipe: RedisRecipe,
  steps: string[],
  ingredients: IngredientPostRequest[],
): RecipePostRequest => ({
  author: recipe.author,
  name: recipe.name,
  description: recipe.description,
  // dish: recipe.dish,
  id: recipe.id,
  servings: recipe.servings ?? 0,
  timers: [
    {
      name: 'preparation',
      amount: recipe.preparation ?? 0,
      unit: 'minutes',
    },
    {
      name: 'cooking',
      amount: recipe.cooking ?? 0,
      unit: 'minutes',
    },
  ],
  ingredients,
  dish: recipe.dish,
  metadata: { 'cook time': `${recipe.cooking ?? 0}` },
  steps,
});

// Ingredients are stored in bulleted list
// And are written in the format AmountUnit Ingredient
const retrieveIngredientsFromBlocks = (blocks: NotionBlock[]): string[] => {
  // Find the index of the block Heading3 that contains the word Ingredients
  const ingredientsIndex = blocks.findIndex(
    (block) => block.type === 'heading_3' && block.heading_3.rich_text[0].plain_text === 'Ingredients',
  );
  // Loop through the blocks from the ingredientsIndex once we find a block that is different type as bullet_list, we stop
  const ingredients: string[] = [];
  for (let i = ingredientsIndex + 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== 'bulleted_list_item') {
      break;
    } else if (block.type === 'bulleted_list_item') {
      ingredients.push(block.bulleted_list_item.rich_text[0].plain_text);
    }
  }
  return ingredients;
};

const retrieveStepsFromBlocks = (blocks: NotionBlock[]): string[] => {
  const stepIndex = blocks.findIndex(
    (block) => block.type === 'heading_3' && block.heading_3.rich_text[0].plain_text === 'Steps',
  );
  const steps: string[] = [];
  for (let i = stepIndex + 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== 'numbered_list_item') {
      break;
    } else {
      steps.push(block.numbered_list_item.rich_text[0].plain_text);
    }
  }
  return steps;
};

const retrieveIngredientFromNotion = async (notion: any, notionIngredientId: string) => {
  const response = await notion.pages.retrieve({
    page_id: notionIngredientId,
  });

  return notionIngredient.parse(response);
};

export const buildIngredientArray = async (
  logger: Logger<never>,
  notion: any,
  ingredients: string[],
  ingredientRelation: string[],
) => {
  logger = logger.child({ function: 'buildIngredientArray' });
  const ingRequest: IngredientPostRequest[] = [];

  let iS = ingredientRelation.map(async (i) => {
    const is = await retrieveIngredientFromNotion(notion, i);
    return is;
  });

  const iR = await Promise.all(iS);

  ingredients.forEach((sentence) => {
    // Find the name that correspond in the iR list
    logger = logger.child({ sentence });
    // Extract then name of the ingredient from the block
    // THe block is is the format of "Amount Unit Ingredient" where Amount is a number, unit is one of the units and ingredient is the name of the ingredient
    // We split the string by space and extract the last element
    const regex = /^(\d+(?:[/\/]\d+|\.\d+)?)\s*(?:(mg|g|kg|ml|l|cs|cas|cc|cac)\s)?\s*(?:de|d')?\s*(.+)$/i;
    const match = sentence.toLowerCase().match(regex);
    if (!match) {
      logger.error(`No match found for sentence ${sentence}`);
    }
    const amount = parseInt(match?.[1] ?? '0');
    const unitStr = match?.[2] || 'unit';
    let unit = unitStr as IngredientUnit;
    switch (unitStr) {
      case 'cas' || 'cs':
        unit = 'tbsp';
        break;
      case 'cc' || 'cac':
        unit = 'tsp';
        break;
      default:
        break;
    }
    const ingredient = match?.[3] ?? '';
    logger.child({ amount, unit, ingredient });
    // Remove de and d' from the ingredient name and take thes last letter
    // TODO Improve, might fail with plural names

    // Remove if there is a s at the end of the ingName

    let ingName =
      ingredient
        .split(' ')
        .pop()
        ?.replace(/(\s+de|d')/i, '') ?? ingredient;

    if (ingName[ingName.length - 1] === 's') {
      // Remove the last letter
      ingName = ingName.slice(0, ingName.length - 1);
    }
    // const words = ingName.split(' ');

    // We should neutr
    const ir = iR.find((ing) => ing.properties.Name.title[0].plain_text.toLowerCase().includes(ingName.toLowerCase()));
    if (ir) {
      logger.child({ ingName, ir }).debug('Ingredient found');
      ingRequest.push({
        id: ir.properties.ID.rich_text[0].plain_text,
        amount,
        unit,
      });
    } else {
      logger.child({ ingName }).warn(`Ingredient ${ingName} not found`);
    }
    // For each words we test if we have a match in the iR list.
    // If one ingredient is found, we stop the loop and add the ingredient to the list
    // If no ingredient is found, we continue the loop
    // for (const word of words) {
    //   const ir = iR.find((ing) => ing.properties.Name.title[0].plain_text.toLowerCase().includes(word.toLowerCase()));
    //   if (ir) {
    //     console.log(`Ingredient found with ${word}: ${ir}`);
    //     ingRequest.push({
    //       id: ir.id,
    //       amount,
    //       unit,
    //     });
    //     break;
    //   }
    // }
    // TODO Improve this algorithm to find the ingredient in the list
  });

  return ingRequest;
};

// Each recipe are listed. If the Edited time is the same, then the recipe is the same.
// If the last edited time is different, then the recipe is different. So, we compare both with the backend.

export const watchRecipesInNotion = async (
  logger: Logger<never>,
  notion: any,
  client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>,
) => {
  logger.child({ function: 'watchRecipesInNotion' });
  const recipesDBID = '49c22ed91a644251ab2e682d771db25f';
  const response = (await notion.databases.query({
    database_id: recipesDBID,
  })) as { results: NotionRecipe[] };
  // console.log(JSON.stringify(response, null, 2));
  logger.child({ recipes: response.results.length }).debug('Recipes found in Notion');
  // Transform Notion Recipe to recipes ready to be stored in Redis
  const recipes: RedisRecipe[] = response.results.map((r) => transformRecipe(r));

  await Promise.all(
    recipes.map(async (recipe) => {
      const recipeKey = `recipe:${recipe.id}:${recipe.last_edited_time}`;
      const recipeExists = await client.get(recipeKey);
      if (!recipeExists) {
        logger.child({ recipe: recipe.id }).info("Recipe doesn't exist in Redis, creating it");
        // Remove the old recipe
        await client.del(`recipe:${recipe.id}:*`).catch((err) => {
          logger.error(err);
        });
        // Retrieve the ingredients from the blocks content
        const response = await notion.blocks.children.list({
          block_id: recipe.notionID,
          page_size: 100,
        });
        const ingStr = retrieveIngredientsFromBlocks(response.results);
        const steps = retrieveStepsFromBlocks(response.results);
        const ingredients = await buildIngredientArray(logger, notion, ingStr, recipe.ingredientsID);
        const recipePost = transformRedisToApi(recipe, steps, ingredients);
        // console.log(JSON.stringify(ingredients, null, 2));
        // console.log(JSON.stringify(recipePost, null, 2));
        recipe.ingredients = ingredients;
        await client.set(recipeKey, JSON.stringify(recipe));
        postRecipe(recipePost).then((res) => {
          logger.child({ res }).info('Recipe posted successfully');
        });
      }
      return;
    }),
  );

  return;
};

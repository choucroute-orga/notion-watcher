import * as notion from 'notion-types';
import { NotionBlock, NotionRecipe, RedisRecipe, notionIngredient } from './types';
import { createRedisClient } from '../redis';
import { IngredientPostRequest, IngredientUnit, RecipePostRequest, ingredient, ingredientUnit } from '../api/types';

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

export const transformRecipe = (recipe: NotionRecipe): RedisRecipe => ({
  notionID: recipe.id,
  id: recipe.properties.ID.rich_text.at(0)?.text?.content ?? '',
  author: recipe.properties.Author.rich_text.at(0)?.text?.content ?? '',
  name: recipe.properties.Name.title.at(0)?.text?.content ?? '',
  description: recipe.properties.Description.rich_text.at(0)?.text?.content ?? '',
  created_time: recipe.properties['Created time'].created_time,
  last_edited_time: recipe.properties['Last edited time'].last_edited_time,
  dish: recipe.properties.Dish.select?.name ?? '🍲Main',
  addToList: recipe.properties.AddToList.checkbox,
  preparation: recipe.properties.Preparation.number ?? 0,
  servings: recipe.properties.Servings.number ?? 0,
  cooking: recipe.properties.Cooking.number ?? 0,
  ingredientsID: recipe.properties['🍅 Ingredients List'].relation.map((ingredient) => ingredient.id),
});

export const transformRedisToApi = (recipe: RedisRecipe, steps: string[]): RecipePostRequest => ({
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
  ingredients: [],
  dish: 'main',
  metadata: { 'cook time': `${recipe.cooking ?? 0}` },
  steps,
});

// Ingredients are stored in bulleted list
// And are written in the format AmountUnit Ingredient
const retrieveIngredientsInBlocks = (blocks: NotionBlock[]): string[] => {
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

const retrieveStepsInBlocks = (blocks: NotionBlock[]) => {
  const stepIndex = blocks.findIndex(
    (block) => block.type === 'heading_3' && block.heading_3.rich_text[0].plain_text === 'Steps',
  );
  const stepsBlocks: NotionBlock[] = [];
  for (let i = stepIndex + 1; i < blocks.length; i++) {
    if (blocks[i].type !== 'numbered_list_item') {
      break;
    }
    stepsBlocks.push(blocks[i]);
  }
  return stepsBlocks;
};

const retrieveIngredientFromNotion = async (notion: any, notionIngredientId: string) => {
  const response = await notion.pages.retrieve({
    page_id: notionIngredientId,
  });

  return notionIngredient.parse(response);
};

export const buildIngredientArray = async (
  notion: any,
  ingredients: string[],
  ingredientRelation: { id: string }[],
) => {
  const ingRequest: IngredientPostRequest[] = [];

  let iS = ingredientRelation.map(async (i) => {
    const is = await retrieveIngredientFromNotion(notion, i.id);
    return is;
  });

  const iR = await Promise.all(iS);

  ingredients.forEach((sentence) => {
    // Find the name that correspond in the iR list

    // Extract then name of the ingredient from the block
    // THe block is is the format of "Amount Unit Ingredient" where Amount is a number, unit is one of the units and ingredient is the name of the ingredient
    // We split the string by space and extract the last element
    // const regex =
    // /^(\d+(?:[/\/]\d+|\.\d+)?)\s*(?:(g|kg|ml|l|unité|unit|pièce|pcs|pc|oz|lb|cl|cc|cs|cuillère|cuil|c|à|s|M|G|mL|L|oz|lb|càs|c.à.s|c.s|cs|c.à.c|c.c|cc|pincée|pinçée|goutte|gttes|filet|flets|zeste|zestes|tranche|tranches|rondelle|rondelles|bouquet|brin|brins|feuille|feuilles)\s)?\s*(?:de|d')?\s*(.+)$/i;
    // const match = sentence.toLowerCase().match(regex);
    // const regex =
    //   /^(\d+(?:[/\/]\d+|\.\d+)?)\s*((?:g|kg|l|ml|cs|cc|pcs|pièce))\s*(?:g|kg|ml|l|unité|unit|pièce|pcs|pc|oz|lb|cl|cc|cs|cuillère|cuil|c|à|s|M|G|mL|L|oz|lb|càs|c.à.s|c.s|cs|c.à.c|c.c|cc|pincée|pinçée|goutte|gttes|filet|flets|zeste|zestes|tranche|tranches|rondelle|rondelles|bouquet|brin|brins|feuille|feuilles\s)?\s*(?:de|d')?\s*(.+)$/i;
    const regex = /^(\d+(?:[/\/]\d+|\.\d+)?)\s*(?:(g|kg|ml|l|cs|cas|cc)\s)?\s*(?:de|d')?\s*(.+)$/i;
    const match = sentence.toLowerCase().match(regex);
    if (!match) {
      console.error(`No match found for sentence ${sentence}`);
    }
    const amount = parseInt(match?.[1] ?? '0');
    const unit = (match?.[2] || 'unit') as IngredientUnit;
    const ingredient = match?.[3] ?? '';
    console.log(`Amount: ${amount}, Unit: ${unit}, Ingredient: ${ingredient}`);

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
      console.log(`Ingredient ${ingName} found: ${ir}`);
      ingRequest.push({
        id: ir.properties.ID.rich_text[0].plain_text,
        amount,
        unit,
      });
    } else {
      // Try with the
      console.log(`Ingredient ${ingName} not found`);
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

const watchRecipesInNotion = async (notion: any) => {
  const recipesDBID = '49c22ed91a644251ab2e682d771db25f';
  const response = (await notion.databases.query({
    database_id: recipesDBID,
  })) as { results: NotionRecipe[] };
  console.log(JSON.stringify(response, null, 2));

  const recipes: RedisRecipe[] = response.results.map((r) => transformRecipe(r));
  const client = await createRedisClient();
  recipes.forEach(async (recipe) => {
    const recipeKey = `recipe:${recipe.id}:${recipe.last_edited_time}`;
    const recipeExists = await client.get(recipeKey);
    if (!recipeExists) {
      // Remove the old recipe
      await client.del(`recipe:${recipe.id}:*`);
      // Retrieve the ingredients from the blocks content
      const response = await notion.blocks.children.list({
        block_id: recipe.notionID,
        page_size: 100,
      });
      const ingBlocks = retrieveIngredientsInBlocks(response.results);
      const stepsBlocks = retrieveStepsInBlocks(response.results);
      await client.set(recipeKey, JSON.stringify(recipe));
    }
  });
};

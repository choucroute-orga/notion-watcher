const { Client } = require('@notionhq/client');
import * as notion_types from 'notion-types';
import { IngredientTypes } from './models';
import { getIngredients } from './api/query';
import { retrieveRecipesIDs } from './notion';
import { IngredientDB, RecipeDB, ShoppingListDB, getShoppingListDBProps } from './notion/types';
// import { retrieveRecipes } from './notion';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const createRecipeDB = async (): Promise<string> => {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: process.env.CHOUCROUTE_PAGE_ID,
    },
    icon: {
      type: 'emoji',
      emoji: RecipeDB.emoji,
    },
    title: [
      {
        type: 'text',
        text: {
          content: RecipeDB.title,
          link: null,
        },
      },
    ],
    properties: RecipeDB.properties,
  });

  return response.id;

  console.log(JSON.stringify(response, null, 2));
};

const createShoppingListDB = async (recipesDBID: string, ingredientsDBID: string) => {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: process.env.CHOUCROUTE_PAGE_ID,
    },
    icon: {
      type: 'emoji',
      emoji: ShoppingListDB.emoji,
    },
    title: [
      {
        type: 'text',
        text: {
          content: ShoppingListDB.title,
          link: null,
        },
      },
    ],
    properties: getShoppingListDBProps(ingredientsDBID, recipesDBID),
  });
  console.log(JSON.stringify(response, null, 2));
};

const createIngDB = async (): Promise<string> => {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: process.env.CHOUCROUTE_PAGE_ID,
    },
    icon: {
      type: 'emoji',
      emoji: IngredientDB.emoji,
    },
    // cover: {
    //   type: 'external',
    //   external: {
    //     url: 'https://website.domain/images/image.png',
    //   },
    // },
    title: [
      {
        type: 'text',
        text: {
          content: IngredientDB.title,
          link: null,
        },
      },
    ],
    properties: IngredientDB.properties,
  });
  console.log(response);

  return response.id;
};

const insertIngredients = async (ingDBID: string) => {
  const ingredients = await getIngredients();
  ingredients.map((ing) => {
    notion.pages
      .create({
        parent: {
          database_id: ingDBID,
        },
        icon: {
          type: 'external',
          external: {
            url: ing.image_url,
          },
        },
        cover: {
          type: 'external',
          external: {
            url: ing.image_url,
          },
        },
        properties: {
          Name: {
            title: [
              {
                type: 'text',
                text: {
                  content: ing.name,
                },
              },
            ],
          },
          ID: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: ing.id,
                },
              },
            ],
          },
          Type: {
            select: {
              name: ing.type,
            },
          },
        },
      })
      .then((response: any) => {
        console.log(response);
      });
  });
};

const main = async () => {
  const recipeID = '49c22ed91a644251ab2e682d771db25f';
  const ingID = '8a2856a7f29c47c4a4924828806b1a10';

  const response = await notion.databases.retrieve({
    database_id: recipeID,
  });

  // console.log(JSON.stringify(response, null, 2));

  // Create the relation between the recipe and the ingredients

  // await createShoppingListDB(recipeID, ingID);

  // insertIngredients(ingID);
};

// Create a loop that watch the recipes database and create a shopping list for each recipe

const loop = async () => {
  // watchRecipesInNotion();
  await new Promise((resolve) => setTimeout(resolve, 5000));
  loop();
};

retrieveRecipesIDs(notion, '49c22ed91a644251ab2e682d771db25f');
// loop();

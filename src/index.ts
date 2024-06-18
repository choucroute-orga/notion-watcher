const { Client } = require('@notionhq/client');
import * as notion_types from 'notion-types';
import { IngredientTypes } from './models';
import { getIngredients } from './api/query';
import { retrieveRecipesIDs, watchRecipesInNotion, watchRecipesInRedis } from './notion';
import { IngredientDB, RecipeDB, RedisRecipe, ShoppingListDB, getShoppingListDBProps } from './notion/types';
import { createRedisClient } from './redis';
import * as pino from 'pino';
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

  // const response = await notion.databases.retrieve({
  //   database_id: recipeID,
  // });

  // console.log(JSON.stringify(response, null, 2));

  // Create the relation between the recipe and the ingredients

  // await createShoppingListDB(recipeID, ingID);
  const client = await createRedisClient();
  const logger = pino.default();
  logger.info('Starting the notion watcher loop');
  // await watchRecipesInNotion(logger, notion, client);

  // Search for an ingredient id in notion

  const redisRecipe: RedisRecipe = {
    notionID: 'be867e213c5ad42066da89e5',
    id: '1',
    author: 'John Doe',
    name: 'Tarte aux poireaux',
    servings: 4,
    description: 'Une tarte aux poireaux délicieuse et facile à faire.',
    preparation: 20,
    cooking: 30,
    ingredientsID: [],
    addToList: false,
    created_time: '2024-06-17T13:12:08.533Z',
    last_edited_time: '2024-06-17T13:12:08.533Z',
    dish: 'main',
    ingredients: [
      {
        id: '59ec940ed2dfbb0012bc5399', //Poireau
        amount: 200,
        unit: 'g',
      },
      {
        id: '59822caadfcf6c00119298a3',
        amount: 3, // Oeufs
        unit: 'unit',
      },
      {
        id: '59b82fe88b98250012a9b5aa', // Pate feuilleté
        amount: 1,
        unit: 'unit',
      },
      // {
      //   id: '4',
      //   amount: 1,
      //   unit: 'unit',
      // },
      // {
      //   id: '5',
      //   amount: 2,
      //   unit: 'unit',
      // },
      // {
      //   id: '6',
      //   amount: 250,
      //   unit: 'ml',
      // },
      // {
      //   id: '7',
      //   amount: 400,
      //   unit: 'g',
      // },
    ],
    steps: [
      'Couper les poireaux en rondelles',
      'Faire revenir les poireaux dans une poêle',
      'Ajouter les oeufs',
      'Ajouter la pate feuilleté',
      'Enfourner 30 minutes à 180°C',
    ],
  };
  const recipeJSON = JSON.stringify(redisRecipe);
  await client.set('new_recipe:be867e213c5ad42066da89e5', recipeJSON);
  await watchRecipesInRedis(logger, notion, client, recipeID, ingID);

  client.disconnect();

  // insertIngredients(ingID);
};

// Create a loop that watch the recipes database and create a shopping list for each recipe

// const loop = async () => {
//   // watchRecipesInNotion();
//   await new Promise((resolve) => setTimeout(resolve, 5000));
//   loop();
// };

// retrieveRecipesIDs(notion, '49c22ed91a644251ab2e682d771db25f');
// loop();
main();

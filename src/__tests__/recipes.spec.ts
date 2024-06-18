import { Client } from '@notionhq/client';
import { pino } from 'pino';
import { NotionBlock, RedisRecipe, redisRecipe } from '../notion/types';
import { createRedisClient } from '../redis';
import { watchRecipesInRedis } from '../notion';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

describe('Tests related to recipes', () => {
  test('Should retrieve the recipe from Redis', async () => {
    const logger = pino();
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const client = await createRedisClient();
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
    };
    const recipeJSON = JSON.stringify(redisRecipe);
    await client.set('new_recipe:be867e213c5ad42066da89e5', recipeJSON);
    const recipeID = '49c22ed91a644251ab2e682d771db25f';
    const ingID = '8a2856a7f29c47c4a4924828806b1a10';
    const notionRecipesIds = await watchRecipesInRedis(logger, notion, client, recipeID, ingID);
    const page = await notion.pages.retrieve({ page_id: notionRecipesIds[0] });
    expect(page).toMatchObject({
      object: 'page',
      id: notionRecipesIds[0],
      archived: false,
      properties: {
        Name: {
          title: [
            {
              type: 'text',
              text: {
                content: 'Tarte aux poireaux',
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Une tarte aux poireaux délicieuse et facile à faire.',
              },
            },
          ],
        },
      },
    });

    // Retrieve the blocks of the page
    const { results } = (await notion.blocks.children.list({
      block_id: notionRecipesIds[0],
    })) as unknown as { results: NotionBlock[] };

    // Tests if the blocks are correct
    // Find the bullet list
    const bulletList = results.filter((block) => block.type === 'bulleted_list_item');
    expect(bulletList.length).toEqual(redisRecipe.ingredients.length);

    // Tests if the bullet list is correct
    for (let ind = 0; ind < bulletList.length; ind++) {
      const element = bulletList[ind];
      const i = redisRecipe.ingredients[ind];
      if (element.type === 'bulleted_list_item') {
        expect(element.bulleted_list_item.rich_text[0].plain_text).toContain(
          `${i.amount}${i.unit === 'unit' ? '' : i.unit}`,
        );
      }
    }

    // Delete the page
    await notion.pages.update({
      page_id: notionRecipesIds[0],
      archived: true,
    });
  }, 10000);
});

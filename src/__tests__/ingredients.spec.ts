import { Client } from '@notionhq/client';
import { describe, it } from 'node:test';
import { buildIngredientArray, checkOrCreateIngredientShoppingList } from '../notion';
import { pino } from 'pino';
import { SHOPPING_LIST_PAGE_ID } from '../constants';
import { NotionIngredientShoppingList } from '../notion/types';

describe('Tests related to ingredients', () => {
  test('should parse the ingredient', async () => {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const ingredients = [
      '200g de steack haché',
      '2 feuilles de laurier',
      '1 oignon jaune',
      "1 gousse d'ail",
      '2 carottes',
      '250ml de sauce tomate',
      '400g de spaghettis',
    ];
    const relation = [
      '602b3c67-6e4f-44bf-b28e-5023287b0f26',
      '0f9ebd03-139c-4eb6-874f-1f22b78b40ec',
      '7149d39c-d8bb-4658-baf4-97e913c67ed4',
      '51eaa685-33e9-4669-99ba-2a5307af4c48',
      'df5badb7-6d89-460a-9490-6d695436fd2f',
      '39a1d3b3-aa3a-42a7-874e-6ddc1d700adb',
      '95d48bb9-bb4e-4588-96dd-fc8a7c8ea7c8',
    ];
    const logger = pino();
    const ingRequests = await buildIngredientArray(logger, notion, ingredients, relation);
    expect(ingRequests).toEqual([
      { id: '5a763678baae5e00142c578f', amount: 200, unit: 'g' },
      { id: '620c1a72a024d80dfe318dcb', amount: 2, unit: 'unit' },
      { id: '59aaeb63797a8c001117786f', amount: 1, unit: 'unit' },
      { id: '598b5ebefd078b0011140a17', amount: 1, unit: 'unit' },
      { id: '59921cf6e9f1de001116bbba', amount: 2, unit: 'unit' },
      { id: '634681ea6e8cc8190b10e4bd', amount: 250, unit: 'ml' },
      { id: '5a60f0f6327fe00014912629', amount: 400, unit: 'g' },
    ]);
  });
});

describe('checkOrCreateIngredientShoppingList', () => {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const logger = pino();
  const ingredient = {
    name: 'Pâtes (Linguine)',
    amount: 100,
    unit: 'g',
    id: '770ff6d9f958496db89bd3c12e4fcec9',
    category: 'Other',
  };

  it('should create a new shopping list item', async () => {
    await checkOrCreateIngredientShoppingList(logger, notion, ingredient);

    const database_id = SHOPPING_LIST_PAGE_ID;
    const { results } = (await notion.databases.query({
      database_id,
      filter: {
        property: 'Ingredient',
        relation: {
          contains: ingredient.id,
        },
      },
    })) as unknown as { results: NotionIngredientShoppingList[] };

    // Delete the created page
    await notion.pages.update({ page_id: results[0].id, archived: true });

    logger.info(results);
    expect(results.length).toBe(1);
    const { properties } = results[0];
    expect(properties.Name.title[0].text.content).toBe(ingredient.name);
    expect(properties.Quantity.number).toBe(ingredient.amount);
  });
});

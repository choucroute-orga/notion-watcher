import { Client } from '@notionhq/client';
import { describe, it } from 'node:test';
import { buildIngredientArray } from '../notion';

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
      {
        id: '602b3c67-6e4f-44bf-b28e-5023287b0f26',
      },
      {
        id: '0f9ebd03-139c-4eb6-874f-1f22b78b40ec',
      },
      {
        id: '7149d39c-d8bb-4658-baf4-97e913c67ed4',
      },
      {
        id: '51eaa685-33e9-4669-99ba-2a5307af4c48',
      },
      {
        id: 'df5badb7-6d89-460a-9490-6d695436fd2f',
      },
      {
        id: '39a1d3b3-aa3a-42a7-874e-6ddc1d700adb',
      },
      {
        id: '95d48bb9-bb4e-4588-96dd-fc8a7c8ea7c8',
      },
    ];
    const ingRequests = await buildIngredientArray(notion, ingredients, relation);
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

import { z } from 'zod';
import { IngredientPostRequest, ingredientPostRequest } from '../api/types';

const n = z.object({ name: z.string(), notionId: z.string().length(24) });
const ingredientRedis = z.array(ingredientPostRequest.merge(n));

export type IngredientRedis = z.infer<typeof ingredientRedis>;
// This type is a simplified version of the Recipe in the Notion API. Used to convert the recipe data from the Notion API to the recipe data used in the app.
export const redisRecipe = z.object({
  notionID: z.string(),
  id: z.string(),
  author: z.string(),
  name: z.string(),
  servings: z.number().optional(),
  description: z.string(),
  preparation: z.number().optional(),
  cooking: z.number().optional(),
  ingredients: ingredientPostRequest.array(),
  ingredientsID: z.array(z.string()),
  last_edited_time: z.string().datetime(),
  created_time: z.string().datetime(),
  addToList: z.boolean(),
  dish: z.enum(['starter', 'main', 'dessert']),
  steps: z.array(z.string()).optional(),
});

export type RedisRecipe = z.infer<typeof redisRecipe>;

export const IngredientTypes = [
  {
    name: '🥦Vegetable',
    color: 'green',
  },
  {
    name: '🍎Fruit',
    color: 'green',
  },
  {
    name: '💪Meat',
    color: 'orange',
  },
  {
    name: '🐟Fish',
    color: 'blue',
  },
  {
    name: '🧈Dairy',
    color: 'yellow',
  },
  {
    name: '🌶️Spice',
    color: 'red',
  },
  {
    name: '🥣Cereals',
    color: 'brown',
  },
  {
    name: '🥜Nuts',
    color: 'default',
  },
  {
    name: '🍭Sugar',
    color: 'pink',
  },
  {
    name: 'Other',
    color: 'gray',
  },
];

export const IngredientDB = {
  emoji: '🍅',
  title: 'Ingredients List',
  properties: {
    Name: {
      title: {},
    },
    ID: {
      rich_text: {},
    },
    Type: {
      select: {
        options: IngredientTypes,
      },
    },
  },
};

type recipeDB = {
  properties: {
    Name: {
      title: {};
    };
    Description: {
      rich_text: {};
    };
    'Created time': {
      created_time: string;
    };
    'Last edited time': {
      last_edited_time: string;
    };
  };
};

const notionText = z.object({
  type: z.enum(['text']),
  text: z.object({
    content: z.string(),
  }),
  plain_text: z.string(),
});

const notionRichText = z.object({
  id: z.string().optional(),
  type: z.enum(['rich_text']),
  rich_text: z.array(notionText),
});

const createPropertyObject = (emoji: string, title: string) => {
  return z.object({
    [emoji + ' ' + title]: z.object({
      relation: z.array(
        z.object({
          id: z.string(),
        }),
      ),
    }),
  });
};

const externalPicture = z.object({
  type: z.enum(['external']),
  external: z.object({
    url: z.string(),
  }),
});

export const notionIngredient = z.object({
  id: z.string(),
  icon: externalPicture,
  cover: externalPicture,
  properties: z.object({
    Name: z.object({
      title: z.array(notionText),
    }),
    ID: notionRichText,
    '🍳 Recipes List': z.object({
      relation: z.array(
        z.object({
          id: z.string(),
        }),
      ),
    }),
    Type: z.object({
      select: z.object({
        name: z.enum([
          '🥦Vegetable',
          '🍎Fruit',
          '💪Meat',
          '🐟Fish',
          '🧈Dairy',
          '🌶️Spice',
          '🥣Cereals',
          '🥜Nuts',
          '🍭Sugar',
          'Other',
        ]),
      }),
    }),
  }),
});

export type NotionIngredient = z.infer<typeof notionIngredient>;

export const notionDish = z.object({
  name: z.enum(['🥗Starter', '🍲Main', '🍮Dessert']),
});
export type NotionDish = z.infer<typeof notionDish>;

const notionRecipeProperties = z.object({
  Description: notionRichText,
  'Created time': z.object({
    created_time: z.string(),
  }),
  Dish: z.object({
    select: notionDish.nullable(),
  }),
  Name: z.object({
    title: z.array(notionText),
  }),
  'Last edited time': z.object({
    last_edited_time: z.string(),
  }),
  Cooking: z.object({
    number: z.number().nullable(),
  }),
  '🍅 Ingredients List': z.object({
    relation: z.array(
      z.object({
        id: z.string(),
      }),
    ),
  }),
  AddToList: z.object({
    checkbox: z.boolean(),
  }),
  Preparation: z.object({
    number: z.number().nullable(),
  }),
  ID: notionRichText,
  Servings: z.object({
    number: z.number().nullable(),
  }),
  Author: notionRichText,
});

const recipe = z.object({
  id: z.string(),
  properties: notionRecipeProperties,
});

export type NotionRecipe = z.infer<typeof recipe>;

const notionPostRecipeProperties = notionRecipeProperties.omit({ 'Created time': true, 'Last edited time': true });
const notionPostRecipe = z.object({
  parent: z.object({
    type: z.enum(['database_id']),
    database_id: z.string(),
  }),
  properties: notionPostRecipeProperties,
});
export type NotionPostRecipe = z.infer<typeof notionPostRecipe>;

export const RecipeDB = {
  emoji: '🍳',
  title: 'Recipes List',
  properties: {
    Name: {
      title: {},
    },
    Description: {
      rich_text: {},
    },
    Author: {
      rich_text: {},
    },
    'Created time': {
      created_time: {},
    },
    'Last edited time': {
      last_edited_time: {},
    },
    Dish: {
      select: {
        options: [
          {
            name: '🥗Starter',
            color: 'green',
          },
          {
            name: '🍲Main',
            color: 'orange',
          },
          {
            name: '🍮Dessert',
            color: 'pink',
          },
        ],
      },
    },
    ID: {
      rich_text: {},
    },
    Servings: {
      number: {
        format: 'number',
      },
    },
    Preparation: {
      number: {
        format: 'number',
      },
    },
    Cooking: {
      number: {
        format: 'number',
      },
    },
    AddToList: {
      checkbox: {},
    },
  },
};

export const ShoppingListDB = {
  emoji: '🛒',
  title: 'Shopping List',
};

export const getShoppingListDBProps = (ingredientsDBID: string, recipesDBID: string) => ({
  Name: {
    title: {},
  },
  Ingredient: {
    relation: {
      database_id: ingredientsDBID,
      single_property: {},
    },
  },
  Recipe: {
    relation: {
      database_id: recipesDBID,
      single_property: {},
    },
  },
  Quantity: {
    number: {
      format: 'number',
    },
  },
  'Created time': {
    created_time: {},
  },
  'Last edited time': {
    last_edited_time: {},
  },
  Unit: {
    select: {
      options: [
        {
          name: 'g',
          color: 'gray',
        },
        {
          name: 'kg',
          color: 'gray',
        },
        {
          name: 'unit',
          color: 'gray',
        },
        {
          name: 'tsp',
          color: 'gray',
        },
        {
          name: 'tbsp',
          color: 'gray',
        },
      ],
    },
  },
  Type: {
    select: {
      options: IngredientTypes,
    },
  },
});

export type NotionBlock =
  | {
      type: 'bulleted_list_item';
      bulleted_list_item: z.infer<typeof notionRichText>;
    }
  | {
      type: 'numbered_list_item';
      numbered_list_item: z.infer<typeof notionRichText>;
    }
  | { type: 'heading_3'; heading_3: z.infer<typeof notionRichText> };

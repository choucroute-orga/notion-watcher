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

// Convert the names in the IngredientTypes array to an Enum
export enum IngredientName {
  Vegetable = '🥦Vegetable',
  Fruit = '🍎Fruit',
  Meat = '💪Meat',
  Fish = '🐟Fish',
  Dairy = '🧈Dairy',
  Spice = '🌶️Spice',
  Cereals = '🥣Cereals',
  Nuts = '🥜Nuts',
  Sugar = '🍭Sugar',
  Other = 'Other',
}

type NotionIngredientPage = {
  cover?: {
    type: 'external';
    external: {
      url: string;
    };
  };
  icon?: {
    type: 'external';
    external: {
      url: string;
    };
  };
  parent: {
    type: 'database_id';
    database_id: string;
  };
  Name: {
    title: {};
  };
  ID: {
    rich_text: [
      {
        text: {
          content: string;
        };
      },
    ];
  };
  Type: {
    select: {
      name: IngredientName;
    };
  };
};

type IngredientRequest = {
  cover?: string;
  icon?: string;
  name: string;
  id: string;
  type: IngredientName;
};


// export const createIngredientPage = async (ingredient: IngredientRequest): Promise<string> => {

// }

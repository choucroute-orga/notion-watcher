// Transform the Type of the ingredient to the Notion Category

import { IngredientType } from '../api/types';

export const transformIngredientType = (type: IngredientType) => {
  switch (type) {
    case 'vegetable':
      return '🥦Vegetable';
    case 'fruit':
      return '🍎Fruit';
    case 'meat':
      return '🥩Meat';
    case 'fish':
      return '🐟Fish';
    case 'dairy':
      return '🥛Dairy';
    case 'spice':
      return '🌶️Spice';
    case 'cereals':
      return '🌾Cereals';
    case 'nuts':
      return '🥜Nuts';
    case 'sugar':
      return '🍬Sugar';
    case 'other':
      return 'Other';
  }
};


export const transformToUUID = (id: string):string => {
  // This function add '-' to the string to make it a valid UUID
  return id.slice(0, 8) + '-' + id.slice(8, 12) + '-' + id.slice(12, 16) + '-' + id.slice(16, 20) + '-' + id.slice(20);
}
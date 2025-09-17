export const ANIMAL_TYPES = [
  'cow',
  'bull', 
  'ox',
  'calf',
  'goat',
  'sheep',
  'poultry'
] as const;

export type AnimalType = typeof ANIMAL_TYPES[number];

// Animal type icons mapping
export const ANIMAL_TYPE_ICONS: Record<AnimalType, string> = {
  cow: '🐄',
  bull: '🐂',
  ox: '🐂',
  calf: '🐄',
  goat: '🐐',
  sheep: '🐑',
  poultry: '🐔'
};
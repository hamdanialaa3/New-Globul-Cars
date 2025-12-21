// Utility functions for car data
import type { CarMake } from './types';

export const searchMakes = (makes: CarMake[], query: string): CarMake[] => {
  const lowerQuery = query.toLowerCase();
  return makes.filter(make => make.name.toLowerCase().includes(lowerQuery));
};

export const searchModels = (make: CarMake, query: string) => {
  const lowerQuery = query.toLowerCase();
  return make.models.filter(model => model.name.toLowerCase().includes(lowerQuery));
};

export const getMakeById = (makes: CarMake[], makeId: string): CarMake | undefined => {
  return makes.find(m => m.id === makeId);
};

export const getModelById = (make: CarMake, modelId: string) => {
  return make.models.find(m => m.id === modelId);
};

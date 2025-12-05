import { CarMake } from './types';

export const getAllMakes = (brands: CarMake[]): { id: string; name: string }[] => {
  return brands.map(make => ({
    id: make.id,
    name: make.name
  }));
};

export const getModelsByMake = (brands: CarMake[], makeId: string): { id: string; name: string }[] => {
  const make = brands.find(m => m.id === makeId);
  if (!make) return [];
  return make.models.map(model => ({
    id: model.id,
    name: model.name
  }));
};

export const getGenerationsByModel = (
  brands: CarMake[], 
  makeId: string, 
  modelId: string
): { id: string; name: string; years: string }[] => {
  const make = brands.find(m => m.id === makeId);
  if (!make) return [];
  const model = make.models.find(m => m.id === modelId);
  if (!model) return [];
  return model.generations.map(gen => ({
    id: gen.id,
    name: gen.name,
    years: gen.years
  }));
};


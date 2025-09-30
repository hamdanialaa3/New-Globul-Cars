// src/constants/carData.ts
// (Comment removed - was in Arabic)

// (Comment removed - was in Arabic)
import { CAR_DATA as STATIC_CAR_DATA } from './carData_static';

export interface CarMake {
  id: string;
  name: string;
  models: CarModel[];
}

export interface CarModel {
  id: string;
  name: string;
  generations: CarGeneration[];
}

export interface CarGeneration {
  id: string;
  name: string;
  years: string;
  bodyStyles: CarBodyStyle[];
}

export interface CarBodyStyle {
  id: string;
  name: string;
}

// (Comment removed - was in Arabic)
export const CAR_DATA: CarMake[] = STATIC_CAR_DATA;

// (Comment removed - was in Arabic)
export const mergeCarData = (newData: CarMake[]): CarMake[] => {
  const merged = [...CAR_DATA];

  newData.forEach(newMake => {
    const existingMake = merged.find(m => m.id === newMake.id);
    if (existingMake) {
      // (Comment removed - was in Arabic)
      newMake.models.forEach(newModel => {
        const existingModel = existingMake.models.find(m => m.id === newModel.id);
        if (existingModel) {
          // (Comment removed - was in Arabic)
          newModel.generations.forEach(newGen => {
            const existingGen = existingModel.generations.find(g => g.id === newGen.id);
            if (!existingGen) {
              existingModel.generations.push(newGen);
            }
          });
        } else {
          existingMake.models.push(newModel);
        }
      });
    } else {
      merged.push(newMake);
    }
  });

  return merged;
};

// (Comment removed - was in Arabic)
export const getAllMakes = (): { value: string; text: string }[] => {
  return CAR_DATA.map(make => ({
    value: make.id,
    text: make.name
  }));
};

// (Comment removed - was in Arabic)
export const getModelsForMake = (makeId: string): { value: string; text: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  return make.models.map(model => ({
    value: model.id,
    text: model.name
  }));
};

// (Comment removed - was in Arabic)
export const getGenerationsForModel = (makeId: string, modelId: string): { value: string; text: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  const model = make.models.find(m => m.id === modelId);
  if (!model) return [];
  return model.generations.map(gen => ({
    value: gen.id,
    text: `${gen.name} (${gen.years})`
  }));
};

// (Comment removed - was in Arabic)
export const getBodyStylesForGeneration = (makeId: string, modelId: string, generationId: string): { value: string; text: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  const model = make.models.find(m => m.id === modelId);
  if (!model) return [];
  const generation = model.generations.find(g => g.id === generationId);
  if (!generation) return [];
  return generation.bodyStyles.map(style => ({
    value: style.id,
    text: style.name
  }));
};
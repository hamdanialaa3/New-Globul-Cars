import fs from 'fs';

const data = JSON.parse(fs.readFileSync('comprehensive_car_data.json', 'utf8'));

const tsContent = `// src/constants/carData_static.ts
// بيانات السيارات الشاملة - ملف ثابت

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

// بيانات السيارات الشاملة
export const CAR_DATA: CarMake[] = ${JSON.stringify(data, null, 2)};

// دوال مساعدة للبحث في البيانات
export const getAllMakes = (): { id: string; name: string }[] => {
  return CAR_DATA.map(make => ({
    id: make.id,
    name: make.name
  }));
};

export const getModelsByMake = (makeId: string): { id: string; name: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  return make.models.map(model => ({
    id: model.id,
    name: model.name
  }));
};

export const getGenerationsByModel = (makeId: string, modelId: string): { id: string; name: string; years: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  const model = make.models.find(m => m.id === modelId);
  if (!model) return [];
  return model.generations.map(gen => ({
    id: gen.id,
    name: gen.name,
    years: gen.years
  }));
};

export const getBodyStylesByGeneration = (makeId: string, modelId: string, generationId: string): { id: string; name: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  const model = make.models.find(m => m.id === modelId);
  if (!model) return [];
  const generation = model.generations.find(g => g.id === generationId);
  if (!generation) return [];
  return generation.bodyStyles;
};
`;

fs.writeFileSync('bulgarian-car-marketplace/src/constants/carData_static_new.ts', tsContent);
console.log('تم إنشاء ملف carData_static_new.ts');
// src/constants/carData.ts
// بيانات السيارات المستخرجة من netcarshow.com

// استيراد البيانات من الملف الثابت
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

// بيانات السيارات المستخرجة من netcarshow.com
export const CAR_DATA: CarMake[] = STATIC_CAR_DATA;

// دالة لدمج بيانات السيارات الجديدة مع القديمة
export const mergeCarData = (newData: CarMake[]): CarMake[] => {
  const merged = [...CAR_DATA];

  newData.forEach(newMake => {
    const existingMake = merged.find(m => m.id === newMake.id);
    if (existingMake) {
      // دمج الموديلات
      newMake.models.forEach(newModel => {
        const existingModel = existingMake.models.find(m => m.id === newModel.id);
        if (existingModel) {
          // دمج الأجيال
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

// دالة للحصول على جميع الشركات المصنعة
export const getAllMakes = (): { value: string; text: string }[] => {
  return CAR_DATA.map(make => ({
    value: make.id,
    text: make.name
  }));
};

// دالة للحصول على الموديلات لشركة معينة
export const getModelsForMake = (makeId: string): { value: string; text: string }[] => {
  const make = CAR_DATA.find(m => m.id === makeId);
  if (!make) return [];
  return make.models.map(model => ({
    value: model.id,
    text: model.name
  }));
};

// دالة للحصول على الأجيال لموديل معين
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

// دالة للحصول على أنواع الهيكل لجيل معين
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
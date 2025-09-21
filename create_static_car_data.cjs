const fs = require('fs');
const path = require('path');

// قراءة جميع الملفات المقسمة ودمجها في ملف واحد
const carDataDir = 'c:/Users/hamda/Desktop/New Globul Cars/car_data_split';
const outputFile = 'c:/Users/hamda/Desktop/New Globul Cars/bulgarian-car-marketplace/src/constants/carData_static.ts';

let allData = [];

// قراءة جميع ملفات البيانات
const files = fs.readdirSync(carDataDir).filter(f => f.startsWith('car_data_part_'));

for (const file of files) {
  const filePath = path.join(carDataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  allData.push(...data);
}

console.log(`تم دمج ${allData.length} شركة`);

// إنشاء ملف TypeScript بالبيانات المدمجة
const tsContent = `// src/constants/carData_static.ts
// بيانات السيارات المستخرجة من netcarshow.com - ملف ثابت

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
export const CAR_DATA: CarMake[] = ${JSON.stringify(allData, null, 2)};

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
    text: \`\${gen.name} (\${gen.years})\`
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
`;

fs.writeFileSync(outputFile, tsContent);
console.log('تم إنشاء ملف carData_static.ts');
// src/utils/dataImporter.ts
// (Comment removed - was in Arabic)

export interface ExtractedData {
  makes: Array<{
    id: string;
    name: string;
    models: Array<{
      id: string;
      name: string;
      generations: Array<{
        id: string;
        name: string;
        years: string;
        bodyStyles: Array<{
          id: string;
          name: string;
        }>;
      }>;
    }>;
  }>;
  extractedAt: string;
  source: string;
}

export class DataImporter {
  static validateExtractedData(data: any): data is ExtractedData {
    // (Comment removed - was in Arabic)
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.makes)) return false;
    if (!data.extractedAt || !data.source) return false;

    // (Comment removed - was in Arabic)
    for (const make of data.makes) {
      if (!make.id || !make.name || !Array.isArray(make.models)) return false;

      // (Comment removed - was in Arabic)
      for (const model of make.models) {
        if (!model.id || !model.name || !Array.isArray(model.generations)) return false;

        // (Comment removed - was in Arabic)
        for (const generation of model.generations) {
          if (!generation.id || !generation.name || !generation.years || !Array.isArray(generation.bodyStyles)) return false;

          // (Comment removed - was in Arabic)
          for (const bodyStyle of generation.bodyStyles) {
            if (!bodyStyle.id || !bodyStyle.name) return false;
          }
        }
      }
    }

    return true;
  }

  static convertToCarDataFormat(extractedData: ExtractedData) {
    // (Comment removed - was in Arabic)
    return extractedData.makes.map(make => ({
      id: make.id,
      name: make.name,
      models: make.models.map(model => ({
        id: model.id,
        name: model.name,
        generations: model.generations.map(generation => ({
          id: generation.id,
          name: generation.name,
          years: generation.years,
          bodyStyles: generation.bodyStyles
        }))
      }))
    }));
  }

  static generateTypeScriptCode(extractedData: ExtractedData): string {
    // (Comment removed - was in Arabic)
    const carData = this.convertToCarDataFormat(extractedData);

    const code = `// البيانات المستخرجة من netcarshow.com في ${extractedData.extractedAt}
// المصدر: ${extractedData.source}

export const EXTRACTED_CAR_DATA = ${JSON.stringify(carData, null, 2)};

// (Comment removed - was in Arabic)
export const DATA_STATS = {
  makes: ${carData.length},
  models: ${carData.reduce((sum, make) => sum + make.models.length, 0)},
  generations: ${carData.reduce((sum, make) => sum + make.models.reduce((sum, model) => sum + model.generations.length, 0), 0)},
  bodyStyles: ${carData.reduce((sum, make) => sum + make.models.reduce((sum, model) => sum + model.generations.reduce((sum, gen) => sum + gen.bodyStyles.length, 0), 0), 0)}
};

console.log('تم تحميل بيانات السيارات:', DATA_STATS);
`;

    return code;
  }

  static mergeData(existingData: any[], newData: ExtractedData): any[] {
    // (Comment removed - was in Arabic)
    const merged = [...existingData];
    const newCarData = this.convertToCarDataFormat(newData);

    newCarData.forEach((newMake: any) => {
      const existingMakeIndex = merged.findIndex((m: any) => m.id === newMake.id);

      if (existingMakeIndex >= 0) {
        // (Comment removed - was in Arabic)
        const existingMake = merged[existingMakeIndex];
        newMake.models.forEach((newModel: any) => {
          const existingModelIndex = existingMake.models.findIndex((m: any) => m.id === newModel.id);

          if (existingModelIndex >= 0) {
            // (Comment removed - was in Arabic)
            const existingModel = existingMake.models[existingModelIndex];
            newModel.generations.forEach((newGen: any) => {
              const existingGenIndex = existingModel.generations.findIndex((g: any) => g.id === newGen.id);

              if (existingGenIndex >= 0) {
                // (Comment removed - was in Arabic)
                const existingGen = existingModel.generations[existingGenIndex];
                newGen.bodyStyles.forEach((newBody: any) => {
                  if (!existingGen.bodyStyles.find((b: any) => b.id === newBody.id)) {
                    existingGen.bodyStyles.push(newBody);
                  }
                });
              } else {
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
  }
}

// (Comment removed - was in Arabic)
/*
// (Comment removed - was in Arabic)
const extractedData = JSON.parse('PASTE_EXTRACTED_DATA_HERE');
// (Comment removed - was in Arabic)
if (DataImporter.validateExtractedData(extractedData)) {
  // (Comment removed - was in Arabic)
  const carData = DataImporter.convertToCarDataFormat(extractedData);
  // (Comment removed - was in Arabic)
  const tsCode = DataImporter.generateTypeScriptCode(extractedData);
  console.log('الكود الجاهز للاستيراد:', tsCode);
} else {
  console.error('البيانات غير صالحة');
}
*/
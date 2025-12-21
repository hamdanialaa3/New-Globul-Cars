// Test script for car brands service
const structuredBrandsData = require('./src/data/car-brands-structured.json');

console.log('Testing structured brands data...');

// Test Toyota data
const toyotaData = structuredBrandsData['Toyota'];
console.log('Toyota data exists:', !!toyotaData);
console.log('Toyota classes:', toyotaData?.classes?.length || 0);
console.log('Toyota has models:', !!toyotaData?.models);

if (toyotaData?.models) {
  console.log('Toyota models keys:', Object.keys(toyotaData.models));
  console.log('Corolla models:', toyotaData.models['كورولا']);
}

// Test functions
const getClassesForBrand = (brand) => {
  const brandData = structuredBrandsData[brand];
  if (brandData && brandData.classes) {
    return brandData.classes;
  }
  return [];
};

const getModelsForBrandAndClass = (brand, className) => {
  const brandData = structuredBrandsData[brand];
  if (brandData && brandData.models && brandData.models[className]) {
    return brandData.models[className];
  }
  return [];
};

const getAllModelsForBrand = (brand) => {
  const brandData = structuredBrandsData[brand];
  if (brandData && brandData.models) {
    const allModels = [];
    Object.values(brandData.models).forEach(models => {
      allModels.push(...models);
    });
    return [...new Set(allModels)];
  }
  return [];
};

console.log('Classes for Toyota:', getClassesForBrand('Toyota'));
console.log('Models for Toyota Corolla:', getModelsForBrandAndClass('Toyota', 'كورولا'));
console.log('All models for Toyota count:', getAllModelsForBrand('Toyota').length);
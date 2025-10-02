// GMC Models and Variants - Complete Analysis
// موديلات وفئات GMC - تحليل كامل
// Analyzed from GMC.txt - 242 lines analyzed

export const GMC_MODELS_VARIANTS: Record<string, string[]> = {
  // Yukon Series - Full-size SUV
  'Yukon': [
    'Yukon',
    'Yukon AT4',
    'Yukon Denali',
    'Yukon XL'
  ],

  // Sierra Series - Full-size Pickup Truck
  'Sierra': [
    'Sierra',
    'Sierra HD',
    'Sierra EV',
    'Sierra Denali',
    'Sierra 2500HD',
    'Sierra Denali 2500HD',
    'Sierra All Terrain X',
    'Sierra 2500HD All Terrain X',
    'Sierra 2500HD All Mountain Concept'
  ],

  // Terrain Series - Compact SUV
  'Terrain': [
    'Terrain',
    'Terrain AT4',
    'Terrain Denali'
  ],

  // Acadia Series - Mid-size SUV
  'Acadia': [
    'Acadia',
    'Acadia Denali'
  ],

  // Hummer Series - Electric SUV/Truck
  'Hummer': [
    'Hummer EV',
    'Hummer EV SUV'
  ],

  // Canyon Series - Mid-size Pickup Truck
  'Canyon': [
    'Canyon',
    'Canyon AT4',
    'Canyon Denali',
    'Canyon AT4 OVRLANDX Concept'
  ],

  // Savana Series - Full-size Van
  'Savana': [
    'Savana',
    'Savana Passenger'
  ]
};

// Base models for dropdown
export const GMC_BASE_MODELS = Object.keys(GMC_MODELS_VARIANTS).sort();

// Total variants count
export const GMC_VARIANTS_COUNT = Object.values(GMC_MODELS_VARIANTS)
  .reduce((sum, variants) => sum + variants.length, 0);

export default GMC_MODELS_VARIANTS;


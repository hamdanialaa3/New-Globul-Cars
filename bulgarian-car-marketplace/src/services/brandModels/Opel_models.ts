// Opel Models and Variants - Complete Analysis
// موديلات وفئات Opel - تحليل كامل
// Analyzed from Opel.txt - 588 lines analyzed

export const OPEL_MODELS_VARIANTS: Record<string, string[]> = {
  // Astra Series - Compact Car
  'Astra': [
    'Astra',
    'Astra Electric',
    'Astra GSe',
    'Astra Sports Tourer',
    'Astra OPC',
    'Astra GTC'
  ],

  // Corsa Series - Supermini/City Car
  'Corsa': [
    'Corsa',
    'Corsa GSE',
    'Corsa GSE VGT Concept',
    'Corsa OPC'
  ],

  // Mokka Series - Compact Crossover SUV
  'Mokka': [
    'Mokka',
    'Mokka GSE',
    'Mokka-e'
  ],

  // Grandland Series - Compact SUV
  'Grandland': [
    'Grandland',
    'Grandland X'
  ],

  // Crossland Series - Subcompact Crossover SUV
  'Crossland': [
    'Crossland',
    'Crossland X'
  ],

  // Zafira Series - Compact MPV
  'Zafira': [
    'Zafira',
    'Zafira Tourer',
    'Zafira Tourer Concept',
    'Zafira OPC'
  ],

  // Insignia Series - Large Family Car
  'Insignia': [
    'Insignia',
    'Insignia OPC',
    'Insignia Sports Tourer'
  ],

  // Meriva Series - Mini MPV
  'Meriva': [
    'Meriva',
    'Meriva Concept'
  ],

  // Frontera Series - SUV
  'Frontera': [
    'Frontera'
  ],

  // Rocks-e Series - Electric Microcar
  'Rocks-e': [
    'Rocks-e'
  ],

  // Combo Series - Light Commercial Vehicle/Leisure Activity Vehicle
  'Combo': [
    'Combo',
    'Combo Life'
  ],

  // Vivaro Series - Light Commercial Van
  'Vivaro': [
    'Vivaro'
  ],

  // Ampera Series - Electric Car
  'Ampera': [
    'Ampera',
    'Ampera-e'
  ],

  // Adam Series - City Car
  'Adam': [
    'Adam',
    'Adam S'
  ],

  // Karl Series - City Car
  'Karl': [
    'Karl',
    'Karl Rocks'
  ],

  // Cascada Series - Convertible
  'Cascada': [
    'Cascada'
  ],

  // GT Series - Sports Car
  'GT': [
    'GT',
    'GT Concept'
  ],

  // Monza Series - Concept
  'Monza': [
    'Monza Concept'
  ],

  // Experimental Series - Concept
  'Experimental': [
    'Experimental Concept'
  ]
};

// Base models for dropdown
export const OPEL_BASE_MODELS = Object.keys(OPEL_MODELS_VARIANTS).sort();

// Total variants count
export const OPEL_VARIANTS_COUNT = Object.values(OPEL_MODELS_VARIANTS)
  .reduce((sum, variants) => sum + variants.length, 0);

export default OPEL_MODELS_VARIANTS;


// Chevrolet Models and Variants - Complete Analysis
// موديلات وفئات Chevrolet - تحليل كامل
// Analyzed from Chevrolet.txt

export const CHEVROLET_MODELS_VARIANTS: Record<string, string[]> = {
  // Corvette Series - Iconic Sports Car
  'Corvette': [
    'Corvette',
    'Corvette C8 Stingray',
    'Corvette C8 Stingray Convertible',
    'Corvette ZR1',
    'Corvette ZR1 Convertible',
    'Corvette ZR1X',
    'Corvette Z06',
    'Corvette Z06 Convertible',
    'Corvette E-Ray',
    'Corvette E-Ray Convertible',
    'Corvette UK Concept',
    'Corvette SoCal Concept',
    'Corvette CX.R VGT Concept',
    'Corvette CX Concept'
  ],

  // Silverado Series - Full-size Pickup
  'Silverado': [
    'Silverado',
    'Silverado HD',
    'Silverado EV'
  ],

  // Colorado Series - Mid-size Pickup
  'Colorado': [
    'Colorado',
    'Colorado ZR2',
    'Colorado ZH2 Concept'
  ],

  // Camaro Series - Muscle Car/Pony Car
  'Camaro': [
    'Camaro',
    'Camaro Convertible',
    'Camaro ZL1',
    'Camaro ZL1 Convertible',
    'Camaro ZL1 1LE',
    'Camaro eCOPO Concept',
    'Camaro Turbo AutoX Concept'
  ],

  // Tahoe Series - Full-size SUV
  'Tahoe': [
    'Tahoe',
    'Tahoe PPV'
  ],

  // Suburban Series - Full-size SUV (Extended)
  'Suburban': [
    'Suburban'
  ],

  // Traverse Series - Mid-size Crossover SUV
  'Traverse': [
    'Traverse'
  ],

  // Blazer Series - Mid-size SUV
  'Blazer': [
    'Blazer',
    'Blazer EV',
    'Blazer EV.R NASCAR Concept',
    'K5 Blazer-E Concept'
  ],

  // Equinox Series - Compact SUV
  'Equinox': [
    'Equinox',
    'Equinox EV'
  ],

  // Trailblazer Series - Compact SUV
  'Trailblazer': [
    'Trailblazer'
  ],

  // Trax Series - Subcompact SUV
  'Trax': [
    'Trax'
  ],

  // Malibu Series - Mid-size Sedan
  'Malibu': [
    'Malibu'
  ],

  // Cruze Series - Compact Car
  'Cruze': [
    'Cruze',
    'Cruze Hatchback'
  ],

  // Sonic Series - Subcompact Car
  'Sonic': [
    'Sonic',
    'Sonic Sedan'
  ],

  // Spark Series - City Car/Microcar
  'Spark': [
    'Spark',
    'Spark Activ'
  ],

  // Bolt Series - Electric Car
  'Bolt': [
    'Bolt EV',
    'Bolt EUV'
  ],

  // Volt Series - Plug-in Hybrid
  'Volt': [
    'Volt'
  ],

  // Concept Cars
  'Beast': [
    'Beast Concept'
  ],

  'E-10': [
    'E-10 Concept'
  ],

  'FNR-X': [
    'FNR-X Concept'
  ],

  'Chevelle': [
    'Chevelle Slammer Concept'
  ]
};

// Base models for dropdown
export const CHEVROLET_BASE_MODELS = Object.keys(CHEVROLET_MODELS_VARIANTS).sort();

// Total variants count
export const CHEVROLET_VARIANTS_COUNT = Object.values(CHEVROLET_MODELS_VARIANTS)
  .reduce((sum, variants) => sum + variants.length, 0);

export default CHEVROLET_MODELS_VARIANTS;


// Ford Models and Variants - Complete Analysis
// موديلات وفئات Ford - تحليل كامل
// Analyzed from Ford.txt - 1124 lines analyzed
// Part 1: Major Models (under 300 lines limit)

export const FORD_MODELS_VARIANTS: Record<string, string[]> = {
  // F-Series - Best Selling Pickup Truck Line
  'F-150': [
    'F-150',
    'F-150 Lobo',
    'F-150 Raptor',
    'F-150 Raptor R',
    'F-150 Lightning',
    'F-150 Lightning Switchgear Concept',
    'F-150 Lightning SuperTruck Concept'
  ],

  'F-Series Super Duty': [
    'F-Series Super Duty',
    'F-Series Super Duty Tremor Off-Road Package'
  ],

  'F-100': [
    'F-100 Eluminator Concept'
  ],

  // Mustang Series - Iconic Sports Car
  'Mustang': [
    'Mustang',
    'Mustang GT',
    'Mustang GTD',
    'Mustang Dark Horse',
    'Mustang GT Convertible',
    'Mustang Shelby GT500',
    'Mustang Shelby GT350',
    'Mustang Mach 1',
    'Mustang Cobra Jet 1400 Concept',
    'Mustang Lithium Concept'
  ],

  'Mustang Mach-E': [
    'Mustang Mach-E',
    'Mustang Mach-E GT',
    'Mustang Mach-E Rally',
    'Mustang Mach-E 1400 Concept'
  ],

  // Bronco Series - Off-Road SUV
  'Bronco': [
    'Bronco 2-door',
    'Bronco 4-door',
    'Bronco Raptor',
    'Bronco Sport',
    'Bronco Riptide Concept',
    'Bronco Badlands Sasquatch 2-Door Concept',
    'Bronco R Concept'
  ],

  // Ranger Series - Mid-size Pickup
  'Ranger': [
    'Ranger',
    'Ranger [US]',
    'Ranger Super Duty [AU]',
    'Ranger Raptor',
    'Ranger Wildtrak'
  ],

  // Explorer Series - Mid-size SUV
  'Explorer': [
    'Explorer',
    'Explorer ST',
    'Explorer Sport'
  ],

  // Expedition Series - Full-size SUV
  'Expedition': [
    'Expedition'
  ],

  // Maverick Series - Compact Pickup
  'Maverick': [
    'Maverick',
    'Maverick Lobo'
  ],

  // Escape Series - Compact SUV
  'Escape': [
    'Escape'
  ],

  // Edge Series - Mid-size Crossover
  'Edge': [
    'Edge [EU]',
    'Edge ST'
  ],

  // Everest Series - Mid-size SUV (Asia/Pacific)
  'Everest': [
    'Everest'
  ],

  // Kuga Series - Compact SUV (Europe)
  'Kuga': [
    'Kuga'
  ],

  // Territory Series - Compact SUV (China)
  'Territory': [
    'Territory [CN]'
  ],

  // EcoSport Series - Subcompact SUV
  'EcoSport': [
    'EcoSport',
    'EcoSport [US]'
  ],

  // Puma Series - Compact Crossover
  'Puma': [
    'Puma',
    'Puma ST'
  ],

  // Focus Series - Compact Car
  'Focus': [
    'Focus',
    'Focus ST',
    'Focus ST-Line',
    'Focus ST Wagon',
    'Focus Active',
    'Focus Active Wagon',
    'Focus Sedan',
    'Focus Wagon',
    'Focus Wagon Vignale',
    'Focus Vignale'
  ],

  // Fiesta Series - Supermini
  'Fiesta': [
    'Fiesta',
    'Fiesta ST',
    'Fiesta ST200',
    'Fiesta Active'
  ],

  // Fusion Series - Mid-size Sedan
  'Fusion': [
    'Fusion',
    'Fusion V6 Sport'
  ],

  // Mondeo Series - Large Family Car
  'Mondeo': [
    'Mondeo Wagon Hybrid'
  ],

  // S-MAX Series - MPV
  'S-MAX': [
    'S-MAX'
  ],

  // Galaxy Series - Large MPV
  'Galaxy': [
    'Galaxy'
  ],

  // Ka Series - City Car
  'Ka': [
    'Ka plus',
    'Ka plus Active'
  ],

  // Transit Series - Commercial Van
  'Transit Connect': [
    'Transit Connect Wagon'
  ],

  // GT Series - Supercar
  'GT': [
    'GT'
  ],

  // Capri Series - Sports Car
  'Capri': [
    'Capri'
  ],

  // Concept Cars
  'RS2.00': [
    'RS2.00 Concept'
  ]
};

// Base models for dropdown
export const FORD_BASE_MODELS = Object.keys(FORD_MODELS_VARIANTS).sort();

// Total variants count
export const FORD_VARIANTS_COUNT = Object.values(FORD_MODELS_VARIANTS)
  .reduce((sum, variants) => sum + variants.length, 0);

export default FORD_MODELS_VARIANTS;


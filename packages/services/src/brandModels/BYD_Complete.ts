// BYD - Complete Models and Variants
// بي واي دي - موديلات وفئات كاملة
// Chinese Electric Vehicle Leader - Popular in Bulgaria

export const BYD_EU_MODELS: Record<string, string[]> = {
  // ========================================
  // Sedan Series - فئة السيدان
  // ========================================
  'Han': [
    'Han EV',
    'Han EV Long Range',
    'Han DM-i', // Plug-in Hybrid
    'Han DM-p' // Performance Plug-in Hybrid
  ],

  'Qin Plus': [
    'Qin Plus EV',
    'Qin Plus DM-i', // PHEV
    'Qin Plus Champion Edition'
  ],

  'Seal': [
    'Seal EV',
    'Seal Long Range',
    'Seal Performance AWD',
    'Seal U' // Crossover sedan variant
  ],

  // ========================================
  // Hatchback / Compact - هاتشباك/مدمجة
  // ========================================
  'Dolphin': [
    'Dolphin Active',
    'Dolphin Boost',
    'Dolphin Design',
    'Dolphin Comfort'
  ],

  'Atto 2': [
    'Atto 2 Electric'
  ],

  // ========================================
  // Crossover / SUV - كروس أوفر
  // ========================================
  'Atto 3': [
    'Atto 3 Standard Range',
    'Atto 3 Extended Range',
    'Atto 3 Comfort',
    'Atto 3 Design'
  ],

  'Song Plus': [
    'Song Plus EV',
    'Song Plus DM-i', // PHEV
    'Song Plus Champion Edition'
  ],

  'Tang': [
    'Tang EV',
    'Tang EV AWD',
    'Tang DM-i', // PHEV
    'Tang DM-p' // Performance PHEV
  ],

  'Yuan Plus': [
    'Yuan Plus EV'
  ],

  'Sea Lion 7': [
    'Sea Lion 7 Comfort',
    'Sea Lion 7 Design',
    'Sea Lion 7 Excellence',
    'Sea Lion 7 Performance',
    'Sea Lion 7 Long Range'
  ],

  // ========================================
  // MPV / Van - فان
  // ========================================
  'D9': [
    'Denza D9 EV',
    'Denza D9 DM-i' // PHEV Luxury MPV
  ],

  'e6': [
    'e6 Electric MPV' // Taxi/Commercial use
  ],

  // ========================================
  // Luxury / Premium - فاخرة
  // ========================================
  'Yangwang U8': [
    'Yangwang U8 Electric SUV',
    'Yangwang U8 Offroad Edition'
  ],

  'Yangwang U9': [
    'Yangwang U9 Electric Supercar'
  ],

  // ========================================
  // Commercial - تجارية
  // ========================================
  'T3': [
    'T3 Electric Van'
  ],

  'E-Bus': [
    'E-Bus K9',
    'E-Bus K7'
  ]
};

// Base models
export const BYD_BASE_MODELS = Object.keys(BYD_EU_MODELS).sort();

// Variants count
export const BYD_VARIANTS_COUNT = Object.values(BYD_EU_MODELS)
  .reduce((sum, variants) => sum + variants.length, 0);

export default BYD_EU_MODELS;


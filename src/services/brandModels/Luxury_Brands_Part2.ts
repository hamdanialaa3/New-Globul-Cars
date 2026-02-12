// Luxury Brands Part 2 - Alfa Romeo, Mini, Aston Martin, Bentley, Rolls-Royce
// الماركات الفاخرة - الجزء 2

// ============================================
// ALFA ROMEO - Complete European Range
// ============================================
const ALFA_ROMEO_EU_MODELS: Record<string, string[]> = {
  'MiTo': [
    'MiTo 0.9 TwinAir',
    'MiTo 1.4 TB',
    'MiTo 1.3 JTDm',
    'MiTo Quadrifoglio Verde'
  ],

  'Giulietta': [
    'Giulietta 1.4 TB',
    'Giulietta 1.6 JTDm',
    'Giulietta 2.0 JTDm',
    'Giulietta Veloce',
    'Giulietta Quadrifoglio Verde'
  ],

  'Giulia': [
    'Giulia 2.0 Turbo',
    'Giulia 2.0 Turbo AWD',
    'Giulia 2.2 JTD',
    'Giulia 2.2 JTD AWD',
    'Giulia Veloce 2.0 Turbo AWD',
    'Giulia Quadrifoglio 2.9 V6 Bi-Turbo'
  ],

  'Stelvio': [
    'Stelvio 2.0 Turbo',
    'Stelvio 2.0 Turbo AWD',
    'Stelvio 2.2 JTD AWD',
    'Stelvio Veloce 2.0 Turbo AWD',
    'Stelvio Quadrifoglio 2.9 V6 Bi-Turbo AWD'
  ],

  'Tonale': [
    'Tonale 1.5 Hybrid',
    'Tonale 1.5 Hybrid Q4 AWD',
    'Tonale Plug-in Hybrid Q4 AWD',
    'Tonale Veloce PHEV'
  ],

  'Junior': [
    'Junior Electric',
    'Junior Hybrid',
    'Junior Veloce Electric'
  ]
};

// ============================================
// MINI - Complete European Range
// ============================================
const MINI_EU_MODELS: Record<string, string[]> = {
  'Cooper': [
    'Cooper Classic',
    'Cooper S',
    'Cooper SE (Electric)',
    'John Cooper Works (JCW)'
  ],

  'Cooper 3-door': [
    'Cooper 3-door',
    'Cooper S 3-door',
    'Cooper SE 3-door',
    'John Cooper Works 3-door'
  ],

  'Cooper 5-door': [
    'Cooper 5-door',
    'Cooper S 5-door',
    'Cooper SE 5-door',
    'John Cooper Works 5-door'
  ],

  'Clubman': [
    'Clubman Cooper',
    'Clubman Cooper S',
    'Clubman Cooper S ALL4',
    'Clubman John Cooper Works ALL4'
  ],

  'Countryman': [
    'Countryman Cooper',
    'Countryman Cooper S',
    'Countryman Cooper S ALL4',
    'Countryman Cooper SE ALL4', // PHEV
    'Countryman John Cooper Works ALL4'
  ],

  'Convertible': [
    'Convertible Cooper',
    'Convertible Cooper S',
    'Convertible John Cooper Works'
  ],

  'Electric': [
    'Cooper SE Electric',
    'Aceman Electric',
    'Countryman Electric'
  ]
};

// ============================================
// ASTON MARTIN - Complete Range
// ============================================
const ASTON_MARTIN_MODELS: Record<string, string[]> = {
  'Vantage': [
    'Vantage V8',
    'Vantage F1 Edition',
    'Vantage Roadster'
  ],

  'DB11': [
    'DB11 V8',
    'DB11 V12',
    'DB11 Volante'
  ],

  'DB12': [
    'DB12 V8',
    'DB12 Volante'
  ],

  'DBS': [
    'DBS Superleggera',
    'DBS Volante',
    'DBS 770 Ultimate'
  ],

  'DBX': [
    'DBX',
    'DBX707',
    'DBX707 AMR24 Edition'
  ],

  'Valkyrie': [
    'Valkyrie',
    'Valkyrie Spider'
  ]
};

// ============================================
// BENTLEY - Complete Range
// ============================================
const BENTLEY_MODELS: Record<string, string[]> = {
  'Continental GT': [
    'Continental GT V8',
    'Continental GT W12',
    'Continental GT Speed',
    'Continental GT Azure',
    'Continental GT S',
    // Convertible
    'Continental GT V8 Convertible',
    'Continental GT Speed Convertible'
  ],

  'Flying Spur': [
    'Flying Spur V8',
    'Flying Spur W12',
    'Flying Spur Speed',
    'Flying Spur Azure',
    'Flying Spur Hybrid'
  ],

  'Bentayga': [
    'Bentayga V8',
    'Bentayga S',
    'Bentayga Speed',
    'Bentayga Hybrid',
    'Bentayga EWB', // Extended wheelbase
    'Bentayga Azure'
  ],

  'Batur': [
    'Batur Coupe'
  ]
};

// ============================================
// ROLLS-ROYCE - Complete Range
// ============================================
const ROLLS_ROYCE_MODELS: Record<string, string[]> = {
  'Ghost': [
    'Ghost',
    'Ghost Extended',
    'Ghost Black Badge'
  ],

  'Phantom': [
    'Phantom',
    'Phantom Extended',
    'Phantom Series II'
  ],

  'Cullinan': [
    'Cullinan',
    'Cullinan Black Badge'
  ],

  'Wraith': [
    'Wraith',
    'Wraith Black Badge'
  ],

  'Dawn': [
    'Dawn',
    'Dawn Black Badge'
  ],

  'Spectre': [
    'Spectre Electric'
  ]
};

// ============================================
// LANCIA - European Range
// ============================================
export const LANCIA_MODELS: Record<string, string[]> = {
  'Ypsilon': [
    'Ypsilon Hybrid',
    'Ypsilon Electric'
  ],

  'Delta': [
    'Delta HF',
    'Delta Integrale' // Classic/Collector
  ]
};

// ============================================
// DS AUTOMOBILES - French Premium Brand
// ============================================
export const DS_MODELS: Record<string, string[]> = {
  'DS 3': [
    'DS 3 PureTech 100',
    'DS 3 PureTech 130',
    'DS 3 E-TENSE' // Electric
  ],

  'DS 4': [
    'DS 4 PureTech 130',
    'DS 4 PureTech 180',
    'DS 4 PureTech 225',
    'DS 4 BlueHDi 130',
    'DS 4 E-TENSE 225' // PHEV
  ],

  'DS 7': [
    'DS 7 PureTech 180',
    'DS 7 PureTech 225',
    'DS 7 BlueHDi 130',
    'DS 7 BlueHDi 180',
    'DS 7 E-TENSE 225', // PHEV
    'DS 7 E-TENSE 300' // PHEV
  ],

  'DS 9': [
    'DS 9 PureTech 225',
    'DS 9 BlueHDi 180',
    'DS 9 E-TENSE 225', // PHEV
    'DS 9 E-TENSE 250' // PHEV
  ]
};

// ============================================
// CUPRA - Performance Brand (SEAT)
// ============================================
export const CUPRA_MODELS: Record<string, string[]> = {
  'Formentor': [
    'Formentor 1.5 TSI',
    'Formentor 2.0 TSI',
    'Formentor 2.0 TSI 4Drive',
    'Formentor 1.4 e-HYBRID',
    'Formentor VZ 2.0 TSI 4Drive',
    'Formentor VZ5 2.5 TFSI 4Drive' // 5-cylinder
  ],

  'Leon': [
    'Leon 1.5 TSI',
    'Leon 2.0 TSI',
    'Leon 1.4 e-HYBRID',
    'Leon VZ 2.0 TSI',
    // Sportstourer
    'Leon Sportstourer VZ 2.0 TSI'
  ],

  'Ateca': [
    'Ateca 1.5 TSI',
    'Ateca 2.0 TSI 4Drive',
    'Ateca VZ 2.0 TSI 4Drive'
  ],

  'Tavascan': [
    'Tavascan VZ Electric'
  ],

  'Born': [
    'Born 45kWh',
    'Born 58kWh',
    'Born 77kWh',
    'Born VZ 77kWh'
  ]
};

// Export individual models for import
export {
  ALFA_ROMEO_EU_MODELS,
  MINI_EU_MODELS,
  ASTON_MARTIN_MODELS,
  BENTLEY_MODELS,
  ROLLS_ROYCE_MODELS
};

const LuxuryBrandsPart2 = {
  'Alfa Romeo': ALFA_ROMEO_EU_MODELS,
  'Mini': MINI_EU_MODELS,
  'Aston Martin': ASTON_MARTIN_MODELS,
  'Bentley': BENTLEY_MODELS,
  'Rolls-Royce': ROLLS_ROYCE_MODELS,
  'Lancia': LANCIA_MODELS,
  'DS': DS_MODELS,
  'Cupra': CUPRA_MODELS
};

export default LuxuryBrandsPart2;


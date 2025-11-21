// Japanese Luxury & Remaining Brands
// الماركات اليابانية الفاخرة والمتبقية
// Lexus, Infiniti, Suzuki, Isuzu, Genesis

// ============================================
// LEXUS - Complete European Range  
// ============================================
export const LEXUS_EU_MODELS: Record<string, string[]> = {
  'CT': [
    'CT 200h' // Hybrid
  ],

  'IS': [
    'IS 300',
    'IS 300h', // Hybrid
    'IS 350',
    'IS 500 F Sport Performance'
  ],

  'ES': [
    'ES 250',
    'ES 300h' // Hybrid
  ],

  'LS': [
    'LS 500',
    'LS 500h', // Hybrid
    'LS 500h AWD'
  ],

  'UX': [
    'UX 200',
    'UX 250h', // Hybrid
    'UX 300e' // Electric
  ],

  'NX': [
    'NX 250',
    'NX 350',
    'NX 350h', // Hybrid
    'NX 450h+', // PHEV
    'NX 350 F Sport'
  ],

  'RX': [
    'RX 350',
    'RX 450h', // Hybrid
    'RX 450h+', // PHEV
    'RX 500h F Sport Performance'
  ],

  'RZ': [
    'RZ 450e Electric AWD'
  ],

  'LX': [
    'LX 600'
  ],

  'RC': [
    'RC 300',
    'RC 300h',
    'RC 350',
    'RC F'
  ],

  'LC': [
    'LC 500',
    'LC 500h',
    'LC 500 Convertible'
  ]
};

// ============================================
// INFINITI - Complete European Range
// ============================================
const INFINITI_MODELS: Record<string, string[]> = {
  'Q30': [
    'Q30 1.5d',
    'Q30 2.0t',
    'Q30 2.2d'
  ],

  'Q50': [
    'Q50 2.0t',
    'Q50 Hybrid',
    'Q50 Red Sport 400',
    'Q50 S'
  ],

  'Q60': [
    'Q60 2.0t',
    'Q60 3.0t',
    'Q60 Red Sport 400'
  ],

  'Q70': [
    'Q70 2.0t',
    'Q70 3.0t',
    'Q70 Hybrid'
  ],

  'QX30': [
    'QX30 1.5d',
    'QX30 2.0t',
    'QX30 2.2d'
  ],

  'QX50': [
    'QX50 2.0t VC-Turbo'
  ],

  'QX55': [
    'QX55 2.0t VC-Turbo'
  ],

  'QX60': [
    'QX60 3.5 V6'
  ],

  'QX70': [
    'QX70 3.0d',
    'QX70 3.7',
    'QX70 5.0 V8'
  ],

  'QX80': [
    'QX80 5.6 V8'
  ]
};

// ============================================
// SUZUKI - Complete European Range
// ============================================
const SUZUKI_EU_MODELS: Record<string, string[]> = {
  'Ignis': [
    'Ignis 1.2 Dualjet',
    'Ignis 1.2 Hybrid'
  ],

  'Swift': [
    'Swift 1.2 Dualjet',
    'Swift 1.2 Hybrid',
    'Swift 1.4 Boosterjet',
    'Swift Sport 1.4 Boosterjet'
  ],

  'Baleno': [
    'Baleno 1.2 Dualjet',
    'Baleno 1.2 Hybrid'
  ],

  'Vitara': [
    'Vitara 1.4 Boosterjet',
    'Vitara 1.4 Boosterjet ALLGRIP',
    'Vitara 1.4 Hybrid',
    'Vitara 1.6 VVT'
  ],

  'S-Cross': [
    'S-Cross 1.4 Boosterjet',
    'S-Cross 1.4 Boosterjet ALLGRIP',
    'S-Cross 1.4 Hybrid ALLGRIP'
  ],

  'Across': [
    'Across 2.5 Plug-in Hybrid AWD' // Based on Toyota RAV4
  ],

  'Swace': [
    'Swace 1.8 Hybrid' // Based on Toyota Corolla
  ],

  'Jimny': [
    'Jimny 1.5 VVT',
    'Jimny 1.5 VVT ALLGRIP'
  ]
};

// ============================================
// GENESIS - Korean Luxury Brand
// ============================================
const GENESIS_MODELS: Record<string, string[]> = {
  'G70': [
    'G70 2.0T',
    'G70 2.2D',
    'G70 3.3T Sport'
  ],

  'G80': [
    'G80 2.5T',
    'G80 3.5T AWD',
    'G80 Sport'
  ],

  'G90': [
    'G90 3.5T',
    'G90 5.0 Ultimate'
  ],

  'GV60': [
    'GV60 RWD',
    'GV60 AWD',
    'GV60 Sport AWD',
    'GV60 Sport Plus AWD'
  ],

  'GV70': [
    'GV70 2.5T',
    'GV70 2.2D AWD',
    'GV70 3.5T Sport AWD',
    'GV70 Electrified'
  ],

  'GV80': [
    'GV80 2.5T',
    'GV80 3.0D AWD',
    'GV80 3.5T AWD'
  ]
};

// ============================================
// ISUZU - Commercial/SUV Specialist
// ============================================
const ISUZU_MODELS: Record<string, string[]> = {
  'D-Max': [
    'D-Max 1.9 4x2',
    'D-Max 1.9 4x4',
    'D-Max 3.0 4x4',
    'D-Max V-Cross',
    'D-Max X-Rider'
  ],

  'MU-X': [
    'MU-X 1.9 RZ4E 4x2',
    'MU-X 3.0 4x4'
  ]
};

// Export individual models
export {
  INFINITI_MODELS,
  SUZUKI_EU_MODELS,
  GENESIS_MODELS,
  ISUZU_MODELS
};

const JapaneseLuxuryComplete = {
  Lexus: LEXUS_EU_MODELS,
  Infiniti: INFINITI_MODELS,
  Suzuki: SUZUKI_EU_MODELS,
  Genesis: GENESIS_MODELS,
  Isuzu: ISUZU_MODELS
};

export default JapaneseLuxuryComplete;


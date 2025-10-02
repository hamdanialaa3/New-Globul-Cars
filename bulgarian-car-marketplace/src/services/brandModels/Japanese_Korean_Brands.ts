// Japanese & Korean Brands - Complete European Market
// الماركات اليابانية والكورية - السوق الأوروبي الكامل
// Popular in Bulgaria - Toyota, Honda, Nissan, Mazda, Hyundai, Kia

// ============================================
// TOYOTA - Complete European Range
// ============================================
const TOYOTA_EU_MODELS: Record<string, string[]> = {
  'Aygo X': [
    'Aygo X 1.0 VVT-i'
  ],

  'Yaris': [
    'Yaris 1.0 VVT-i',
    'Yaris 1.5 Hybrid',
    'Yaris GR Sport Hybrid',
    'GR Yaris' // Performance
  ],

  'Yaris Cross': [
    'Yaris Cross 1.5 Hybrid',
    'Yaris Cross 1.5 Hybrid AWD-i'
  ],

  'Corolla': [
    'Corolla 1.8 Hybrid',
    'Corolla 2.0 Hybrid',
    'Corolla GR Sport 2.0 Hybrid',
    // Touring Sports (Estate)
    'Corolla Touring Sports 1.8 Hybrid',
    'Corolla Touring Sports 2.0 Hybrid',
    // Sedan
    'Corolla Sedan 1.8 Hybrid',
    'Corolla Sedan 2.0 Hybrid'
  ],

  'Camry': [
    'Camry 2.5 Hybrid'
  ],

  'Prius': [
    'Prius 1.8 Hybrid',
    'Prius Plug-in Hybrid'
  ],

  'C-HR': [
    'C-HR 1.8 Hybrid',
    'C-HR 2.0 Hybrid',
    'C-HR GR Sport 2.0 Hybrid'
  ],

  'RAV4': [
    'RAV4 2.0 Hybrid',
    'RAV4 2.5 Hybrid AWD',
    'RAV4 Plug-in Hybrid AWD',
    'RAV4 Adventure 2.5 Hybrid',
    'RAV4 GR Sport 2.5 Hybrid'
  ],

  'Highlander': [
    'Highlander 2.5 Hybrid AWD'
  ],

  'Land Cruiser': [
    'Land Cruiser 2.8 D-4D',
    'Land Cruiser 3.3 D-4D',
    'Land Cruiser 250' // New generation
  ],

  'Hilux': [
    'Hilux 2.4 D-4D',
    'Hilux 2.8 D-4D',
    'Hilux 2.8 D-4D 4WD',
    'Hilux GR Sport'
  ],

  'Proace': [
    'Proace 2.0 D',
    'Proace City',
    'Proace Verso'
  ],

  'bZ4X': [
    'bZ4X Electric FWD',
    'bZ4X Electric AWD'
  ]
};

// ============================================
// HONDA - Complete European Range
// ============================================
const HONDA_EU_MODELS: Record<string, string[]> = {
  'Jazz': [
    'Jazz 1.5 i-MMD Hybrid',
    'Jazz Crosstar 1.5 Hybrid'
  ],

  'Civic': [
    'Civic 1.5 VTEC Turbo',
    'Civic 2.0 i-MMD Hybrid',
    'Civic 2.0 VTEC Turbo Type R',
    // Sedan
    'Civic Sedan 1.5 VTEC Turbo',
    'Civic Sedan 2.0 Hybrid'
  ],

  'HR-V': [
    'HR-V 1.5 i-MMD Hybrid',
    'HR-V e:HEV'
  ],

  'CR-V': [
    'CR-V 1.5 VTEC Turbo',
    'CR-V 2.0 i-MMD Hybrid',
    'CR-V 2.0 Hybrid AWD'
  ],

  'ZR-V': [
    'ZR-V 2.0 i-MMD Hybrid',
    'ZR-V e:HEV'
  ],

  'e:Ny1': [
    'e:Ny1 Electric'
  ]
};

// ============================================
// NISSAN - Complete European Range
// ============================================
const NISSAN_EU_MODELS: Record<string, string[]> = {
  'Micra': [
    'Micra 1.0 IG-T'
  ],

  'Juke': [
    'Juke 1.0 DIG-T',
    'Juke 1.0 DIG-T Hybrid',
    'Juke 1.6 DIG-T'
  ],

  'Qashqai': [
    'Qashqai 1.3 DIG-T',
    'Qashqai 1.3 DIG-T MHEV', // Mild hybrid
    'Qashqai 1.5 dCi',
    'Qashqai e-POWER' // Hybrid
  ],

  'X-Trail': [
    'X-Trail 1.3 DIG-T',
    'X-Trail 1.5 dCi',
    'X-Trail e-POWER', // Hybrid
    'X-Trail e-POWER 4WD',
    'X-Trail e-4ORCE' // AWD Hybrid
  ],

  'Ariya': [
    'Ariya 63kWh',
    'Ariya 87kWh',
    'Ariya e-4ORCE 87kWh' // AWD
  ],

  'Leaf': [
    'Leaf 40kWh',
    'Leaf e+ 62kWh'
  ],

  'Townstar': [
    'Townstar 1.3 TCe'
  ]
};

// ============================================
// MAZDA - Complete European Range
// ============================================
const MAZDA_EU_MODELS: Record<string, string[]> = {
  'Mazda2': [
    'Mazda2 1.5 SKYACTIV-G',
    'Mazda2 Hybrid' // Toyota-based hybrid
  ],

  'Mazda3': [
    'Mazda3 2.0 SKYACTIV-G',
    'Mazda3 2.0 SKYACTIV-X', // Compression ignition
    'Mazda3 2.0 e-SKYACTIV-X MHEV', // Mild hybrid
    'Mazda3 2.0 SKYACTIV-G M Hybrid',
    // Sedan
    'Mazda3 Sedan 2.0 SKYACTIV-G',
    'Mazda3 Sedan 2.0 SKYACTIV-X'
  ],

  'Mazda6': [
    'Mazda6 2.0 SKYACTIV-G',
    'Mazda6 2.5 SKYACTIV-G',
    'Mazda6 2.2 SKYACTIV-D', // Diesel
    // Wagon
    'Mazda6 Wagon 2.0 SKYACTIV-G',
    'Mazda6 Wagon 2.2 SKYACTIV-D'
  ],

  'CX-3': [
    'CX-3 2.0 SKYACTIV-G',
    'CX-3 2.0 SKYACTIV-G AWD'
  ],

  'CX-30': [
    'CX-30 2.0 SKYACTIV-G',
    'CX-30 2.0 SKYACTIV-X',
    'CX-30 2.0 e-SKYACTIV-X MHEV',
    'CX-30 2.0 SKYACTIV-G M Hybrid',
    'CX-30 2.0 SKYACTIV-G AWD'
  ],

  'CX-5': [
    'CX-5 2.0 SKYACTIV-G',
    'CX-5 2.5 SKYACTIV-G',
    'CX-5 2.5 SKYACTIV-G AWD',
    'CX-5 2.2 SKYACTIV-D', // Diesel
    'CX-5 2.2 SKYACTIV-D AWD'
  ],

  'CX-60': [
    'CX-60 2.5 e-SKYACTIV PHEV',
    'CX-60 3.3 e-SKYACTIV-D MHEV',
    'CX-60 3.3 Turbo SKYACTIV-D AWD'
  ],

  'CX-80': [
    'CX-80 2.5 e-SKYACTIV PHEV',
    'CX-80 3.3 SKYACTIV-D AWD'
  ],

  'MX-5': [
    'MX-5 1.5 SKYACTIV-G',
    'MX-5 2.0 SKYACTIV-G'
  ],

  'MX-30': [
    'MX-30 Electric',
    'MX-30 R-EV' // Rotary range extender
  ]
};

// Export individual models
export {
  TOYOTA_EU_MODELS,
  HONDA_EU_MODELS,
  NISSAN_EU_MODELS,
  MAZDA_EU_MODELS
};

const JapaneseKoreanBrands = {
  Toyota: TOYOTA_EU_MODELS,
  Honda: HONDA_EU_MODELS,
  Nissan: NISSAN_EU_MODELS,
  Mazda: MAZDA_EU_MODELS
};

export default JapaneseKoreanBrands;


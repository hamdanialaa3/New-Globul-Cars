// Luxury European Brands - Part 1
// الماركات الأوروبية الفاخرة - الجزء 1
// Porsche, Volvo (Jaguar & Land Rover moved to Part2)

// ============================================
// PORSCHE - Complete European Range
// ============================================
const PORSCHE_EU_MODELS: Record<string, string[]> = {
  '911': [
    '911 Carrera',
    '911 Carrera S',
    '911 Carrera 4',
    '911 Carrera 4S',
    '911 Carrera GTS',
    '911 Carrera 4 GTS',
    '911 Targa 4',
    '911 Targa 4S',
    '911 Targa 4 GTS',
    '911 Turbo',
    '911 Turbo S',
    '911 Turbo S Cabriolet',
    '911 GT3',
    '911 GT3 RS',
    '911 GT3 Touring',
    '911 GT2 RS',
    '911 Sport Classic',
    '911 Dakar'
  ],

  '718': [
    '718 Boxster',
    '718 Boxster S',
    '718 Boxster GTS 4.0',
    '718 Boxster Spyder',
    '718 Cayman',
    '718 Cayman S',
    '718 Cayman GTS 4.0',
    '718 Cayman GT4',
    '718 Cayman GT4 RS'
  ],

  'Taycan': [
    'Taycan',
    'Taycan 4S',
    'Taycan GTS',
    'Taycan Turbo',
    'Taycan Turbo S',
    'Taycan Cross Turismo',
    'Taycan 4S Cross Turismo',
    'Taycan Turbo Cross Turismo',
    'Taycan Turbo S Cross Turismo'
  ],

  'Panamera': [
    'Panamera',
    'Panamera 4',
    'Panamera 4 E-Hybrid',
    'Panamera 4S',
    'Panamera 4S E-Hybrid',
    'Panamera GTS',
    'Panamera Turbo',
    'Panamera Turbo S',
    'Panamera Turbo S E-Hybrid',
    // Sport Turismo (Wagon)
    'Panamera 4 Sport Turismo',
    'Panamera 4 E-Hybrid Sport Turismo',
    'Panamera Turbo S Sport Turismo'
  ],

  'Macan': [
    'Macan',
    'Macan T',
    'Macan S',
    'Macan GTS',
    'Macan Turbo',
    'Macan Electric' // New EV version
  ],

  'Cayenne': [
    'Cayenne',
    'Cayenne S',
    'Cayenne E-Hybrid',
    'Cayenne S E-Hybrid',
    'Cayenne GTS',
    'Cayenne Turbo',
    'Cayenne Turbo S',
    'Cayenne Turbo S E-Hybrid',
    // Coupe variants
    'Cayenne Coupe',
    'Cayenne S Coupe',
    'Cayenne E-Hybrid Coupe',
    'Cayenne Turbo Coupe',
    'Cayenne Turbo S Coupe'
  ]
};

// ============================================
// VOLVO - Complete European Range
// ============================================
const VOLVO_EU_MODELS: Record<string, string[]> = {
  'V40': [
    'V40 T2',
    'V40 T3',
    'V40 D2',
    'V40 D3',
    'V40 Cross Country'
  ],

  'V60': [
    'V60 B3',
    'V60 B4',
    'V60 B5',
    'V60 Recharge T6 AWD', // PHEV
    'V60 Recharge T8 AWD', // PHEV
    // Cross Country
    'V60 Cross Country B4 AWD',
    'V60 Cross Country B5 AWD'
  ],

  'V90': [
    'V90 B4',
    'V90 B5',
    'V90 B6 AWD',
    'V90 Recharge T6 AWD',
    'V90 Recharge T8 AWD',
    // Cross Country
    'V90 Cross Country B5 AWD',
    'V90 Cross Country B6 AWD'
  ],

  'S60': [
    'S60 B3',
    'S60 B4',
    'S60 B5',
    'S60 Recharge T6 AWD',
    'S60 Recharge T8 AWD Polestar'
  ],

  'S90': [
    'S90 B4',
    'S90 B5',
    'S90 B6 AWD',
    'S90 Recharge T6 AWD',
    'S90 Recharge T8 AWD'
  ],

  'XC40': [
    'XC40 B3',
    'XC40 B4',
    'XC40 B4 AWD',
    'XC40 Recharge T4 AWD',
    'XC40 Recharge T5 AWD',
    'XC40 Recharge Pure Electric P6 AWD',
    'XC40 Recharge Pure Electric P8 AWD'
  ],

  'XC60': [
    'XC60 B4 AWD',
    'XC60 B5 AWD',
    'XC60 B6 AWD',
    'XC60 Recharge T6 AWD',
    'XC60 Recharge T8 AWD Polestar'
  ],

  'XC90': [
    'XC90 B5 AWD',
    'XC90 B6 AWD',
    'XC90 Recharge T8 AWD'
  ],

  'C40 Recharge': [
    'C40 Recharge Pure Electric P6 AWD',
    'C40 Recharge Pure Electric P8 AWD'
  ],

  'EX30': [
    'EX30 Single Motor',
    'EX30 Twin Motor Performance'
  ],

  'EX90': [
    'EX90 Twin Motor AWD'
  ]
};

// Export individual models
export {
  PORSCHE_EU_MODELS,
  VOLVO_EU_MODELS
};

const LuxuryEuropeanBrands = {
  Porsche: PORSCHE_EU_MODELS,
  Volvo: VOLVO_EU_MODELS
};

export default LuxuryEuropeanBrands;


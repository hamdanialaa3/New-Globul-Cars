// European Popular Brands - Complete Market Data
// الماركات الأوروبية الشائعة - بيانات السوق الكاملة
// Volkswagen, Renault, Peugeot - Bulgarian/European Market

// ============================================
// VOLKSWAGEN - Complete European Range
// ============================================
const VOLKSWAGEN_EU_MODELS: Record<string, string[]> = {
  'Polo': [
    'Polo 1.0 TSI',
    'Polo 1.0 TSI Life',
    'Polo 1.0 TSI Style',
    'Polo 1.0 TSI R-Line',
    'Polo GTI'
  ],

  'Golf': [
    'Golf 1.0 TSI',
    'Golf 1.5 TSI',
    'Golf 1.5 eTSI', // Mild hybrid
    'Golf 2.0 TDI',
    'Golf 1.4 eHybrid', // Plug-in hybrid
    'Golf GTI',
    'Golf GTI Clubsport',
    'Golf GTD',
    'Golf GTE', // Plug-in hybrid
    'Golf R',
    'Golf R 4Motion',
    // Variant (Estate)
    'Golf Variant 1.5 TSI',
    'Golf Variant 2.0 TDI',
    'Golf Variant GTE',
    // Sportsvan
    'Golf Sportsvan 1.5 TSI'
  ],

  'Passat': [
    'Passat 1.5 TSI',
    'Passat 2.0 TSI',
    'Passat 2.0 TDI',
    'Passat 2.0 TDI 4Motion',
    'Passat 1.4 eHybrid', // Plug-in hybrid
    'Passat GTE',
    // Variant (Estate)
    'Passat Variant 1.5 TSI',
    'Passat Variant 2.0 TDI',
    'Passat Variant 2.0 TDI 4Motion',
    'Passat Variant GTE',
    // Alltrack
    'Passat Alltrack 2.0 TDI 4Motion'
  ],

  'Arteon': [
    'Arteon 1.5 TSI',
    'Arteon 2.0 TSI',
    'Arteon 2.0 TSI 4Motion',
    'Arteon 2.0 TDI',
    'Arteon 2.0 TDI 4Motion',
    'Arteon 1.4 eHybrid',
    'Arteon R 2.0 TSI 4Motion',
    // Shooting Brake
    'Arteon Shooting Brake 2.0 TSI',
    'Arteon Shooting Brake R'
  ],

  'T-Cross': [
    'T-Cross 1.0 TSI',
    'T-Cross 1.5 TSI'
  ],

  'T-Roc': [
    'T-Roc 1.0 TSI',
    'T-Roc 1.5 TSI',
    'T-Roc 2.0 TDI',
    'T-Roc 2.0 TSI 4Motion',
    'T-Roc R 2.0 TSI 4Motion',
    // Cabriolet
    'T-Roc Cabriolet 1.5 TSI'
  ],

  'Tiguan': [
    'Tiguan 1.5 TSI',
    'Tiguan 1.5 eTSI', // Mild hybrid
    'Tiguan 2.0 TSI',
    'Tiguan 2.0 TSI 4Motion',
    'Tiguan 2.0 TDI',
    'Tiguan 2.0 TDI 4Motion',
    'Tiguan 1.4 eHybrid', // Plug-in hybrid
    'Tiguan R 2.0 TSI 4Motion',
    // Allspace (7-seater)
    'Tiguan Allspace 2.0 TSI',
    'Tiguan Allspace 2.0 TDI 4Motion'
  ],

  'Touareg': [
    'Touareg 3.0 V6 TDI',
    'Touareg 3.0 V6 TDI 4Motion',
    'Touareg 3.0 V6 TSI 4Motion',
    'Touareg 3.0 eHybrid 4Motion',
    'Touareg R 3.0 eHybrid 4Motion'
  ],

  'ID.3': [
    'ID.3 Pure',
    'ID.3 Pro',
    'ID.3 Pro S',
    'ID.3 Pro Performance',
    'ID.3 GTX' // Performance version
  ],

  'ID.4': [
    'ID.4 Pure',
    'ID.4 Pro',
    'ID.4 Pro 4Motion',
    'ID.4 Pro Performance',
    'ID.4 GTX 4Motion'
  ],

  'ID.5': [
    'ID.5 Pro',
    'ID.5 Pro 4Motion',
    'ID.5 Pro Performance',
    'ID.5 GTX 4Motion'
  ],

  'ID.7': [
    'ID.7 Pro',
    'ID.7 Pro S',
    'ID.7 GTX 4Motion'
  ],

  'ID. Buzz': [
    'ID. Buzz Pro',
    'ID. Buzz Pro LWB', // Long wheelbase
    'ID. Buzz Cargo' // Commercial
  ]
};

// ============================================
// RENAULT - Complete European Range
// ============================================
const RENAULT_EU_MODELS: Record<string, string[]> = {
  'Twingo': [
    'Twingo SCe 65',
    'Twingo TCe 90',
    'Twingo Electric'
  ],

  'Clio': [
    'Clio SCe 65',
    'Clio TCe 90',
    'Clio TCe 100',
    'Clio TCe 130',
    'Clio E-TECH Hybrid',
    'Clio RS Line TCe 130'
  ],

  'Captur': [
    'Captur TCe 90',
    'Captur TCe 100',
    'Captur TCe 130',
    'Captur TCe 140',
    'Captur Blue dCi 95',
    'Captur Blue dCi 115',
    'Captur E-TECH Hybrid 145',
    'Captur E-TECH Plug-in Hybrid 160'
  ],

  'Megane': [
    'Megane TCe 140',
    'Megane TCe 160',
    'Megane Blue dCi 115',
    'Megane E-TECH Plug-in Hybrid 160',
    // Estate
    'Megane Estate TCe 140',
    'Megane Estate Blue dCi 115'
  ],

  'Megane E-Tech Electric': [
    'Megane E-Tech EV40',
    'Megane E-Tech EV60',
    'Megane E-Tech EV60 Optimum Charge'
  ],

  'Arkana': [
    'Arkana TCe 140',
    'Arkana TCe 160',
    'Arkana E-TECH Hybrid 145'
  ],

  'Kadjar': [
    'Kadjar TCe 140',
    'Kadjar TCe 160',
    'Kadjar Blue dCi 115',
    'Kadjar Blue dCi 150'
  ],

  'Koleos': [
    'Koleos Blue dCi 150',
    'Koleos Blue dCi 190 4x4'
  ],

  'Austral': [
    'Austral TCe 140',
    'Austral E-TECH Hybrid 200',
    'Austral E-TECH Hybrid 4x4'
  ],

  'Espace': [
    'Espace E-TECH Hybrid 200'
  ],

  'Scenic E-Tech Electric': [
    'Scenic E-Tech EV60',
    'Scenic E-Tech EV87 Long Range'
  ],

  'Zoe': [
    'Zoe R110',
    'Zoe R135'
  ]
};

// ============================================
// PEUGEOT - Complete European Range
// ============================================
const PEUGEOT_EU_MODELS: Record<string, string[]> = {
  '108': [
    'Peugeot 108 VTi 72',
    'Peugeot 108 VTi 72 TOP!' // Convertible
  ],

  '208': [
    'Peugeot 208 PureTech 75',
    'Peugeot 208 PureTech 100',
    'Peugeot 208 BlueHDi 100',
    'Peugeot 208 GT PureTech 130',
    'Peugeot e-208' // Electric
  ],

  '2008': [
    'Peugeot 2008 PureTech 100',
    'Peugeot 2008 PureTech 130',
    'Peugeot 2008 BlueHDi 110',
    'Peugeot 2008 BlueHDi 130',
    'Peugeot e-2008' // Electric
  ],

  '308': [
    'Peugeot 308 PureTech 110',
    'Peugeot 308 PureTech 130',
    'Peugeot 308 BlueHDi 130',
    'Peugeot 308 Hybrid 180',
    'Peugeot 308 Plug-in Hybrid 225',
    // SW (Estate)
    'Peugeot 308 SW PureTech 130',
    'Peugeot 308 SW Hybrid 180'
  ],

  'e-308': [
    'Peugeot e-308' // Electric
  ],

  '408': [
    'Peugeot 408 PureTech 130',
    'Peugeot 408 Plug-in Hybrid 180',
    'Peugeot 408 Plug-in Hybrid 225'
  ],

  '508': [
    'Peugeot 508 PureTech 130',
    'Peugeot 508 PureTech 180',
    'Peugeot 508 BlueHDi 130',
    'Peugeot 508 BlueHDi 180',
    'Peugeot 508 Hybrid 180',
    'Peugeot 508 Plug-in Hybrid 225',
    'Peugeot 508 PSE 360', // Performance
    // SW (Estate)
    'Peugeot 508 SW Hybrid 180',
    'Peugeot 508 SW PSE 360'
  ],

  '3008': [
    'Peugeot 3008 PureTech 130',
    'Peugeot 3008 PureTech 180',
    'Peugeot 3008 BlueHDi 130',
    'Peugeot 3008 Hybrid 180',
    'Peugeot 3008 Hybrid4 300', // AWD Hybrid
    'Peugeot 3008 Plug-in Hybrid 225'
  ],

  '5008': [
    'Peugeot 5008 PureTech 130',
    'Peugeot 5008 PureTech 180',
    'Peugeot 5008 BlueHDi 130',
    'Peugeot 5008 Hybrid 180',
    'Peugeot 5008 Plug-in Hybrid 225'
  ],

  'e-5008': [
    'Peugeot e-5008' // Electric 7-seater
  ],

  'Rifter': [
    'Peugeot Rifter BlueHDi 100',
    'Peugeot Rifter BlueHDi 130'
  ],

  'Traveller': [
    'Peugeot Traveller BlueHDi 120',
    'Peugeot Traveller BlueHDi 150',
    'Peugeot Traveller BlueHDi 180'
  ]
};

// Export individual models
export {
  VOLKSWAGEN_EU_MODELS,
  RENAULT_EU_MODELS,
  PEUGEOT_EU_MODELS
};

const EuropeanPopularBrands = {
  Volkswagen: VOLKSWAGEN_EU_MODELS,
  Renault: RENAULT_EU_MODELS,
  Peugeot: PEUGEOT_EU_MODELS
};

export default EuropeanPopularBrands;


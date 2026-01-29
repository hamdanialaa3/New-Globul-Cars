// European Brands Part 2 - Citroën, Fiat, Seat, Skoda
// الماركات الأوروبية - الجزء 2
// Complete European market data for Bulgaria

// ============================================
// CITROËN - Complete European Range
// ============================================
const CITROEN_EU_MODELS: Record<string, string[]> = {
  'C1': [
    'C1 VTi 72',
    'C1 PureTech 82'
  ],

  'C3': [
    'C3 PureTech 83',
    'C3 PureTech 110',
    'C3 BlueHDi 100'
  ],

  'C3 Aircross': [
    'C3 Aircross PureTech 110',
    'C3 Aircross PureTech 130',
    'C3 Aircross BlueHDi 110',
    'C3 Aircross BlueHDi 120'
  ],

  'C4': [
    'C4 PureTech 100',
    'C4 PureTech 130',
    'C4 BlueHDi 110',
    'C4 BlueHDi 130'
  ],

  'ë-C4': [
    'ë-C4 Electric' // Fully electric
  ],

  'C5 Aircross': [
    'C5 Aircross PureTech 130',
    'C5 Aircross PureTech 180',
    'C5 Aircross BlueHDi 130',
    'C5 Aircross Plug-in Hybrid 225'
  ],

  'C5 X': [
    'C5 X PureTech 130',
    'C5 X PureTech 180',
    'C5 X Plug-in Hybrid 225'
  ],

  'Berlingo': [
    'Berlingo PureTech 110',
    'Berlingo PureTech 130',
    'Berlingo BlueHDi 100',
    'Berlingo BlueHDi 130'
  ],

  'ë-Berlingo': [
    'ë-Berlingo Electric'
  ],

  'SpaceTourer': [
    'SpaceTourer BlueHDi 120',
    'SpaceTourer BlueHDi 150',
    'SpaceTourer BlueHDi 180'
  ],

  'ë-SpaceTourer': [
    'ë-SpaceTourer Electric'
  ]
};

// ============================================
// FIAT - Complete European Range
// ============================================
const FIAT_EU_MODELS: Record<string, string[]> = {
  '500': [
    'Fiat 500 Hybrid',
    'Fiat 500 1.0 Hybrid',
    'Fiat 500 Star'
  ],

  '500e': [
    '500e Electric',
    '500e (42 kWh)',
    '500e La Prima',
    '500e RED'
  ],

  '500X': [
    '500X 1.0 FireFly Turbo',
    '500X 1.3 FireFly Turbo',
    '500X 1.6 MultiJet',
    '500X Cross',
    '500X Sport'
  ],

  '600e': [
    '600e Electric',
    '600e La Prima'
  ],

  'Panda': [
    'Panda 1.0 FireFly Hybrid',
    'Panda 1.2',
    'Panda City Cross',
    'Panda 4x4'
  ],

  'Tipo': [
    'Tipo 1.0 FireFly',
    'Tipo 1.5 FireFly Hybrid',
    'Tipo 1.6 MultiJet',
    // Cross version
    'Tipo Cross 1.0 FireFly',
    // Station Wagon
    'Tipo SW 1.5 FireFly Hybrid'
  ],

  'Ducato': [
    'Ducato 2.3 MultiJet',
    'Ducato e-Ducato Electric'
  ]
};

// ============================================
// SEAT - Complete European Range
// ============================================
const SEAT_EU_MODELS: Record<string, string[]> = {
  'Ibiza': [
    'Ibiza 1.0 MPI',
    'Ibiza 1.0 TSI',
    'Ibiza 1.5 TSI',
    'Ibiza FR 1.0 TSI',
    'Ibiza FR 1.5 TSI'
  ],

  'Arona': [
    'Arona 1.0 TSI',
    'Arona 1.5 TSI',
    'Arona 1.6 TDI',
    'Arona FR 1.5 TSI'
  ],

  'Leon': [
    'Leon 1.0 TSI',
    'Leon 1.5 TSI',
    'Leon 1.5 eTSI', // Mild hybrid
    'Leon 2.0 TDI',
    'Leon 1.4 e-HYBRID', // Plug-in
    'Leon FR 1.5 TSI',
    'Leon FR 2.0 TDI',
    'Leon Cupra 2.0 TSI 300',
    // Sportstourer (Estate)
    'Leon Sportstourer 1.5 TSI',
    'Leon Sportstourer 2.0 TDI',
    'Leon Sportstourer e-HYBRID',
    'Leon Sportstourer Cupra 2.0 TSI'
  ],

  'Ateca': [
    'Ateca 1.0 TSI',
    'Ateca 1.5 TSI',
    'Ateca 2.0 TSI',
    'Ateca 2.0 TDI',
    'Ateca 2.0 TDI 4Drive',
    'Ateca FR 2.0 TSI',
    'Ateca Cupra 2.0 TSI 300 4Drive'
  ],

  'Tarraco': [
    'Tarraco 1.5 TSI',
    'Tarraco 2.0 TSI',
    'Tarraco 2.0 TSI 4Drive',
    'Tarraco 2.0 TDI',
    'Tarraco 2.0 TDI 4Drive',
    'Tarraco 1.4 e-HYBRID',
    'Tarraco FR 2.0 TSI 4Drive'
  ]
};

// ============================================
// SKODA - Complete European Range
// ============================================
const SKODA_EU_MODELS: Record<string, string[]> = {
  'Fabia': [
    'Fabia 1.0 MPI',
    'Fabia 1.0 TSI',
    'Fabia 1.5 TSI',
    'Fabia Monte Carlo 1.0 TSI'
  ],

  'Scala': [
    'Scala 1.0 TSI',
    'Scala 1.5 TSI'
  ],

  'Octavia': [
    'Octavia 1.0 TSI',
    'Octavia 1.5 TSI',
    'Octavia 2.0 TSI',
    'Octavia 2.0 TDI',
    'Octavia 1.4 iV', // Plug-in hybrid
    'Octavia vRS 2.0 TSI',
    'Octavia vRS 2.0 TDI',
    // Combi (Estate)
    'Octavia Combi 1.5 TSI',
    'Octavia Combi 2.0 TDI',
    'Octavia Combi 1.4 iV',
    'Octavia Combi vRS 2.0 TSI',
    // Scout
    'Octavia Scout 2.0 TDI 4x4'
  ],

  'Superb': [
    'Superb 1.5 TSI',
    'Superb 2.0 TSI',
    'Superb 2.0 TDI',
    'Superb 1.4 iV', // Plug-in hybrid
    // Combi (Estate)
    'Superb Combi 2.0 TSI',
    'Superb Combi 2.0 TDI',
    'Superb Combi 1.4 iV',
    // Scout
    'Superb Scout 2.0 TDI 4x4'
  ],

  'Kamiq': [
    'Kamiq 1.0 TSI',
    'Kamiq 1.5 TSI'
  ],

  'Karoq': [
    'Karoq 1.0 TSI',
    'Karoq 1.5 TSI',
    'Karoq 2.0 TSI 4x4',
    'Karoq 2.0 TDI',
    'Karoq 2.0 TDI 4x4',
    'Karoq vRS 2.0 TSI 4x4'
  ],

  'Kodiaq': [
    'Kodiaq 1.5 TSI',
    'Kodiaq 2.0 TSI',
    'Kodiaq 2.0 TSI 4x4',
    'Kodiaq 2.0 TDI',
    'Kodiaq 2.0 TDI 4x4',
    'Kodiaq vRS 2.0 TSI 4x4',
    // Scout
    'Kodiaq Scout 2.0 TDI 4x4'
  ],

  'Enyaq iV': [
    'Enyaq iV 60',
    'Enyaq iV 80',
    'Enyaq iV 80x', // AWD
    'Enyaq iV vRS' // Performance
  ],

  'Enyaq Coupe iV': [
    'Enyaq Coupe iV 80',
    'Enyaq Coupe iV 80x',
    'Enyaq Coupe iV vRS'
  ]
};

// Export individual models
export {
  CITROEN_EU_MODELS,
  FIAT_EU_MODELS,
  SEAT_EU_MODELS,
  SKODA_EU_MODELS
};

const EuropeanBrandsPart2 = {
  'Citroën': CITROEN_EU_MODELS,
  'Fiat': FIAT_EU_MODELS,
  'Seat': SEAT_EU_MODELS,
  'Skoda': SKODA_EU_MODELS
};

export default EuropeanBrandsPart2;


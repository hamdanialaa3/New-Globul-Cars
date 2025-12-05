// Korean Brands - Hyundai & Kia - Complete European Market
// الماركات الكورية - السوق الأوروبي الكامل
// Very popular in Bulgaria

// ============================================
// HYUNDAI - Complete European Range
// ============================================
const HYUNDAI_EU_MODELS: Record<string, string[]> = {
  'i10': [
    'i10 1.0 MPi',
    'i10 1.2 MPi',
    'i10 N Line'
  ],

  'i20': [
    'i20 1.0 T-GDi',
    'i20 1.2 MPi',
    'i20 1.0 T-GDi 48V MHEV', // Mild hybrid
    'i20 N Line 1.0 T-GDi',
    'i20 N' // Performance
  ],

  'i30': [
    'i30 1.0 T-GDi',
    'i30 1.5 T-GDi',
    'i30 1.6 CRDi', // Diesel
    'i30 1.5 T-GDi 48V MHEV',
    'i30 N Line 1.5 T-GDi',
    'i30 N' // Performance
  ],

  'i30 Fastback': [
    'i30 Fastback 1.0 T-GDi',
    'i30 Fastback 1.5 T-GDi',
    'i30 Fastback N Line',
    'i30 Fastback N'
  ],

  'i30 Wagon': [
    'i30 Wagon 1.5 T-GDi',
    'i30 Wagon 1.6 CRDi'
  ],

  'Bayon': [
    'Bayon 1.0 T-GDi',
    'Bayon 1.0 T-GDi 48V MHEV'
  ],

  'Kona': [
    'Kona 1.0 T-GDi',
    'Kona 1.6 T-GDi',
    'Kona 1.6 T-GDi Hybrid',
    'Kona 1.6 CRDi', // Diesel
    'Kona N Line 1.6 T-GDi',
    'Kona N' // Performance
  ],

  'Kona Electric': [
    'Kona Electric 39kWh',
    'Kona Electric 64kWh'
  ],

  'Tucson': [
    'Tucson 1.6 T-GDi',
    'Tucson 1.6 T-GDi 4WD',
    'Tucson 1.6 T-GDi Hybrid',
    'Tucson 1.6 T-GDi PHEV', // Plug-in hybrid
    'Tucson 1.6 CRDi',
    'Tucson 2.0 CRDi 4WD',
    'Tucson N Line 1.6 T-GDi PHEV'
  ],

  'Santa Fe': [
    'Santa Fe 1.6 T-GDi Hybrid',
    'Santa Fe 1.6 T-GDi Hybrid 4WD',
    'Santa Fe 1.6 T-GDi PHEV 4WD',
    'Santa Fe 2.2 CRDi',
    'Santa Fe 2.2 CRDi 4WD'
  ],

  'Ioniq': [
    'Ioniq Hybrid',
    'Ioniq Plug-in Hybrid',
    'Ioniq Electric'
  ],

  'Ioniq 5': [
    'Ioniq 5 58kWh',
    'Ioniq 5 72.6kWh',
    'Ioniq 5 72.6kWh AWD',
    'Ioniq 5 N' // Performance AWD
  ],

  'Ioniq 6': [
    'Ioniq 6 53kWh',
    'Ioniq 6 77.4kWh',
    'Ioniq 6 77.4kWh AWD',
    'Ioniq 6 N Line'
  ],

  'Staria': [
    'Staria 2.2 CRDi'
  ]
};

// ============================================
// KIA - Complete European Range
// ============================================
const KIA_EU_MODELS: Record<string, string[]> = {
  'Picanto': [
    'Picanto 1.0',
    'Picanto 1.0 T-GDi',
    'Picanto GT-Line'
  ],

  'Rio': [
    'Rio 1.0 T-GDi',
    'Rio 1.2',
    'Rio GT-Line 1.0 T-GDi'
  ],

  'Stonic': [
    'Stonic 1.0 T-GDi',
    'Stonic 1.0 T-GDi 48V MHEV',
    'Stonic GT-Line'
  ],

  'Ceed': [
    'Ceed 1.0 T-GDi',
    'Ceed 1.5 T-GDi',
    'Ceed 1.6 CRDi',
    'Ceed 1.5 T-GDi 48V MHEV',
    'Ceed GT-Line 1.5 T-GDi'
  ],

  'Ceed Sportswagon': [
    'Ceed SW 1.5 T-GDi',
    'Ceed SW 1.6 CRDi',
    'Ceed SW GT-Line'
  ],

  'ProCeed': [
    'ProCeed 1.5 T-GDi',
    'ProCeed GT 1.6 T-GDi'
  ],

  'XCeed': [
    'XCeed 1.5 T-GDi',
    'XCeed 1.5 T-GDi 48V MHEV',
    'XCeed 1.6 CRDi',
    'XCeed PHEV 1.6 T-GDi'
  ],

  'Niro': [
    'Niro Hybrid',
    'Niro Plug-in Hybrid',
    'Niro EV' // Electric
  ],

  'Sportage': [
    'Sportage 1.6 T-GDi',
    'Sportage 1.6 T-GDi Hybrid',
    'Sportage 1.6 T-GDi PHEV 4WD',
    'Sportage 1.6 CRDi',
    'Sportage 2.0 CRDi 4WD',
    'Sportage GT-Line 1.6 T-GDi PHEV'
  ],

  'Sorento': [
    'Sorento 1.6 T-GDi Hybrid',
    'Sorento 1.6 T-GDi PHEV 4WD',
    'Sorento 2.2 CRDi',
    'Sorento 2.2 CRDi 4WD',
    'Sorento GT-Line PHEV'
  ],

  'EV6': [
    'EV6 58kWh',
    'EV6 77.4kWh',
    'EV6 77.4kWh AWD',
    'EV6 GT-Line AWD',
    'EV6 GT' // Performance 585 HP
  ],

  'EV9': [
    'EV9 76.1kWh AWD',
    'EV9 99.8kWh AWD',
    'EV9 GT-Line AWD'
  ],

  'Stinger': [
    'Stinger 2.0 T-GDi',
    'Stinger 2.2 CRDi',
    'Stinger GT 3.3 T-GDi AWD'
  ]
};

// ============================================
// SUBARU - Complete European Range
// ============================================
const SUBARU_EU_MODELS: Record<string, string[]> = {
  'Impreza': [
    'Impreza 1.6i',
    'Impreza 2.0i',
    'Impreza 2.0i AWD'
  ],

  'XV': [
    'XV 1.6i',
    'XV 2.0i',
    'XV 2.0i e-Boxer' // Mild hybrid
  ],

  'Forester': [
    'Forester 2.0i',
    'Forester 2.0i e-Boxer'
  ],

  'Outback': [
    'Outback 2.5i',
    'Outback 2.5i Lineartronic'
  ],

  'Levorg': [
    'Levorg 1.8 DIT',
    'Levorg 2.4 DIT'
  ],

  'BRZ': [
    'BRZ 2.0',
    'BRZ 2.4'
  ],

  'Solterra': [
    'Solterra AWD Electric'
  ]
};

// ============================================
// MITSUBISHI - Complete European Range
// ============================================
const MITSUBISHI_EU_MODELS: Record<string, string[]> = {
  'Space Star': [
    'Space Star 1.0',
    'Space Star 1.2'
  ],

  'Colt': [
    'Colt 1.3 ClearTec',
    'Colt 1.5 DI-D'
  ],

  'ASX': [
    'ASX 1.6',
    'ASX 2.0',
    'ASX 1.6 DI-D'
  ],

  'Eclipse Cross': [
    'Eclipse Cross 1.5 T',
    'Eclipse Cross 2.2 Di-D 4WD',
    'Eclipse Cross PHEV 4WD'
  ],

  'Outlander': [
    'Outlander 2.0',
    'Outlander 2.5',
    'Outlander 2.2 DI-D 4WD',
    'Outlander PHEV 4WD'
  ],

  'L200': [
    'L200 2.2 DI-D 4WD',
    'L200 2.3 DI-D 4WD'
  ]
};

// Export individual models
export {
  HYUNDAI_EU_MODELS,
  KIA_EU_MODELS,
  SUBARU_EU_MODELS,
  MITSUBISHI_EU_MODELS
};

const KoreanBrandsComplete = {
  Hyundai: HYUNDAI_EU_MODELS,
  Kia: KIA_EU_MODELS,
  Subaru: SUBARU_EU_MODELS,
  Mitsubishi: MITSUBISHI_EU_MODELS
};

export default KoreanBrandsComplete;


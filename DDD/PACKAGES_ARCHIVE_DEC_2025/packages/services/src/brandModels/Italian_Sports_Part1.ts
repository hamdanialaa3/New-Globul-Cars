// Italian Luxury & Sports Brands - Part 1
// Ferrari, Lamborghini, Maserati

// ============================================
// FERRARI - Complete Range
// ============================================
export const FERRARI_MODELS: Record<string, string[]> = {
  'Roma': [
    'Roma',
    'Roma Spider'
  ],

  'Portofino': [
    'Portofino',
    'Portofino M'
  ],

  '296': [
    '296 GTB',
    '296 GTS'
  ],

  'F8': [
    'F8 Tributo',
    'F8 Spider'
  ],

  'SF90': [
    'SF90 Stradale',
    'SF90 Spider',
    'SF90 XX Stradale',
    'SF90 XX Spider'
  ],

  '812': [
    '812 Superfast',
    '812 GTS',
    '812 Competizione',
    '812 Competizione A'
  ],

  'Purosangue': [
    'Purosangue V12'
  ],

  'Daytona SP3': [
    'Daytona SP3'
  ]
};

// ============================================
// LAMBORGHINI - Complete Range
// ============================================
export const LAMBORGHINI_MODELS: Record<string, string[]> = {
  'Huracán': [
    'Huracán EVO',
    'Huracán EVO RWD',
    'Huracán EVO Spyder',
    'Huracán EVO AWD',
    'Huracán STO',
    'Huracán Tecnica',
    'Huracán Sterrato'
  ],

  'Urus': [
    'Urus',
    'Urus S',
    'Urus Performante',
    'Urus SE' // Hybrid
  ],

  'Aventador': [
    'Aventador LP 700-4',
    'Aventador S',
    'Aventador SVJ',
    'Aventador SVJ Roadster',
    'Aventador Ultimae',
    'Aventador Ultimae Roadster'
  ],

  'Revuelto': [
    'Revuelto V12 PHEV'
  ],

  'Countach': [
    'Countach LPI 800-4'
  ]
};

// ============================================
// MASERATI - Complete European Range
// ============================================
export const MASERATI_EU_MODELS: Record<string, string[]> = {
  'Ghibli': [
    'Ghibli GT',
    'Ghibli Modena',
    'Ghibli Modena S',
    'Ghibli Trofeo'
  ],

  'Quattroporte': [
    'Quattroporte GT',
    'Quattroporte Modena',
    'Quattroporte Modena S',
    'Quattroporte Trofeo'
  ],

  'Levante': [
    'Levante GT',
    'Levante GT Hybrid',
    'Levante Modena',
    'Levante Modena S',
    'Levante Trofeo'
  ],

  'Grecale': [
    'Grecale GT',
    'Grecale Modena',
    'Grecale Trofeo',
    'Grecale Folgore' // Electric
  ],

  'GranTurismo': [
    'GranTurismo Modena',
    'GranTurismo Trofeo',
    'GranTurismo Folgore' // Electric
  ],

  'GranCabrio': [
    'GranCabrio Trofeo',
    'GranCabrio Folgore' // Electric
  ],

  'MC20': [
    'MC20',
    'MC20 Cielo'
  ]
};

export default {
  Ferrari: FERRARI_MODELS,
  Lamborghini: LAMBORGHINI_MODELS,
  Maserati: MASERATI_EU_MODELS
};


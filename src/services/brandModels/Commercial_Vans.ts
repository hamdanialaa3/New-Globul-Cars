// Commercial Vans - Complete European Market
// السيارات التجارية - السوق الأوروبي الكامل
// Mercedes Sprinter/Vito, Ford Transit, VW Transporter, etc.

// ============================================
// MERCEDES-BENZ VANS - Complete Range
// ============================================
export const MERCEDES_VANS: Record<string, string[]> = {
  'Sprinter': [
    'Sprinter 211 CDI',
    'Sprinter 214 CDI',
    'Sprinter 216 CDI',
    'Sprinter 219 CDI',
    'Sprinter 311 CDI',
    'Sprinter 314 CDI',
    'Sprinter 316 CDI',
    'Sprinter 319 CDI',
    'Sprinter 411 CDI',
    'Sprinter 414 CDI',
    'Sprinter 416 CDI',
    'Sprinter 419 CDI',
    'Sprinter 516 CDI',
    'Sprinter 519 CDI',
    // Electric
    'eSprinter',
    // Passenger versions
    'Sprinter Tourer',
    'Sprinter Transfer'
  ],

  'Vito': [
    'Vito 109 CDI',
    'Vito 111 CDI',
    'Vito 114 CDI',
    'Vito 116 CDI',
    'Vito 119 CDI',
    // Electric
    'eVito',
    'eVito Tourer',
    // Passenger version
    'Vito Tourer 114 CDI',
    'Vito Tourer 116 CDI',
    'Vito Tourer 119 CDI'
  ],

  'Citan': [
    'Citan 108 CDI',
    'Citan 109 CDI',
    'Citan 111 CDI',
    // Tourer (passenger)
    'Citan Tourer 108 CDI',
    'Citan Tourer 111 CDI',
    // Electric
    'eCitan'
  ]
};

// ============================================
// FORD VANS - Complete Range
// ============================================
export const FORD_VANS: Record<string, string[]> = {
  'Transit': [
    'Transit 2.0 EcoBlue 105',
    'Transit 2.0 EcoBlue 130',
    'Transit 2.0 EcoBlue 170',
    'Transit 2.0 EcoBlue 185',
    'Transit Custom 2.0 EcoBlue',
    // Electric
    'E-Transit',
    'E-Transit Custom',
    // Passenger
    'Transit Kombi',
    'Tourneo Custom'
  ],

  'Transit Connect': [
    'Transit Connect 1.5 EcoBlue',
    'Transit Connect Wagon',
    'Tourneo Connect'
  ],

  'Transit Courier': [
    'Transit Courier 1.5 TDCi',
    'Transit Courier 1.0 EcoBoost'
  ]
};

// ============================================
// VOLKSWAGEN VANS - Complete Range
// ============================================
export const VW_VANS: Record<string, string[]> = {
  'Transporter': [
    'Transporter T6.1 2.0 TDI',
    'Transporter T6.1 2.0 TDI 4Motion',
    // Passenger
    'Multivan T6.1 2.0 TDI',
    'Caravelle 2.0 TDI',
    'California 2.0 TDI' // Camper
  ],

  'Multivan': [
    'Multivan T7 2.0 TDI',
    'Multivan T7 1.4 eHybrid', // PHEV
    'Multivan T7 2.0 TSI'
  ],

  'California': [
    'California Ocean',
    'California Coast',
    'California Beach'
  ],

  'Caddy': [
    'Caddy 2.0 TDI',
    'Caddy Maxi 2.0 TDI',
    'Caddy California' // Camper
  ],

  'ID. Buzz': [
    'ID. Buzz Pro',
    'ID. Buzz Pro LWB',
    'ID. Buzz Cargo' // Already in main VW list but repeated here
  ],

  'Crafter': [
    'Crafter 2.0 TDI',
    'Crafter 35 2.0 TDI',
    'Crafter 50 2.0 TDI',
    // Electric
    'e-Crafter'
  ]
};

// ============================================
// RENAULT VANS - Complete Range
// ============================================
export const RENAULT_VANS: Record<string, string[]> = {
  'Kangoo': [
    'Kangoo Van Blue dCi 95',
    'Kangoo Van Blue dCi 115',
    'Kangoo E-Tech Electric'
  ],

  'Trafic': [
    'Trafic Blue dCi 110',
    'Trafic Blue dCi 130',
    'Trafic Blue dCi 150',
    'Trafic E-Tech Electric'
  ],

  'Master': [
    'Master Blue dCi 135',
    'Master Blue dCi 150',
    'Master Blue dCi 180',
    'Master E-Tech Electric'
  ]
};

// ============================================
// PEUGEOT VANS - Complete Range
// ============================================
export const PEUGEOT_VANS: Record<string, string[]> = {
  'Partner': [
    'Partner BlueHDi 100',
    'Partner BlueHDi 130',
    'e-Partner Electric'
  ],

  'Expert': [
    'Expert BlueHDi 120',
    'Expert BlueHDi 150',
    'Expert BlueHDi 180',
    'e-Expert Electric'
  ],

  'Boxer': [
    'Boxer BlueHDi 140',
    'Boxer BlueHDi 165'
  ]
};

// ============================================
// CITROEN VANS - Complete Range
// ============================================
export const CITROEN_VANS: Record<string, string[]> = {
  'Berlingo Van': [
    'Berlingo Van BlueHDi 100',
    'Berlingo Van BlueHDi 130',
    'ë-Berlingo Electric'
  ],

  'Jumpy': [
    'Jumpy BlueHDi 120',
    'Jumpy BlueHDi 150',
    'ë-Jumpy Electric'
  ],

  'Jumper': [
    'Jumper BlueHDi 140',
    'Jumper BlueHDi 165'
  ]
};

// ============================================
// FIAT VANS - Complete Range
// ============================================
export const FIAT_VANS: Record<string, string[]> = {
  'Doblo': [
    'Doblo 1.6 MultiJet',
    'Doblo Cargo',
    'E-Doblo Electric'
  ],

  'Scudo': [
    'Scudo 2.0 MultiJet',
    'E-Scudo Electric'
  ],

  'Ducato': [
    'Ducato 2.3 MultiJet',
    'Ducato 2.3 MultiJet 120',
    'Ducato 2.3 MultiJet 140',
    'Ducato 2.3 MultiJet 180',
    'E-Ducato Electric'
  ]
};

// Individual vans are already exported above with 'export const'

const CommercialVans = {
  'Mercedes-Benz Vans': MERCEDES_VANS,
  'Ford Vans': FORD_VANS,
  'Volkswagen Vans': VW_VANS,
  'Renault Vans': RENAULT_VANS,
  'Peugeot Vans': PEUGEOT_VANS,
  'Citroën Vans': CITROEN_VANS,
  'Fiat Vans': FIAT_VANS
};

export default CommercialVans;


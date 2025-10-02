// Luxury European Brands Part 2 - Jaguar, Land Rover
// الماركات الأوروبية الفاخرة - الجزء 2

// ============================================
// JAGUAR - Complete European Range
// ============================================
const JAGUAR_EU_MODELS: Record<string, string[]> = {
  'XE': [
    'XE P250',
    'XE D165',
    'XE D180',
    'XE P300 R-Dynamic'
  ],

  'XF': [
    'XF P250',
    'XF P300',
    'XF D165',
    'XF D200',
    // Sportbrake (Wagon)
    'XF Sportbrake P250',
    'XF Sportbrake D200'
  ],

  'XJ': [
    'XJ 3.0 V6',
    'XJ 3.0 V6 Supercharged',
    'XJ 5.0 V8 Supercharged',
    'XJR 5.0 V8'
  ],

  'F-Type': [
    'F-Type P300',
    'F-Type P450',
    'F-Type R P575',
    'F-Type Convertible P300',
    'F-Type Convertible P450',
    'F-Type Convertible R P575',
    'F-Type R-Dynamic'
  ],

  'E-Pace': [
    'E-Pace P160',
    'E-Pace P200',
    'E-Pace P250',
    'E-Pace P300',
    'E-Pace D165',
    'E-Pace D180',
    'E-Pace R-Dynamic P250'
  ],

  'F-Pace': [
    'F-Pace P250',
    'F-Pace P300',
    'F-Pace P400',
    'F-Pace D200',
    'F-Pace D300',
    'F-Pace SVR V8',
    'F-Pace R-Dynamic'
  ],

  'I-Pace': [
    'I-Pace EV400',
    'I-Pace HSE'
  ]
};

// ============================================
// LAND ROVER - Complete European Range
// ============================================
const LAND_ROVER_EU_MODELS: Record<string, string[]> = {
  'Defender': [
    'Defender 90',
    'Defender 90 P300',
    'Defender 90 D200',
    'Defender 110',
    'Defender 110 P300',
    'Defender 110 P400',
    'Defender 110 D200',
    'Defender 110 D250',
    'Defender 110 D300',
    'Defender 130',
    'Defender V8 P525',
    'Defender OCTA' // New performance variant
  ],

  'Discovery': [
    'Discovery P300',
    'Discovery D250',
    'Discovery D300',
    'Discovery D300 AWD',
    'Discovery Metropolitan Edition'
  ],

  'Discovery Sport': [
    'Discovery Sport P200',
    'Discovery Sport P250',
    'Discovery Sport P300',
    'Discovery Sport D165',
    'Discovery Sport D200'
  ],

  'Range Rover Evoque': [
    'Evoque P200',
    'Evoque P250',
    'Evoque P300',
    'Evoque D165',
    'Evoque D200',
    'Evoque P300e' // PHEV
  ],

  'Range Rover Velar': [
    'Velar P250',
    'Velar P300',
    'Velar P400',
    'Velar D200',
    'Velar D300',
    'Velar P400e' // PHEV
  ],

  'Range Rover Sport': [
    'Range Rover Sport P360',
    'Range Rover Sport P400',
    'Range Rover Sport P510',
    'Range Rover Sport D250',
    'Range Rover Sport D300',
    'Range Rover Sport P440e', // PHEV
    'Range Rover Sport SV V8'
  ],

  'Range Rover': [
    'Range Rover P360',
    'Range Rover P400',
    'Range Rover P530',
    'Range Rover D300',
    'Range Rover D350',
    'Range Rover P440e', // PHEV
    'Range Rover P510e', // PHEV
    'Range Rover SV',
    'Range Rover LWB', // Long wheelbase
    'Range Rover SV LWB'
  ]
};

// Export individual models
export {
  JAGUAR_EU_MODELS,
  LAND_ROVER_EU_MODELS
};

const LuxuryEuropeanPart2 = {
  Jaguar: JAGUAR_EU_MODELS,
  'Land Rover': LAND_ROVER_EU_MODELS
};

export default LuxuryEuropeanPart2;

// American Brands Part 2 - Tesla, Jeep, Dodge, Cadillac
// الماركات الأمريكية - الجزء 2
// Analyzed from respective .txt files

// ============================================
// TESLA - Electric Vehicle Manufacturer
// ============================================
export const TESLA_MODELS_VARIANTS: Record<string, string[]> = {
  'Model S': [
    'Model S',
    'Model S Concept'
  ],

  'Model 3': [
    'Model 3',
    'Model 3 Performance'
  ],

  'Model X': [
    'Model X',
    'Model X Prototype'
  ],

  'Model Y': [
    'Model Y',
    'Model Y Performance'
  ],

  'Cybertruck': [
    'Cybertruck',
    'Cybertruck Concept'
  ],

  'Roadster': [
    'Roadster Concept'
  ],

  'Robotaxi': [
    'Robotaxi Concept'
  ]
};

// ============================================
// JEEP - Off-Road Vehicle Specialist
// ============================================
export const JEEP_MODELS_VARIANTS: Record<string, string[]> = {
  'Wrangler': [
    'Wrangler',
    'Wrangler 4xe',
    'Wrangler Rubicon',
    'Wrangler Rubicon 4xe',
    'Wrangler Unlimited',
    'Wrangler Magneto Concept',
    'Wrangler Trailcat Concept'
  ],

  'Grand Cherokee': [
    'Grand Cherokee',
    'Grand Cherokee 4xe',
    'Grand Cherokee L',
    'Grand Cherokee Trackhawk',
    'Grand Cherokee SRT'
  ],

  'Cherokee': [
    'Cherokee',
    'Cherokee Trailhawk'
  ],

  'Compass': [
    'Compass',
    'Compass 4xe',
    'Compass Trailhawk'
  ],

  'Renegade': [
    'Renegade',
    'Renegade 4xe',
    'Renegade Trailhawk'
  ],

  'Gladiator': [
    'Gladiator',
    'Gladiator 4xe',
    'Gladiator Mojave',
    'Gladiator Rubicon'
  ],

  'Avenger': [
    'Avenger',
    'Avenger 4xe'
  ],

  'Wagoneer': [
    'Wagoneer',
    'Wagoneer S',
    'Grand Wagoneer'
  ],

  'Recon': [
    'Recon'
  ]
};

// ============================================
// DODGE - Performance Brand
// ============================================
export const DODGE_MODELS_VARIANTS: Record<string, string[]> = {
  'Challenger': [
    'Challenger',
    'Challenger SRT',
    'Challenger SRT Hellcat',
    'Challenger SRT Demon',
    'Challenger SRT Demon 170',
    'Challenger R/T',
    'Challenger GT'
  ],

  'Charger': [
    'Charger',
    'Charger SRT',
    'Charger SRT Hellcat',
    'Charger SRT Hellcat Widebody',
    'Charger Daytona',
    'Charger R/T',
    'Charger GT'
  ],

  'Durango': [
    'Durango',
    'Durango SRT',
    'Durango SRT Hellcat',
    'Durango R/T',
    'Durango GT'
  ],

  'Hornet': [
    'Hornet',
    'Hornet R/T'
  ],

  'Journey': [
    'Journey'
  ],

  'Dart': [
    'Dart'
  ]
};

// ============================================
// CADILLAC - Luxury Division of GM
// ============================================
export const CADILLAC_MODELS_VARIANTS: Record<string, string[]> = {
  'Escalade': [
    'Escalade',
    'Escalade ESV',
    'Escalade-V',
    'Escalade IQ'
  ],

  'XT5': [
    'XT5'
  ],

  'XT6': [
    'XT6'
  ],

  'XT4': [
    'XT4'
  ],

  'Lyriq': [
    'Lyriq'
  ],

  'CT4': [
    'CT4',
    'CT4-V',
    'CT4-V Blackwing'
  ],

  'CT5': [
    'CT5',
    'CT5-V',
    'CT5-V Blackwing'
  ],

  'CT6': [
    'CT6',
    'CT6-V'
  ],

  'ATS': [
    'ATS',
    'ATS-V'
  ],

  'CTS': [
    'CTS',
    'CTS-V'
  ],

  'XTS': [
    'XTS'
  ],

  'ELR': [
    'ELR'
  ]
};

// Export all
export const AMERICAN_BRANDS_PART2 = {
  Tesla: TESLA_MODELS_VARIANTS,
  Jeep: JEEP_MODELS_VARIANTS,
  Dodge: DODGE_MODELS_VARIANTS,
  Cadillac: CADILLAC_MODELS_VARIANTS
};

export default AMERICAN_BRANDS_PART2;


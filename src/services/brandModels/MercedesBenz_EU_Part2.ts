// Mercedes-Benz Complete European Models - Part 2
// موديلات مرسيدس بنز الكاملة - الجزء 2
// SUVs, Sports Cars, and Electric Vehicles

export const MERCEDES_BENZ_EU_MODELS_PART2: Record<string, string[]> = {
  // GLS-Class - Full-size Luxury SUV
  'GLS': [
    'GLS 350 d 4MATIC',
    'GLS 400 d 4MATIC',
    'GLS 450 4MATIC',
    'GLS 500 4MATIC',
    'GLS 580 4MATIC',
    'AMG GLS 63 4MATIC+',
    // Maybach variants
    'Maybach GLS 600 4MATIC',
    'Maybach GLS 680 4MATIC' // V12 (if available)
  ],

  // G-Class - Iconic Off-Road SUV
  'G-Class': [
    'G 350 d',
    'G 400 d',
    'G 400 d 4x4²', // Extreme off-road
    'G 500',
    'G 550', // US designation, sometimes in EU
    'AMG G 63',
    'AMG G 65', // V12 (older, discontinued)
    'G 63 4x4²', // Extreme version
    // Special editions
    'AMG G 63 Edition 1',
    'Professional Line' // Commercial/military variant
  ],

  // SL-Class - Grand Tourer Roadster
  'SL': [
    'SL 400', // Older model
    'SL 450',
    'SL 500',
    'SL 550', // Some markets
    'AMG SL 43',
    'AMG SL 55 4MATIC+',
    'AMG SL 63 4MATIC+',
    'AMG SL 65', // V12 (older)
    'AMG SL 73 e', // New Hybrid performance
    // Special editions
    'SL Grand Edition'
  ],

  // SLC-Class - Compact Roadster (discontinued but still in market)
  'SLC': [
    'SLC 180',
    'SLC 200',
    'SLC 300',
    'AMG SLC 43'
  ],

  // AMG GT - Sports Car Range
  'AMG GT': [
    'AMG GT',
    'AMG GT S',
    'AMG GT C',
    'AMG GT R',
    'AMG GT R Pro',
    'AMG GT Black Series',
    // Roadster variants
    'AMG GT Roadster',
    'AMG GT S Roadster',
    'AMG GT C Roadster',
    // 4-door variants
    'AMG GT 43 4MATIC+',
    'AMG GT 53 4MATIC+',
    'AMG GT 63 4MATIC+',
    'AMG GT 63 S 4MATIC+',
    'AMG GT 73 e 4MATIC+' // Hybrid
  ],

  // V-Class - Luxury MPV/Van
  'V-Class': [
    'V 200 d',
    'V 220 d',
    'V 250 d',
    'V 300 d',
    // Long versions
    'V 220 d LONG',
    'V 250 d LONG',
    'V 300 d LONG',
    'V 300 d 4MATIC LONG',
    // Extra-long
    'V 250 d EXTRA-LONG',
    'V 300 d EXTRA-LONG'
  ],

  // EQA - Compact Electric SUV
  'EQA': [
    'EQA 250',
    'EQA 250+',
    'EQA 300 4MATIC',
    'EQA 350 4MATIC'
  ],

  // EQB - Compact Electric SUV (7-seater)
  'EQB': [
    'EQB 250',
    'EQB 250+',
    'EQB 300 4MATIC',
    'EQB 350 4MATIC'
  ],

  // EQC - Mid-size Electric SUV (being phased out)
  'EQC': [
    'EQC 400 4MATIC'
  ],

  // EQE - Executive Electric Sedan
  'EQE': [
    'EQE 300',
    'EQE 350',
    'EQE 350+',
    'EQE 500 4MATIC',
    'AMG EQE 43 4MATIC',
    'AMG EQE 53 4MATIC+'
  ],

  // EQE SUV - Executive Electric SUV
  'EQE SUV': [
    'EQE 300 SUV',
    'EQE 350 SUV 4MATIC',
    'EQE 350+ SUV 4MATIC',
    'EQE 500 SUV 4MATIC',
    'AMG EQE 43 SUV 4MATIC',
    'AMG EQE 53 SUV 4MATIC+'
  ],

  // EQS - Luxury Electric Sedan
  'EQS': [
    'EQS 350',
    'EQS 350+', // Extended range
    'EQS 450+',
    'EQS 500 4MATIC',
    'EQS 580 4MATIC',
    'AMG EQS 53 4MATIC+',
    // Maybach
    'Maybach EQS 680'
  ],

  // EQS SUV - Luxury Electric SUV
  'EQS SUV': [
    'EQS 450 SUV 4MATIC',
    'EQS 450+ SUV 4MATIC',
    'EQS 500 SUV 4MATIC',
    'EQS 580 SUV 4MATIC',
    'AMG EQS 53 SUV 4MATIC+',
    // Maybach
    'Maybach EQS 680 SUV 4MATIC'
  ],

  // EQV - Electric MPV/Van
  'EQV': [
    'EQV 250',
    'EQV 300',
    'EQV 300 LONG'
  ],

  // T-Class - Compact Van (New)
  'T-Class': [
    'T 160',
    'T 180',
    'T 200'
  ],

  // X-Class - Pickup Truck (discontinued but may be in market)
  'X-Class': [
    'X 220 d',
    'X 250 d 4MATIC',
    'X 350 d 4MATIC'
  ],

  // Citan - Small Van/MPV
  'Citan': [
    'Citan 108 CDI',
    'Citan 109 CDI',
    'Citan 111 CDI',
    // Tourer (passenger version)
    'Citan Tourer 108 CDI',
    'Citan Tourer 111 CDI'
  ]
};

// Combine Part 1 and Part 2 for complete Mercedes lineup
export const ALL_MERCEDES_EU_MODELS = {
  ...require('./MercedesBenz_EU_Complete').MERCEDES_BENZ_EU_MODELS,
  ...MERCEDES_BENZ_EU_MODELS_PART2
};

export default MERCEDES_BENZ_EU_MODELS_PART2;


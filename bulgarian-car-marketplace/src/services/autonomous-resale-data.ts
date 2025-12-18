// Bulgarian market data constants
export const BULGARIAN_MARKET_DATA = {
  depreciation: {
    '1_year': 0.15,  // 15% في السنة الأولى
    '2_years': 0.22, // 22% في السنتين
    '3_years': 0.28, // 28% في الثلاث سنوات
    '4_years': 0.33, // 33% في الأربع سنوات
    '5+_years': 0.40 // 40% بعد خمس سنوات
  },
  seasonalFactors: {
    'January': 0.95,
    'February': 0.98,
    'March': 1.05,
    'April': 1.08,
    'May': 1.12,
    'June': 1.10,
    'July': 1.02,
    'August': 0.95,
    'September': 1.03,
    'October': 1.08,
    'November': 1.05,
    'December': 0.98
  }
};

// Base market values for common Bulgarian market cars
export const BASE_MARKET_VALUES: { [key: string]: number } = {
  'VW Golf': 15000,
  'BMW 3 Series': 25000,
  'Mercedes C-Class': 28000,
  'Audi A4': 22000,
  'Skoda Octavia': 12000,
  'Opel Astra': 10000,
  'Ford Focus': 11000,
  'Toyota Corolla': 13000
};
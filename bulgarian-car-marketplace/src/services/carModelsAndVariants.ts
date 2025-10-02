// Car Models and Variants Database
// قاعدة بيانات الموديلات والفئات
// Advanced system with model variants for major brands
// EU Market Focus - 25+ brands with 2000+ variants

import GMC_MODELS_VARIANTS from './brandModels/GMC_models';
import OPEL_MODELS_VARIANTS from './brandModels/Opel_models';
import FORD_MODELS_VARIANTS from './brandModels/Ford_models';
import CHEVROLET_MODELS_VARIANTS from './brandModels/Chevrolet_models';
import { TESLA_MODELS_VARIANTS, JEEP_MODELS_VARIANTS, DODGE_MODELS_VARIANTS, CADILLAC_MODELS_VARIANTS } from './brandModels/AmericanBrands_Part2';
import MERCEDES_BENZ_EU_MODELS from './brandModels/MercedesBenz_EU_Complete';
import MERCEDES_BENZ_EU_MODELS_PART2 from './brandModels/MercedesBenz_EU_Part2';
import { VOLKSWAGEN_EU_MODELS, RENAULT_EU_MODELS, PEUGEOT_EU_MODELS } from './brandModels/European_Popular_Brands';
import { CITROEN_EU_MODELS, FIAT_EU_MODELS, SEAT_EU_MODELS, SKODA_EU_MODELS } from './brandModels/European_Brands_Part2';
import { TOYOTA_EU_MODELS, HONDA_EU_MODELS, NISSAN_EU_MODELS, MAZDA_EU_MODELS } from './brandModels/Japanese_Korean_Brands';
import { HYUNDAI_EU_MODELS, KIA_EU_MODELS, SUBARU_EU_MODELS, MITSUBISHI_EU_MODELS } from './brandModels/Korean_Brands_Complete';
import { PORSCHE_EU_MODELS, VOLVO_EU_MODELS } from './brandModels/Luxury_European_Brands';
import { JAGUAR_EU_MODELS, LAND_ROVER_EU_MODELS } from './brandModels/Luxury_European_Part2';
import { ALFA_ROMEO_EU_MODELS, MINI_EU_MODELS, ASTON_MARTIN_MODELS, BENTLEY_MODELS, ROLLS_ROYCE_MODELS, LANCIA_MODELS, DS_MODELS, CUPRA_MODELS } from './brandModels/Luxury_Brands_Part2';
import { LEXUS_EU_MODELS } from './brandModels/Japanese_Luxury_Complete';
import { FERRARI_MODELS, LAMBORGHINI_MODELS, MASERATI_EU_MODELS } from './brandModels/Italian_Sports_Part1';
import { INFINITI_MODELS, SUZUKI_EU_MODELS, GENESIS_MODELS, ISUZU_MODELS } from './brandModels/Japanese_Luxury_Complete';
import BYD_EU_MODELS from './brandModels/BYD_Complete';
import { MERCEDES_VANS, FORD_VANS, VW_VANS } from './brandModels/Commercial_Vans';

export interface CarVariant {
  name: string;
  engine?: string;
  power?: string;
  transmission?: string;
  drivetrain?: string;
  year?: string;
}

export interface CarModelWithVariants {
  baseModel: string;
  variants: string[];
}

// ============================================
// AUDI - Complete Models & Variants
// ============================================
const AUDI_MODELS_VARIANTS: Record<string, string[]> = {
  'A1': ['A1', 'S1', 'A1 Sportback'],
  'A3': ['A3', 'A3 Sedan', 'A3 Sportback', 'S3', 'S3 Sedan', 'S3 Sportback', 'RS3', 'RS3 Sedan', 'RS3 Sportback'],
  'A4': ['A4', 'A4 Avant', 'A4 Sedan', 'S4', 'S4 Avant', 'RS4', 'RS4 Avant'],
  'A5': ['A5', 'A5 Sportback', 'A5 Coupe', 'A5 Cabriolet', 'S5', 'S5 Sportback', 'S5 Coupe', 'RS5', 'RS5 Sportback'],
  'A6': ['A6', 'A6 Sedan', 'A6 Avant', 'A6 Sportback', 'A6 Allroad', 'S6', 'S6 Avant', 'RS6', 'RS6 Avant', 'A6 e-tron', 'A6 Sportback e-tron'],
  'A7': ['A7', 'A7 Sportback', 'S7', 'S7 Sportback', 'RS7', 'RS7 Sportback'],
  'A8': ['A8', 'A8 L', 'S8', 'S8 L'],
  'Q2': ['Q2', 'SQ2'],
  'Q3': ['Q3', 'Q3 Sportback', 'SQ3', 'RS Q3', 'RS Q3 Sportback'],
  'Q4 e-tron': ['Q4 e-tron', 'Q4 Sportback e-tron', 'SQ4 e-tron', 'SQ4 Sportback e-tron'],
  'Q5': ['Q5', 'Q5 Sportback', 'SQ5', 'SQ5 Sportback', 'RSQ5'],
  'Q6 e-tron': ['Q6 e-tron', 'Q6L e-tron', 'Q6 Sportback e-tron', 'SQ6 e-tron', 'SQ6 Sportback e-tron', 'Q6 e-tron quattro'],
  'Q7': ['Q7', 'SQ7'],
  'Q8': ['Q8', 'Q8 Sportback', 'SQ8', 'SQ8 Sportback', 'RS Q8', 'RS Q8 performance'],
  'e-tron': ['e-tron', 'e-tron Sportback', 'e-tron S', 'e-tron S Sportback', 'e-tron GT', 'S e-tron GT', 'RS e-tron GT', 'RS e-tron GT performance'],
  'TT': ['TT', 'TT Coupe', 'TT Roadster', 'TTS', 'TTS Coupe', 'TTS Roadster', 'TT RS'],
  'R8': ['R8', 'R8 Coupe', 'R8 Spyder', 'R8 V10', 'R8 V10 Plus']
};

// ============================================
// BMW - Complete Models & Variants
// ============================================
const BMW_MODELS_VARIANTS: Record<string, string[]> = {
  '1 Series': ['116i', '118i', '120i', '125i', '128ti', 'M135i'],
  '2 Series': ['218i', '220i', '225xe', '228i', 'M240i', 'M2', 'M2 Competition', 'M2 CS'],
  '3 Series': ['318i', '320i', '325i', '330i', '330e', '335i', 'M340i', 'M3', 'M3 Competition'],
  '4 Series': ['420i', '425i', '430i', '435i', '440i', 'M440i', 'M4', 'M4 Competition', 'M4 CSL'],
  '5 Series': ['520i', '525i', '530i', '530e', '540i', '545e', 'M550i', 'M5', 'M5 Competition'],
  '6 Series': ['630i', '640i', '650i', 'M6'],
  '7 Series': ['730i', '730Li', '740i', '740Li', '750i', '750Li', 'M760i'],
  '8 Series': ['840i', '840d', '850i', 'M850i', 'M8', 'M8 Competition'],
  'X1': ['sDrive18i', 'sDrive20i', 'xDrive20i', 'xDrive25i', 'xDrive28i'],
  'X2': ['sDrive18i', 'sDrive20i', 'xDrive20i', 'xDrive25i', 'M35i'],
  'X3': ['sDrive20i', 'xDrive20i', 'xDrive30i', 'xDrive30e', 'M40i', 'X3 M', 'X3 M Competition'],
  'X4': ['xDrive20i', 'xDrive30i', 'M40i', 'X4 M', 'X4 M Competition'],
  'X5': ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M50i', 'X5 M', 'X5 M Competition'],
  'X6': ['xDrive40i', 'xDrive50i', 'M50i', 'X6 M', 'X6 M Competition'],
  'X7': ['xDrive40i', 'xDrive50i', 'M50i', 'M60i'],
  'Z4': ['sDrive20i', 'sDrive30i', 'M40i'],
  'i3': ['i3', 'i3s'],
  'i4': ['i4 eDrive40', 'i4 M50'],
  'iX': ['iX xDrive40', 'iX xDrive50', 'iX M60'],
  'iX3': ['iX3']
};

// Mercedes-Benz: Merged EU Complete Data (Part 1 + Part 2 + Vans)
const MERCEDES_COMPLETE_EU = {
  ...MERCEDES_BENZ_EU_MODELS,
  ...MERCEDES_BENZ_EU_MODELS_PART2,
  ...MERCEDES_VANS
};

// Volkswagen: Merged EU + Vans
const VW_COMPLETE_EU = {
  ...VOLKSWAGEN_EU_MODELS,
  ...VW_VANS
};

// Ford: Merged with Vans
const FORD_COMPLETE = {
  ...FORD_MODELS_VARIANTS,
  ...FORD_VANS
};

// Export comprehensive model-variant mapping
// EU Market Focus - Complete Bulgarian Market Coverage
// 50+ Brands × 600+ Models × 3000+ Variants
export const BRAND_MODEL_VARIANTS: Record<string, Record<string, string[]>> = {
  // ========================================
  // FEATURED POPULAR BRANDS - الماركات الأكثر شيوعاً
  // (Shown first with special styling)
  // ========================================
  'Mercedes-Benz': MERCEDES_COMPLETE_EU, // #1 Luxury + Vans (Sprinter, Vito)
  'Volkswagen': VW_COMPLETE_EU, // #1 Volume + Vans (Transporter, Crafter)
  'BMW': BMW_MODELS_VARIANTS, // #2 Luxury
  'Toyota': TOYOTA_EU_MODELS, // Most Reliable
  'BYD': BYD_EU_MODELS, // Electric Leader
  
  // ========================================
  // Electric Focus Brands - تركيز كهربائي ⚡
  // ========================================
  'Tesla': TESLA_MODELS_VARIANTS, // ⚡ Pure Electric
  'Hyundai': HYUNDAI_EU_MODELS, // ⚡ Ioniq 5/6
  'Kia': KIA_EU_MODELS, // ⚡ EV6, EV9
  
  // ========================================
  // German Brands - باقي الماركات الألمانية
  // ========================================
  'Audi': AUDI_MODELS_VARIANTS,
  'Opel': OPEL_MODELS_VARIANTS,
  
  // ========================================
  // German Luxury - الماركات الألمانية الفاخرة (2)
  // ========================================
  'Porsche': PORSCHE_EU_MODELS, // ⭐ New! 911, Taycan, Cayenne
  'Mini': MINI_EU_MODELS, // ⭐ New! Cooper, Countryman
  
  // ========================================
  // French Brands - الماركات الفرنسية (4)
  // ========================================
  'Citroën': CITROEN_EU_MODELS,
  'DS': DS_MODELS, // ⭐ New! Premium French
  'Peugeot': PEUGEOT_EU_MODELS,
  'Renault': RENAULT_EU_MODELS,
  
  // ========================================
  // Italian Brands - الماركات الإيطالية (5)
  // ========================================
  'Alfa Romeo': ALFA_ROMEO_EU_MODELS, // ⭐ New! Giulia Quadrifoglio
  'Ferrari': FERRARI_MODELS, // ⭐ New! SF90, 296 GTB
  'Fiat': FIAT_EU_MODELS,
  'Lamborghini': LAMBORGHINI_MODELS, // ⭐ New! Huracán, Urus
  'Lancia': LANCIA_MODELS, // ⭐ New!
  'Maserati': MASERATI_EU_MODELS, // ⭐ New! Grecale, GranTurismo
  
  // ========================================
  // Spanish/Czech Brands - الماركات الإسبانية/التشيكية (3)
  // ========================================
  'Cupra': CUPRA_MODELS, // ⭐ New! Formentor VZ, Born
  'Seat': SEAT_EU_MODELS,
  'Skoda': SKODA_EU_MODELS,
  
  // ========================================
  // British Brands - الماركات البريطانية (5)
  // ========================================
  'Aston Martin': ASTON_MARTIN_MODELS, // ⭐ New! DBX, Vantage
  'Bentley': BENTLEY_MODELS, // ⭐ New! Continental GT, Bentayga
  'Jaguar': JAGUAR_EU_MODELS, // ⭐ New! F-Type, F-Pace
  'Land Rover': LAND_ROVER_EU_MODELS, // ⭐ New! Defender, Range Rover
  'Rolls-Royce': ROLLS_ROYCE_MODELS, // ⭐ New! Phantom, Cullinan
  
  // ========================================
  // Swedish Brands - الماركات السويدية (1)
  // ========================================
  'Volvo': VOLVO_EU_MODELS, // ⭐ New! XC90, V90, EX30
  
  // ========================================
  // Japanese Brands - الماركات اليابانية (7)
  // ========================================
  'Honda': HONDA_EU_MODELS,
  'Infiniti': INFINITI_MODELS, // ⭐ New! Q50, QX50
  'Isuzu': ISUZU_MODELS, // ⭐ New! D-Max
  'Lexus': LEXUS_EU_MODELS, // ⭐ New! RX, NX, ES
  'Mazda': MAZDA_EU_MODELS,
  'Mitsubishi': MITSUBISHI_EU_MODELS,
  'Nissan': NISSAN_EU_MODELS,
  'Subaru': SUBARU_EU_MODELS,
  'Suzuki': SUZUKI_EU_MODELS, // ⭐ New! Swift, Vitara, Jimny
  
  // ========================================
  // Korean Brands - الماركات الكورية (1)
  // ========================================
  'Genesis': GENESIS_MODELS, // ⭐ New! GV70, GV80
  
  // ========================================
  // American Brands - الماركات الأمريكية (6)
  // ========================================
  'Cadillac': CADILLAC_MODELS_VARIANTS,
  'Chevrolet': CHEVROLET_MODELS_VARIANTS,
  'Dodge': DODGE_MODELS_VARIANTS,
  'Ford': FORD_COMPLETE, // With Transit vans
  'GMC': GMC_MODELS_VARIANTS,
  'Jeep': JEEP_MODELS_VARIANTS
};

/**
 * Get base models for a brand
 */
export const getBaseModels = (brand: string): string[] => {
  if (BRAND_MODEL_VARIANTS[brand]) {
    return Object.keys(BRAND_MODEL_VARIANTS[brand]).sort();
  }
  return [];
};

/**
 * Get variants for a specific model of a brand
 */
export const getModelVariants = (brand: string, baseModel: string): string[] => {
  if (BRAND_MODEL_VARIANTS[brand] && BRAND_MODEL_VARIANTS[brand][baseModel]) {
    return BRAND_MODEL_VARIANTS[brand][baseModel];
  }
  return [];
};

/**
 * Check if a brand has detailed variant data
 */
export const hasVariantData = (brand: string): boolean => {
  return brand in BRAND_MODEL_VARIANTS;
};

const CarModelsAndVariants = {
  getBaseModels,
  getModelVariants,
  hasVariantData,
  BRAND_MODEL_VARIANTS
};

export default CarModelsAndVariants;


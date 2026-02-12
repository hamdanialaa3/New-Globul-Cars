/**
 * Bulgarian Synonyms Service - خدمة المرادفات البلغارية
 * Supports Cyrillic ↔ Latin conversion for car search
 * 
 * Features:
 * - 50+ synonym groups covering all major car-related terms
 * - Cyrillic (Bulgarian) to Latin (English) translation
 * - Case-insensitive matching
 * - O(1) lookup performance using Map structures
 * 
 * @since December 2025
 */

import { logger } from '../logger-service';

export interface SynonymGroup {
  canonical: string;      // الكلمة القياسية (e.g., "BMW")
  synonyms: string[];     // المرادفات (e.g., ["бмв", "БМВ", "bmw"])
  category: 'make' | 'fuel' | 'transmission' | 'bodyType' | 'color' | 'feature' | 'condition';
}

// 🇧🇬 BULGARIAN CAR MARKET SYNONYMS DATABASE
const bulgarianSynonyms: SynonymGroup[] = [
  // === CAR MAKES (20+ Brands) ===
  { canonical: 'BMW', synonyms: ['бмв', 'БМВ', 'bmw', 'бийемдабълю'], category: 'make' },
  { canonical: 'Mercedes', synonyms: ['мерцедес', 'мерц', 'бенц', 'mercedes', 'merc'], category: 'make' },
  { canonical: 'Audi', synonyms: ['ауди', 'audi'], category: 'make' },
  { canonical: 'Volkswagen', synonyms: ['фолксваген', 'vw', 'фв', 'volkswagen', 'фолкс'], category: 'make' },
  { canonical: 'Opel', synonyms: ['опел', 'opel'], category: 'make' },
  { canonical: 'Toyota', synonyms: ['тойота', 'toyota'], category: 'make' },
  { canonical: 'Honda', synonyms: ['хонда', 'honda'], category: 'make' },
  { canonical: 'Ford', synonyms: ['форд', 'ford'], category: 'make' },
  { canonical: 'Renault', synonyms: ['рено', 'renault'], category: 'make' },
  { canonical: 'Peugeot', synonyms: ['пежо', 'peugeot'], category: 'make' },
  { canonical: 'Citroen', synonyms: ['ситроен', 'citroen'], category: 'make' },
  { canonical: 'Skoda', synonyms: ['шкода', 'skoda', 'škoda'], category: 'make' },
  { canonical: 'Fiat', synonyms: ['фиат', 'fiat'], category: 'make' },
  { canonical: 'Mazda', synonyms: ['мазда', 'mazda'], category: 'make' },
  { canonical: 'Nissan', synonyms: ['нисан', 'nissan'], category: 'make' },
  { canonical: 'Hyundai', synonyms: ['хюндай', 'хюндаи', 'hyundai'], category: 'make' },
  { canonical: 'Kia', synonyms: ['киа', 'kia'], category: 'make' },
  { canonical: 'Dacia', synonyms: ['дачия', 'dacia'], category: 'make' },
  { canonical: 'Suzuki', synonyms: ['сузуки', 'suzuki'], category: 'make' },
  { canonical: 'Subaru', synonyms: ['субару', 'subaru'], category: 'make' },
  { canonical: 'Lexus', synonyms: ['лексус', 'lexus'], category: 'make' },
  { canonical: 'Volvo', synonyms: ['волво', 'volvo'], category: 'make' },
  { canonical: 'Seat', synonyms: ['сеат', 'seat'], category: 'make' },

  // === FUEL TYPES ===
  { canonical: 'Diesel', synonyms: ['дизел', 'дизелов', 'diesel', 'дизелова'], category: 'fuel' },
  { canonical: 'Petrol', synonyms: ['бензин', 'бензинов', 'petrol', 'gasoline', 'бензинова'], category: 'fuel' },
  { canonical: 'Electric', synonyms: ['електрически', 'електро', 'electric', 'EV', 'електрическа'], category: 'fuel' },
  { canonical: 'Hybrid', synonyms: ['хибрид', 'хибриден', 'hybrid', 'хибридна'], category: 'fuel' },
  { canonical: 'LPG', synonyms: ['газ', 'lpg', 'газова', 'газ-бензин'], category: 'fuel' },
  { canonical: 'CNG', synonyms: ['метан', 'cng', 'метанова'], category: 'fuel' },

  // === TRANSMISSION ===
  { canonical: 'Automatic', synonyms: ['автоматик', 'автомат', 'автоматична', 'automatic', 'авт'], category: 'transmission' },
  { canonical: 'Manual', synonyms: ['ръчна', 'мануална', 'manual', 'ръчна скорост'], category: 'transmission' },
  { canonical: 'Semi-Automatic', synonyms: ['полуавтоматична', 'semi-auto', 'semiautomatic', 'полуавтомат'], category: 'transmission' },

  // === BODY TYPES ===
  { canonical: 'SUV', synonyms: ['джип', 'suv', 'offroad', 'терен', 'кросоувър', 'crossover'], category: 'bodyType' },
  { canonical: 'Sedan', synonyms: ['седан', 'sedan', 'седан купе'], category: 'bodyType' },
  { canonical: 'Hatchback', synonyms: ['хечбек', 'hatchback', 'хеч', 'хечбак'], category: 'bodyType' },
  { canonical: 'Estate', synonyms: ['комби', 'estate', 'универсал', 'wagon', 'караван'], category: 'bodyType' },
  { canonical: 'Van', synonyms: ['ван', 'van', 'микробус', 'фургон'], category: 'bodyType' },
  { canonical: 'Coupe', synonyms: ['купе', 'coupe', 'купето'], category: 'bodyType' },
  { canonical: 'Convertible', synonyms: ['кабриолет', 'convertible', 'откритa', 'кабрио'], category: 'bodyType' },
  { canonical: 'Pickup', synonyms: ['пикап', 'pickup', 'бордови'], category: 'bodyType' },
  { canonical: 'Minivan', synonyms: ['миниван', 'minivan', 'семейна кола'], category: 'bodyType' },

  // === COLORS ===
  { canonical: 'Black', synonyms: ['черен', 'черна', 'black', 'черно'], category: 'color' },
  { canonical: 'White', synonyms: ['бял', 'бяла', 'white', 'бяло'], category: 'color' },
  { canonical: 'Silver', synonyms: ['сребърен', 'сребриста', 'silver', 'сребристо'], category: 'color' },
  { canonical: 'Gray', synonyms: ['сив', 'сива', 'gray', 'grey', 'сиво'], category: 'color' },
  { canonical: 'Blue', synonyms: ['син', 'синя', 'blue', 'синьо'], category: 'color' },
  { canonical: 'Red', synonyms: ['червен', 'червена', 'red', 'червено'], category: 'color' },
  { canonical: 'Green', synonyms: ['зелен', 'зелена', 'green', 'зелено'], category: 'color' },
  { canonical: 'Yellow', synonyms: ['жълт', 'жълта', 'yellow', 'жълто'], category: 'color' },
  { canonical: 'Brown', synonyms: ['кафяв', 'кафява', 'brown', 'кафяво'], category: 'color' },
  { canonical: 'Orange', synonyms: ['оранжев', 'оранжева', 'orange', 'оранжево'], category: 'color' },
  { canonical: 'Beige', synonyms: ['бежов', 'бежова', 'beige', 'бежово'], category: 'color' },
  { canonical: 'Gold', synonyms: ['златен', 'златна', 'gold', 'златно'], category: 'color' },

  // === FEATURES ===
  { canonical: 'Navigation', synonyms: ['навигация', 'navigation', 'gps', 'навигатор'], category: 'feature' },
  { canonical: 'Leather', synonyms: ['кожа', 'кожени', 'leather', 'кожен салон'], category: 'feature' },
  { canonical: 'Sunroof', synonyms: ['панорама', 'покривен', 'sunroof', 'panoramic', 'панорамен покрив'], category: 'feature' },
  { canonical: 'Parking Sensors', synonyms: ['сензори', 'parking sensors', 'парк-сензори', 'паркинг сензори'], category: 'feature' },
  { canonical: 'Cruise Control', synonyms: ['темпомат', 'cruise control', 'круиз контрол'], category: 'feature' },
  { canonical: 'Heated Seats', synonyms: ['отопляеми', 'heated seats', 'отопление на седалки'], category: 'feature' },

  // === CONDITION ===
  { canonical: 'New', synonyms: ['нов', 'нова', 'ново', 'new', 'нови'], category: 'condition' },
  { canonical: 'Used', synonyms: ['употребяван', 'втора ръка', 'used', 'second-hand', 'употребявана', 'б/у'], category: 'condition' },
  { canonical: 'Excellent', synonyms: ['отлично', 'перфектно', 'excellent', 'отлична'], category: 'condition' },
  { canonical: 'Good', synonyms: ['добро', 'good', 'добра'], category: 'condition' },
  { canonical: 'Fair', synonyms: ['средно', 'fair', 'средна'], category: 'condition' },

  // === CAR MODELS (Popular Models) ===
  // Audi Models
  { canonical: 'A1', synonyms: ['a1', 'ауди а1', 'audi a1', 'а1'], category: 'make' },
  { canonical: 'A3', synonyms: ['a3', 'ауди а3', 'audi a3', 'а3'], category: 'make' },
  { canonical: 'A4', synonyms: ['a4', 'ауди а4', 'audi a4', 'а4'], category: 'make' },
  { canonical: 'A5', synonyms: ['a5', 'ауди а5', 'audi a5', 'а5'], category: 'make' },
  { canonical: 'A6', synonyms: ['a6', 'ауди а6', 'audi a6', 'а6'], category: 'make' },
  { canonical: 'A7', synonyms: ['a7', 'ауди а7', 'audi a7', 'а7'], category: 'make' },
  { canonical: 'A8', synonyms: ['a8', 'ауди а8', 'audi a8', 'а8'], category: 'make' },
  { canonical: 'Q2', synonyms: ['q2', 'ауди q2', 'audi q2', 'кю2'], category: 'make' },
  { canonical: 'Q3', synonyms: ['q3', 'ауди q3', 'audi q3', 'кю3'], category: 'make' },
  { canonical: 'Q5', synonyms: ['q5', 'ауди q5', 'audi q5', 'кю5'], category: 'make' },
  { canonical: 'Q7', synonyms: ['q7', 'ауди q7', 'audi q7', 'кю7'], category: 'make' },
  { canonical: 'Q8', synonyms: ['q8', 'ауди q8', 'audi q8', 'кю8'], category: 'make' },
  { canonical: 'TT', synonyms: ['tt', 'ауди tt', 'audi tt', 'тт'], category: 'make' },
  { canonical: 'R8', synonyms: ['r8', 'ауди r8', 'audi r8', 'р8'], category: 'make' },
  { canonical: 'S3', synonyms: ['s3', 'ауди s3', 'audi s3', 'с3'], category: 'make' },
  { canonical: 'S4', synonyms: ['s4', 'ауди s4', 'audi s4', 'с4'], category: 'make' },
  { canonical: 'S5', synonyms: ['s5', 'ауди s5', 'audi s5', 'с5'], category: 'make' },
  { canonical: 'RS3', synonyms: ['rs3', 'ауди rs3', 'audi rs3', 'рс3'], category: 'make' },
  { canonical: 'RS4', synonyms: ['rs4', 'ауди rs4', 'audi rs4', 'рс4'], category: 'make' },
  { canonical: 'RS6', synonyms: ['rs6', 'ауди rs6', 'audi rs6', 'рс6'], category: 'make' },

  // BMW Models
  { canonical: '116', synonyms: ['116', '116i', 'бмв 116', 'bmw 116', '116и'], category: 'make' },
  { canonical: '118', synonyms: ['118', '118i', 'бмв 118', 'bmw 118', '118и'], category: 'make' },
  { canonical: '120', synonyms: ['120', '120i', 'бмв 120', 'bmw 120', '120и'], category: 'make' },
  { canonical: '316', synonyms: ['316', '316i', 'бмв 316', 'bmw 316', '316и'], category: 'make' },
  { canonical: '318', synonyms: ['318', '318i', 'бмв 318', 'bmw 318', '318и'], category: 'make' },
  { canonical: '320', synonyms: ['320', '320i', '320d', 'бмв 320', 'bmw 320', '320и'], category: 'make' },
  { canonical: '325', synonyms: ['325', '325i', 'бмв 325', 'bmw 325', '325и'], category: 'make' },
  { canonical: '330', synonyms: ['330', '330i', '330d', 'бмв 330', 'bmw 330', '330и'], category: 'make' },
  { canonical: '520', synonyms: ['520', '520i', '520d', 'бмв 520', 'bmw 520', '520и'], category: 'make' },
  { canonical: '525', synonyms: ['525', '525i', '525d', 'бмв 525', 'bmw 525', '525и'], category: 'make' },
  { canonical: '530', synonyms: ['530', '530i', '530d', 'бмв 530', 'bmw 530', '530и'], category: 'make' },
  { canonical: '535', synonyms: ['535', '535i', '535d', 'бмв 535', 'bmw 535', '535и'], category: 'make' },
  { canonical: '540', synonyms: ['540', '540i', 'бмв 540', 'bmw 540', '540и'], category: 'make' },
  { canonical: '730', synonyms: ['730', '730i', '730d', 'бмв 730', 'bmw 730', '730и'], category: 'make' },
  { canonical: '740', synonyms: ['740', '740i', '740d', 'бмв 740', 'bmw 740', '740и'], category: 'make' },
  { canonical: '750', synonyms: ['750', '750i', 'бмв 750', 'bmw 750', '750и'], category: 'make' },
  { canonical: 'X1', synonyms: ['x1', 'бмв x1', 'bmw x1', 'икс1'], category: 'make' },
  { canonical: 'X3', synonyms: ['x3', 'бмв x3', 'bmw x3', 'икс3'], category: 'make' },
  { canonical: 'X5', synonyms: ['x5', 'бмв x5', 'bmw x5', 'икс5'], category: 'make' },
  { canonical: 'X6', synonyms: ['x6', 'бмв x6', 'bmw x6', 'икс6'], category: 'make' },
  { canonical: 'X7', synonyms: ['x7', 'бмв x7', 'bmw x7', 'икс7'], category: 'make' },
  { canonical: 'M3', synonyms: ['m3', 'бмв m3', 'bmw m3', 'м3'], category: 'make' },
  { canonical: 'M5', synonyms: ['m5', 'бмв m5', 'bmw m5', 'м5'], category: 'make' },
  { canonical: 'Z4', synonyms: ['z4', 'бмв z4', 'bmw z4', 'з4'], category: 'make' },

  // Mercedes Models
  { canonical: 'A160', synonyms: ['a160', 'а160', 'мерцедес a160', 'mercedes a160'], category: 'make' },
  { canonical: 'A180', synonyms: ['a180', 'а180', 'мерцедес a180', 'mercedes a180'], category: 'make' },
  { canonical: 'A200', synonyms: ['a200', 'а200', 'мерцедес a200', 'mercedes a200'], category: 'make' },
  { canonical: 'C180', synonyms: ['c180', 'ц180', 'с180', 'мерцедес c180', 'mercedes c180'], category: 'make' },
  { canonical: 'C200', synonyms: ['c200', 'ц200', 'с200', 'мерцедес c200', 'mercedes c200'], category: 'make' },
  { canonical: 'C220', synonyms: ['c220', 'ц220', 'с220', 'мерцедес c220', 'mercedes c220'], category: 'make' },
  { canonical: 'C230', synonyms: ['c230', 'ц230', 'с230', 'мерцедес c230', 'mercedes c230'], category: 'make' },
  { canonical: 'C250', synonyms: ['c250', 'ц250', 'с250', 'мерцедес c250', 'mercedes c250'], category: 'make' },
  { canonical: 'C300', synonyms: ['c300', 'ц300', 'с300', 'мерцедес c300', 'mercedes c300'], category: 'make' },
  { canonical: 'C320', synonyms: ['c320', 'ц320', 'с320', 'мерцедес c320', 'mercedes c320'], category: 'make' },
  { canonical: 'E200', synonyms: ['e200', 'е200', 'ие200', 'мерцедес e200', 'mercedes e200'], category: 'make' },
  { canonical: 'E220', synonyms: ['e220', 'е220', 'ие220', 'мерцедес e220', 'mercedes e220'], category: 'make' },
  { canonical: 'E250', synonyms: ['e250', 'е250', 'ие250', 'мерцедес e250', 'mercedes e250'], category: 'make' },
  { canonical: 'E280', synonyms: ['e280', 'е280', 'ие280', 'мерцедес e280', 'mercedes e280'], category: 'make' },
  { canonical: 'E300', synonyms: ['e300', 'е300', 'ие300', 'мерцедес e300', 'mercedes e300'], category: 'make' },
  { canonical: 'E320', synonyms: ['e320', 'е320', 'ие320', 'мерцедес e320', 'mercedes e320'], category: 'make' },
  { canonical: 'S280', synonyms: ['s280', 'с280', 'ес280', 'мерцедес s280', 'mercedes s280'], category: 'make' },
  { canonical: 'S300', synonyms: ['s300', 'с300', 'ес300', 'мерцедес s300', 'mercedes s300'], category: 'make' },
  { canonical: 'S320', synonyms: ['s320', 'с320', 'ес320', 'мерцедес s320', 'mercedes s320'], category: 'make' },
  { canonical: 'S350', synonyms: ['s350', 'с350', 'ес350', 'мерцедес s350', 'mercedes s350'], category: 'make' },
  { canonical: 'S400', synonyms: ['s400', 'с400', 'ес400', 'мерцедес s400', 'mercedes s400'], category: 'make' },
  { canonical: 'S500', synonyms: ['s500', 'с500', 'ес500', 'мерцедес s500', 'mercedes s500'], category: 'make' },
  { canonical: 'GLA', synonyms: ['gla', 'гла', 'джила', 'мерцедес gla', 'mercedes gla'], category: 'make' },
  { canonical: 'GLB', synonyms: ['glb', 'глб', 'джилб', 'мерцедес glb', 'mercedes glb'], category: 'make' },
  { canonical: 'GLC', synonyms: ['glc', 'глц', 'джилц', 'мерцедес glc', 'mercedes glc'], category: 'make' },
  { canonical: 'GLE', synonyms: ['gle', 'гле', 'джиле', 'мерцедес gle', 'mercedes gle'], category: 'make' },
  { canonical: 'GLS', synonyms: ['gls', 'глс', 'джилс', 'мерцедес gls', 'mercedes gls'], category: 'make' },
  { canonical: 'CLA', synonyms: ['cla', 'цла', 'сла', 'мерцедес cla', 'mercedes cla'], category: 'make' },
  { canonical: 'CLS', synonyms: ['cls', 'цлс', 'слс', 'мерцедес cls', 'mercedes cls'], category: 'make' },
  { canonical: 'AMG', synonyms: ['amg', 'амг', 'амже', 'мерцедес amg', 'mercedes amg'], category: 'make' },

  // VW Models
  { canonical: 'Golf', synonyms: ['golf', 'голф', 'гол ф', 'vw golf', 'фолксваген голф'], category: 'make' },
  { canonical: 'Polo', synonyms: ['polo', 'поло', 'vw polo', 'фолксваген поло'], category: 'make' },
  { canonical: 'Passat', synonyms: ['passat', 'пасат', 'vw passat', 'фолксваген пасат'], category: 'make' },
  { canonical: 'Jetta', synonyms: ['jetta', 'джета', 'vw jetta', 'фолксваген джета'], category: 'make' },
  { canonical: 'Tiguan', synonyms: ['tiguan', 'тигуан', 'vw tiguan', 'фолксваген тигуан'], category: 'make' },
  { canonical: 'Touareg', synonyms: ['touareg', 'туарег', 'vw touareg', 'фолксваген туарег'], category: 'make' },
  { canonical: 'Touran', synonyms: ['touran', 'тоуран', 'vw touran', 'фолксваген тоуран'], category: 'make' },
  { canonical: 'Caddy', synonyms: ['caddy', 'кади', 'vw caddy', 'фолксваген кади'], category: 'make' },
  { canonical: 'T-Roc', synonyms: ['t-roc', 'трок', 'vw t-roc', 'фолксваген трок'], category: 'make' },
  { canonical: 'Arteon', synonyms: ['arteon', 'артеон', 'vw arteon', 'фолксваген артеон'], category: 'make' },

  // Toyota Models
  { canonical: 'Corolla', synonyms: ['corolla', 'корола', 'toyota corolla', 'тойота корола'], category: 'make' },
  { canonical: 'Camry', synonyms: ['camry', 'камри', 'toyota camry', 'тойота камри'], category: 'make' },
  { canonical: 'Yaris', synonyms: ['yaris', 'ярис', 'toyota yaris', 'тойота ярис'], category: 'make' },
  { canonical: 'RAV4', synonyms: ['rav4', 'рав4', 'toyota rav4', 'тойота рав4'], category: 'make' },
  { canonical: 'Land Cruiser', synonyms: ['land cruiser', 'ленд крузер', 'лендкрузер', 'toyota land cruiser'], category: 'make' },
  { canonical: 'Hilux', synonyms: ['hilux', 'хайлукс', 'toyota hilux', 'тойота хайлукс'], category: 'make' },
  { canonical: 'Prius', synonyms: ['prius', 'приус', 'toyota prius', 'тойота приус'], category: 'make' },
  { canonical: 'Avensis', synonyms: ['avensis', 'авенсис', 'toyota avensis', 'тойота авенсис'], category: 'make' },
  { canonical: 'Auris', synonyms: ['auris', 'аурис', 'toyota auris', 'тойота аурис'], category: 'make' },
  { canonical: 'C-HR', synonyms: ['c-hr', 'chr', 'цхр', 'toyota c-hr', 'тойота цхр'], category: 'make' },

  // Ford Models
  { canonical: 'Focus', synonyms: ['focus', 'фокус', 'ford focus', 'форд фокус'], category: 'make' },
  { canonical: 'Fiesta', synonyms: ['fiesta', 'фиеста', 'ford fiesta', 'форд фиеста'], category: 'make' },
  { canonical: 'Mondeo', synonyms: ['mondeo', 'мондео', 'ford mondeo', 'форд мондео'], category: 'make' },
  { canonical: 'Mustang', synonyms: ['mustang', 'мустанг', 'ford mustang', 'форд мустанг'], category: 'make' },
  { canonical: 'Kuga', synonyms: ['kuga', 'куга', 'ford kuga', 'форд куга'], category: 'make' },
  { canonical: 'Explorer', synonyms: ['explorer', 'експлорър', 'ford explorer', 'форд експлорър'], category: 'make' },
  { canonical: 'Ranger', synonyms: ['ranger', 'рейнджър', 'ford ranger', 'форд рейнджър'], category: 'make' },

  // Opel Models
  { canonical: 'Astra', synonyms: ['astra', 'астра', 'opel astra', 'опел астра'], category: 'make' },
  { canonical: 'Corsa', synonyms: ['corsa', 'корса', 'opel corsa', 'опел корса'], category: 'make' },
  { canonical: 'Insignia', synonyms: ['insignia', 'инсигния', 'opel insignia', 'опел инсигния'], category: 'make' },
  { canonical: 'Vectra', synonyms: ['vectra', 'вектра', 'opel vectra', 'опел вектра'], category: 'make' },
  { canonical: 'Mokka', synonyms: ['mokka', 'мока', 'opel mokka', 'опел мока'], category: 'make' },
  { canonical: 'Zafira', synonyms: ['zafira', 'зафира', 'opel zafira', 'опел зафира'], category: 'make' }
];

class BulgarianSynonymsService {
  private static instance: BulgarianSynonymsService;
  private synonymMap: Map<string, string>;        // synonym → canonical (fast O(1) lookup)
  private reverseMap: Map<string, string[]>;      // canonical → all synonyms

  private constructor() {
    this.synonymMap = new Map();
    this.reverseMap = new Map();
    this.buildMaps();
    logger.info('✅ Bulgarian Synonyms Service initialized', {
      totalGroups: bulgarianSynonyms.length,
      totalSynonyms: this.synonymMap.size
    });
  }

  static getInstance(): BulgarianSynonymsService {
    if (!this.instance) {
      this.instance = new BulgarianSynonymsService();
    }
    return this.instance;
  }

  /**
   * Build fast lookup maps (O(1) access)
   */
  private buildMaps(): void {
    bulgarianSynonyms.forEach(group => {
      // Store canonical → all synonyms
      this.reverseMap.set(group.canonical.toLowerCase(), group.synonyms.map(s => s.toLowerCase()));

      // Store each synonym → canonical
      group.synonyms.forEach(synonym => {
        this.synonymMap.set(synonym.toLowerCase(), group.canonical);
      });

      // Also map canonical to itself
      this.synonymMap.set(group.canonical.toLowerCase(), group.canonical);
    });
  }

  /**
   * Normalize query (lowercase, trim, remove special chars except Bulgarian)
   */
  normalize(query: string): string {
    return query.toLowerCase().trim().replace(/[^\u0400-\u04FFa-z0-9\s-]/gi, ' ');
  }

  /**
   * Expand query with all synonym variants
   * مثال: "мерцедес дизел" → ["mercedes", "diesel", "мерцедес", "мерц", "дизел", ...]
   */
  expandQuery(query: string): string[] {
    const normalized = this.normalize(query);
    const words = normalized.split(/\s+/);
    const expanded: Set<string> = new Set();

    words.forEach(word => {
      // Add original word
      expanded.add(word);

      // Get canonical form
      const canonical = this.synonymMap.get(word);
      if (canonical) {
        // Add canonical
        expanded.add(canonical.toLowerCase());

        // Add all synonyms of canonical
        const synonyms = this.reverseMap.get(canonical.toLowerCase());
        if (synonyms) {
          synonyms.forEach(syn => expanded.add(syn));
        }
      }
    });

    return Array.from(expanded);
  }

  /**
   * Get canonical form (e.g., "бмв" → "BMW")
   */
  getCanonical(word: string): string | null {
    return this.synonymMap.get(word.toLowerCase()) || null;
  }

  /**
   * Get all synonyms for a canonical word
   */
  getSynonyms(canonical: string): string[] {
    return this.reverseMap.get(canonical.toLowerCase()) || [];
  }

  /**
   * Translate Bulgarian query to English
   * "мерцедес дизел София" → "Mercedes diesel Sofia"
   */
  translateToEnglish(bulgarianQuery: string): string {
    const normalized = this.normalize(bulgarianQuery);
    const words = normalized.split(/\s+/);
    
    const translated = words.map(word => {
      const canonical = this.synonymMap.get(word);
      return canonical || word; // Use canonical if found, otherwise keep original
    });

    return translated.join(' ');
  }

  /**
   * Check if a word is Bulgarian (Cyrillic)
   */
  isCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  /**
   * Get statistics about synonym coverage
   */
  getStats() {
    const byCategory: Record<string, number> = {};
    bulgarianSynonyms.forEach(group => {
      byCategory[group.category] = (byCategory[group.category] || 0) + 1;
    });

    return {
      totalGroups: bulgarianSynonyms.length,
      totalSynonyms: this.synonymMap.size,
      byCategory,
      coverage: {
        makes: byCategory.make || 0,
        fuelTypes: byCategory.fuel || 0,
        transmissions: byCategory.transmission || 0,
        bodyTypes: byCategory.bodyType || 0,
        colors: byCategory.color || 0,
        features: byCategory.feature || 0,
        conditions: byCategory.condition || 0
      }
    };
  }
}

export const bulgarianSynonymsService = BulgarianSynonymsService.getInstance();
export default bulgarianSynonymsService;

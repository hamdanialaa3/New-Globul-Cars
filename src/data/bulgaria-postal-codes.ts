// Bulgaria Postal Codes and Streets Data
// بيانات أرقام البريد والشوارع في بلغاريا

export interface PostalCodeData {
  code: string; // 4-digit postal code
  district?: string; // District name (e.g., "Център", "Младост")
  streets?: string[]; // Major streets in this postal code area
}

export interface CityPostalData {
  cityName: string;
  cityNameEn: string;
  postalCodes: PostalCodeData[];
}

export interface RegionPostalData {
  regionName: string;
  regionNameEn: string;
  cities: CityPostalData[];
}

// Major streets for Sofia (София)
const SOFIA_STREETS: Record<string, string[]> = {
  '1000': ['бул. Витоша', 'бул. Цариградско шосе', 'ул. Граф Игнатиев', 'ул. Раковска', 'ул. Цар Освободител', 'ул. Шипка', 'ул. Пиротска', 'ул. Мария Луиза', 'ул. Славянска', 'ул. Княз Борис I'],
  '1001': ['бул. Витоша', 'ул. Цар Освободител', 'ул. Шипка', 'ул. Граф Игнатиев'],
  '1002': ['бул. Витоша', 'ул. Цар Освободител', 'ул. Шипка'],
  '1003': ['бул. Витоша', 'ул. Цар Освободител'],
  '1004': ['бул. Витоша', 'ул. Цар Освободител'],
  '1005': ['бул. Витоша', 'ул. Цар Освободител'],
  '1006': ['бул. Витоша', 'ул. Цар Освободител'],
  '1007': ['бул. Витоша', 'ул. Цар Освободител'],
  '1008': ['бул. Витоша', 'ул. Цар Освободител'],
  '1009': ['бул. Витоша', 'ул. Цар Освободител'],
  '1010': ['бул. Витоша', 'ул. Цар Освободител'],
  '1111': ['бул. Цариградско шосе', 'ул. Младост', 'ул. Драган Цанков'],
  '1112': ['бул. Цариградско шосе', 'ул. Младост'],
  '1113': ['бул. Цариградско шосе', 'ул. Младост'],
  '1124': ['бул. Цариградско шосе', 'ул. Младост'],
  '1125': ['бул. Цариградско шосе', 'ул. Младост'],
  '1301': ['бул. Цариградско шосе', 'ул. Младост'],
  '1302': ['бул. Цариградско шосе', 'ул. Младост'],
  '1303': ['бул. Цариградско шосе', 'ул. Младост'],
  '1309': ['бул. Цариградско шосе', 'ул. Младост'],
  '1404': ['бул. Цариградско шосе', 'ул. Младост'],
  '1407': ['бул. Цариградско шосе', 'ул. Младост'],
  '1408': ['бул. Цариградско шосе', 'ул. Младост'],
  '1612': ['бул. Цариградско шосе', 'ул. Младост'],
  '1618': ['бул. Цариградско шосе', 'ул. Младост'],
  '1700': ['бул. Цариградско шосе', 'ул. Младост'],
  '1711': ['бул. Цариградско шосе', 'ул. Младост'],
  '1712': ['бул. Цариградско шосе', 'ул. Младост'],
  '1715': ['бул. Цариградско шосе', 'ул. Младост'],
  '1720': ['бул. Цариградско шосе', 'ул. Младост'],
  '1750': ['бул. Цариградско шосе', 'ул. Младост'],
  '1756': ['бул. Цариградско шосе', 'ул. Младост'],
  '1766': ['бул. Цариградско шосе', 'ул. Младост'],
};

// Major streets for Plovdiv (Пловдив)
const PLOVDIV_STREETS: Record<string, string[]> = {
  '4000': ['ул. Главна', 'ул. Марица', 'ул. Цар Борис III', 'ул. Димитър Пешев', 'ул. Христо Г. Данов', 'ул. Георги Бенковски', 'ул. Иван Вазов', 'ул. Стефан Стамболов', 'ул. Цар Симеон', 'ул. Македония'],
  '4001': ['ул. Главна', 'ул. Марица'],
  '4002': ['ул. Главна', 'ул. Марица'],
  '4003': ['ул. Главна', 'ул. Марица'],
  '4004': ['ул. Главна', 'ул. Марица'],
};

// Major streets for Varna (Варна)
const VARNA_STREETS: Record<string, string[]> = {
  '9000': ['бул. Княз Борис I', 'бул. Сливница', 'ул. Драган Цанков', 'ул. Стефан Караджа', 'ул. Мусала', 'ул. Преслав', 'ул. Хан Крум', 'ул. Цар Симеон', 'ул. България', 'ул. Черно море'],
  '9001': ['бул. Княз Борис I', 'бул. Сливница'],
  '9002': ['бул. Княз Борис I', 'бул. Сливница'],
  '9003': ['бул. Княз Борис I', 'бул. Сливница'],
  '9004': ['бул. Княз Борис I', 'бул. Сливница'],
  '9005': ['бул. Княз Борис I', 'бул. Сливница'],
  '9006': ['бул. Княз Борис I', 'бул. Сливница'],
  '9007': ['бул. Княз Борис I', 'бул. Сливница'],
  '9008': ['бул. Княз Борис I', 'бул. Сливница'],
  '9009': ['бул. Княз Борис I', 'бул. Сливница'],
};

// Major streets for Burgas (Бургас)
const BURGAS_STREETS: Record<string, string[]> = {
  '8000': ['бул. Александровска', 'ул. Цар Симеон', 'ул. България', 'ул. Демокрация', 'ул. Свобода', 'ул. Независимост', 'ул. Черно море', 'ул. Първи май', 'ул. Георги Димитров', 'ул. Христо Ботев'],
  '8001': ['бул. Александровска', 'ул. Цар Симеон'],
  '8002': ['бул. Александровска', 'ул. Цар Симеон'],
};

// Helper function to get postal codes for a city
export const getPostalCodesForCity = (cityName: string, regionName: string): PostalCodeData[] => {
  // Sofia
  if (cityName === 'София' || cityName === 'Sofia') {
    return Object.keys(SOFIA_STREETS).map(code => ({
      code,
      district: code === '1000' ? 'Център' : code.startsWith('11') ? 'Младост' : code.startsWith('13') ? 'Драгалевци' : code.startsWith('14') ? 'Бояна' : code.startsWith('16') ? 'Младост 1' : code.startsWith('17') ? 'Младост 2' : undefined,
      streets: SOFIA_STREETS[code] || []
    }));
  }
  
  // Plovdiv
  if (cityName === 'Пловдив' || cityName === 'Plovdiv') {
    return Object.keys(PLOVDIV_STREETS).map(code => ({
      code,
      streets: PLOVDIV_STREETS[code] || []
    }));
  }
  
  // Varna
  if (cityName === 'Варна' || cityName === 'Varna') {
    return Object.keys(VARNA_STREETS).map(code => ({
      code,
      streets: VARNA_STREETS[code] || []
    }));
  }
  
  // Burgas
  if (cityName === 'Бургас' || cityName === 'Burgas') {
    return Object.keys(BURGAS_STREETS).map(code => ({
      code,
      streets: BURGAS_STREETS[code] || []
    }));
  }
  
  // For other cities, generate common postal codes based on region
  const regionPostalPrefixes: Record<string, string> = {
    'София-град': '1000',
    'Пловдив': '4000',
    'Варна': '9000',
    'Бургас': '8000',
    'Стара Загора': '6000',
    'Плевен': '5800',
    'Русе': '7000',
    'Сливен': '8800',
    'Добрич': '9300',
    'Шумен': '9700',
    'Перник': '2300',
    'Хасково': '6300',
    'Ямбол': '8600',
    'Благоевград': '2700',
    'Велико Търново': '5000',
    'Враца': '3000',
    'Видин': '3700',
    'Монтана': '3400',
    'Ловеч': '5500',
    'Кюстендил': '2500',
    'Кърджали': '6600',
    'Силистра': '7500',
    'Разград': '7200',
    'Търговище': '7700',
    'Габрово': '5300',
    'Смолян': '4700',
    'София област': '1000'
  };
  
  const prefix = regionPostalPrefixes[regionName] || '1000';
  const baseCode = parseInt(prefix);
  
  return [
    { code: prefix, streets: [] },
    { code: String(baseCode + 1).padStart(4, '0'), streets: [] },
    { code: String(baseCode + 2).padStart(4, '0'), streets: [] }
  ];
};

// Helper function to get streets for a postal code
export const getStreetsForPostalCode = (postalCode: string, cityName: string): string[] => {
  // Sofia
  if (cityName === 'София' || cityName === 'Sofia') {
    return SOFIA_STREETS[postalCode] || [];
  }
  
  // Plovdiv
  if (cityName === 'Пловдив' || cityName === 'Plovdiv') {
    return PLOVDIV_STREETS[postalCode] || [];
  }
  
  // Varna
  if (cityName === 'Варна' || cityName === 'Varna') {
    return VARNA_STREETS[postalCode] || [];
  }
  
  // Burgas
  if (cityName === 'Бургас' || cityName === 'Burgas') {
    return BURGAS_STREETS[postalCode] || [];
  }
  
  return [];
};

// Export all street data
export const ALL_STREETS_DATA = {
  sofia: SOFIA_STREETS,
  plovdiv: PLOVDIV_STREETS,
  varna: VARNA_STREETS,
  burgas: BURGAS_STREETS
};


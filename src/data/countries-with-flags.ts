// countries-with-flags.ts
// Complete list of countries with flags (emoji) and phone codes
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

export interface Country {
  code: string;
  name: string;
  nameBg: string;
  flag: string;
  phoneCode: string;
}

export const COUNTRIES: Country[] = [
  { code: 'BG', name: 'Bulgaria', nameBg: 'България', flag: '🇧🇬', phoneCode: '+359' },
  { code: 'US', name: 'United States', nameBg: 'Съединени американски щати', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', nameBg: 'Обединено кралство', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'DE', name: 'Germany', nameBg: 'Германия', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', nameBg: 'Франция', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'IT', name: 'Italy', nameBg: 'Италия', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'ES', name: 'Spain', nameBg: 'Испания', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'RO', name: 'Romania', nameBg: 'Румъния', flag: '🇷🇴', phoneCode: '+40' },
  { code: 'GR', name: 'Greece', nameBg: 'Гърция', flag: '🇬🇷', phoneCode: '+30' },
  { code: 'TR', name: 'Turkey', nameBg: 'Турция', flag: '🇹🇷', phoneCode: '+90' },
  { code: 'RS', name: 'Serbia', nameBg: 'Сърбия', flag: '🇷🇸', phoneCode: '+381' },
  { code: 'MK', name: 'North Macedonia', nameBg: 'Северна Македония', flag: '🇲🇰', phoneCode: '+389' },
  { code: 'AL', name: 'Albania', nameBg: 'Албания', flag: '🇦🇱', phoneCode: '+355' },
  { code: 'HR', name: 'Croatia', nameBg: 'Хърватия', flag: '🇭🇷', phoneCode: '+385' },
  { code: 'AT', name: 'Austria', nameBg: 'Австрия', flag: '🇦🇹', phoneCode: '+43' },
  { code: 'CH', name: 'Switzerland', nameBg: 'Швейцария', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'NL', name: 'Netherlands', nameBg: 'Холандия', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'BE', name: 'Belgium', nameBg: 'Белгия', flag: '🇧🇪', phoneCode: '+32' },
  { code: 'PL', name: 'Poland', nameBg: 'Полша', flag: '🇵🇱', phoneCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', nameBg: 'Чехия', flag: '🇨🇿', phoneCode: '+420' },
  { code: 'SK', name: 'Slovakia', nameBg: 'Словакия', flag: '🇸🇰', phoneCode: '+421' },
  { code: 'HU', name: 'Hungary', nameBg: 'Унгария', flag: '🇭🇺', phoneCode: '+36' },
  { code: 'SE', name: 'Sweden', nameBg: 'Швеция', flag: '🇸🇪', phoneCode: '+46' },
  { code: 'NO', name: 'Norway', nameBg: 'Норвегия', flag: '🇳🇴', phoneCode: '+47' },
  { code: 'DK', name: 'Denmark', nameBg: 'Дания', flag: '🇩🇰', phoneCode: '+45' },
  { code: 'FI', name: 'Finland', nameBg: 'Финландия', flag: '🇫🇮', phoneCode: '+358' },
  { code: 'IE', name: 'Ireland', nameBg: 'Ирландия', flag: '🇮🇪', phoneCode: '+353' },
  { code: 'PT', name: 'Portugal', nameBg: 'Португалия', flag: '🇵🇹', phoneCode: '+351' },
  { code: 'RU', name: 'Russia', nameBg: 'Русия', flag: '🇷🇺', phoneCode: '+7' },
  { code: 'UA', name: 'Ukraine', nameBg: 'Украйна', flag: '🇺🇦', phoneCode: '+380' },
  { code: 'BY', name: 'Belarus', nameBg: 'Беларус', flag: '🇧🇾', phoneCode: '+375' },
  { code: 'CN', name: 'China', nameBg: 'Китай', flag: '🇨🇳', phoneCode: '+86' },
  { code: 'JP', name: 'Japan', nameBg: 'Япония', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'KR', name: 'South Korea', nameBg: 'Южна Корея', flag: '🇰🇷', phoneCode: '+82' },
  { code: 'IN', name: 'India', nameBg: 'Индия', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'AU', name: 'Australia', nameBg: 'Австралия', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'CA', name: 'Canada', nameBg: 'Канада', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'BR', name: 'Brazil', nameBg: 'Бразилия', flag: '🇧🇷', phoneCode: '+55' },
  { code: 'MX', name: 'Mexico', nameBg: 'Мексико', flag: '🇲🇽', phoneCode: '+52' },
  { code: 'AR', name: 'Argentina', nameBg: 'Аржентина', flag: '🇦🇷', phoneCode: '+54' },
  { code: 'ZA', name: 'South Africa', nameBg: 'Южна Африка', flag: '🇿🇦', phoneCode: '+27' },
  { code: 'EG', name: 'Egypt', nameBg: 'Египет', flag: '🇪🇬', phoneCode: '+20' },
  { code: 'SA', name: 'Saudi Arabia', nameBg: 'Саудитска Арабия', flag: '🇸🇦', phoneCode: '+966' },
  { code: 'AE', name: 'United Arab Emirates', nameBg: 'Обединени арабски емирства', flag: '🇦🇪', phoneCode: '+971' },
  { code: 'IL', name: 'Israel', nameBg: 'Израел', flag: '🇮🇱', phoneCode: '+972' },
  { code: 'NZ', name: 'New Zealand', nameBg: 'Нова Зеландия', flag: '🇳🇿', phoneCode: '+64' },
  { code: 'SG', name: 'Singapore', nameBg: 'Сингапур', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'MY', name: 'Malaysia', nameBg: 'Малайзия', flag: '🇲🇾', phoneCode: '+60' },
  { code: 'TH', name: 'Thailand', nameBg: 'Тайланд', flag: '🇹🇭', phoneCode: '+66' },
  { code: 'VN', name: 'Vietnam', nameBg: 'Виетнам', flag: '🇻🇳', phoneCode: '+84' },
  { code: 'PH', name: 'Philippines', nameBg: 'Филипини', flag: '🇵🇭', phoneCode: '+63' },
  { code: 'ID', name: 'Indonesia', nameBg: 'Индонезия', flag: '🇮🇩', phoneCode: '+62' },
];

// Get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(c => c.code === code);
};

// Get country by phone code
export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return COUNTRIES.find(c => c.phoneCode === phoneCode);
};

// Default country (Bulgaria)
export const DEFAULT_COUNTRY: Country = COUNTRIES[0];


// Comprehensive Dropdown Options for Bulgarian Car Marketplace
// بيانات شاملة للقوائم المنسدلة في سوق السيارات البلغاري

export interface DropdownOption {
  value: string;
  label: string;
  labelEn: string;
  disabled?: boolean;
}

// ==================== VEHICLE TYPES ====================
export const VEHICLE_TYPES: DropdownOption[] = [
  { value: 'car', label: 'Лека кола', labelEn: 'Car' },
  { value: 'motorcycle', label: 'Мотоциклет', labelEn: 'Motorcycle' },
  { value: 'truck', label: 'Камион', labelEn: 'Truck' },
  { value: 'bus', label: 'Автобус', labelEn: 'Bus' },
  { value: 'van', label: 'Ван', labelEn: 'Van' },
  { value: 'trailer', label: 'Ремарке', labelEn: 'Trailer' },
  { value: 'boat', label: 'Лодка', labelEn: 'Boat' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== SELLER TYPES ====================
export const SELLER_TYPES: DropdownOption[] = [
  { value: 'private', label: 'Частно лице', labelEn: 'Private Person' },
  { value: 'dealer', label: 'Търговец', labelEn: 'Dealer' },
  { value: 'company', label: 'Фирма', labelEn: 'Company' },
  { value: 'garage', label: 'Автосервиз', labelEn: 'Garage' }
];

// ==================== CAR BRANDS ====================
export const CAR_BRANDS: DropdownOption[] = [
  { value: 'audi', label: 'Audi', labelEn: 'Audi' },
  { value: 'bmw', label: 'BMW', labelEn: 'BMW' },
  { value: 'mercedes', label: 'Mercedes-Benz', labelEn: 'Mercedes-Benz' },
  { value: 'volkswagen', label: 'Volkswagen', labelEn: 'Volkswagen' },
  { value: 'toyota', label: 'Toyota', labelEn: 'Toyota' },
  { value: 'peugeot', label: 'Peugeot', labelEn: 'Peugeot' },
  { value: 'renault', label: 'Renault', labelEn: 'Renault' },
  { value: 'ford', label: 'Ford', labelEn: 'Ford' },
  { value: 'opel', label: 'Opel', labelEn: 'Opel' },
  { value: 'skoda', label: 'Škoda', labelEn: 'Škoda' },
  { value: 'nissan', label: 'Nissan', labelEn: 'Nissan' },
  { value: 'honda', label: 'Honda', labelEn: 'Honda' },
  { value: 'hyundai', label: 'Hyundai', labelEn: 'Hyundai' },
  { value: 'kia', label: 'Kia', labelEn: 'Kia' },
  { value: 'mazda', label: 'Mazda', labelEn: 'Mazda' },
  { value: 'suzuki', label: 'Suzuki', labelEn: 'Suzuki' },
  { value: 'mitsubishi', label: 'Mitsubishi', labelEn: 'Mitsubishi' },
  { value: 'subaru', label: 'Subaru', labelEn: 'Subaru' },
  { value: 'lexus', label: 'Lexus', labelEn: 'Lexus' },
  { value: 'infiniti', label: 'Infiniti', labelEn: 'Infiniti' },
  { value: 'acura', label: 'Acura', labelEn: 'Acura' },
  { value: 'volvo', label: 'Volvo', labelEn: 'Volvo' },
  { value: 'saab', label: 'Saab', labelEn: 'Saab' },
  { value: 'jaguar', label: 'Jaguar', labelEn: 'Jaguar' },
  { value: 'land_rover', label: 'Land Rover', labelEn: 'Land Rover' },
  { value: 'range_rover', label: 'Range Rover', labelEn: 'Range Rover' },
  { value: 'porsche', label: 'Porsche', labelEn: 'Porsche' },
  { value: 'ferrari', label: 'Ferrari', labelEn: 'Ferrari' },
  { value: 'lamborghini', label: 'Lamborghini', labelEn: 'Lamborghini' },
  { value: 'maserati', label: 'Maserati', labelEn: 'Maserati' },
  { value: 'bentley', label: 'Bentley', labelEn: 'Bentley' },
  { value: 'rolls_royce', label: 'Rolls-Royce', labelEn: 'Rolls-Royce' },
  { value: 'aston_martin', label: 'Aston Martin', labelEn: 'Aston Martin' },
  { value: 'mclaren', label: 'McLaren', labelEn: 'McLaren' },
  { value: 'bugatti', label: 'Bugatti', labelEn: 'Bugatti' },
  { value: 'alfa_romeo', label: 'Alfa Romeo', labelEn: 'Alfa Romeo' },
  { value: 'fiat', label: 'Fiat', labelEn: 'Fiat' },
  { value: 'lancia', label: 'Lancia', labelEn: 'Lancia' },
  { value: 'seat', label: 'SEAT', labelEn: 'SEAT' },
  { value: 'cupra', label: 'CUPRA', labelEn: 'CUPRA' },
  { value: 'dacia', label: 'Dacia', labelEn: 'Dacia' },
  { value: 'lada', label: 'Lada', labelEn: 'Lada' },
  { value: 'uaz', label: 'UAZ', labelEn: 'UAZ' },
  { value: 'gaz', label: 'GAZ', labelEn: 'GAZ' },
  { value: 'zaz', label: 'ZAZ', labelEn: 'ZAZ' },
  { value: 'trabant', label: 'Trabant', labelEn: 'Trabant' },
  { value: 'wartburg', label: 'Wartburg', labelEn: 'Wartburg' },
  { value: 'dacia', label: 'Dacia', labelEn: 'Dacia' },
  { value: 'daihatsu', label: 'Daihatsu', labelEn: 'Daihatsu' },
  { value: 'isuzu', label: 'Isuzu', labelEn: 'Isuzu' },
  { value: 'suzuki', label: 'Suzuki', labelEn: 'Suzuki' },
  { value: 'daihatsu', label: 'Daihatsu', labelEn: 'Daihatsu' },
  { value: 'perodua', label: 'Perodua', labelEn: 'Perodua' },
  { value: 'proton', label: 'Proton', labelEn: 'Proton' },
  { value: 'geely', label: 'Geely', labelEn: 'Geely' },
  { value: 'great_wall', label: 'Great Wall', labelEn: 'Great Wall' },
  { value: 'haval', label: 'Haval', labelEn: 'Haval' },
  { value: 'chery', label: 'Chery', labelEn: 'Chery' },
  { value: 'byd', label: 'BYD', labelEn: 'BYD' },
  { value: 'jac', label: 'JAC', labelEn: 'JAC' },
  { value: 'mg', label: 'MG', labelEn: 'MG' },
  { value: 'maxus', label: 'Maxus', labelEn: 'Maxus' },
  { value: 'ldv', label: 'LDV', labelEn: 'LDV' },
  { value: 'ssangyong', label: 'SsangYong', labelEn: 'SsangYong' },
  { value: 'daewoo', label: 'Daewoo', labelEn: 'Daewoo' },
  { value: 'chevrolet', label: 'Chevrolet', labelEn: 'Chevrolet' },
  { value: 'cadillac', label: 'Cadillac', labelEn: 'Cadillac' },
  { value: 'gmc', label: 'GMC', labelEn: 'GMC' },
  { value: 'buick', label: 'Buick', labelEn: 'Buick' },
  { value: 'chrysler', label: 'Chrysler', labelEn: 'Chrysler' },
  { value: 'dodge', label: 'Dodge', labelEn: 'Dodge' },
  { value: 'jeep', label: 'Jeep', labelEn: 'Jeep' },
  { value: 'ram', label: 'RAM', labelEn: 'RAM' },
  { value: 'tesla', label: 'Tesla', labelEn: 'Tesla' },
  { value: 'rivian', label: 'Rivian', labelEn: 'Rivian' },
  { value: 'lucid', label: 'Lucid', labelEn: 'Lucid' },
  { value: 'fisker', label: 'Fisker', labelEn: 'Fisker' },
  { value: 'polestar', label: 'Polestar', labelEn: 'Polestar' },
  { value: 'genesis', label: 'Genesis', labelEn: 'Genesis' },
  { value: 'mini', label: 'MINI', labelEn: 'MINI' },
  { value: 'smart', label: 'Smart', labelEn: 'Smart' },
  { value: 'maybach', label: 'Maybach', labelEn: 'Maybach' },
  { value: 'amg', label: 'AMG', labelEn: 'AMG' },
  { value: 'm', label: 'M', labelEn: 'M' },
  { value: 'rs', label: 'RS', labelEn: 'RS' },
  { value: 's', label: 'S', labelEn: 'S' },
  { value: 'gti', label: 'GTI', labelEn: 'GTI' },
  { value: 'r', label: 'R', labelEn: 'R' },
  { value: 'gtd', label: 'GTD', labelEn: 'GTD' },
  { value: 'golf', label: 'Golf', labelEn: 'Golf' },
  { value: 'passat', label: 'Passat', labelEn: 'Passat' },
  { value: 'polo', label: 'Polo', labelEn: 'Polo' },
  { value: 'tiguan', label: 'Tiguan', labelEn: 'Tiguan' },
  { value: 'touareg', label: 'Touareg', labelEn: 'Touareg' },
  { value: 'arteon', label: 'Arteon', labelEn: 'Arteon' },
  { value: 't_cross', label: 'T-Cross', labelEn: 'T-Cross' },
  { value: 't_roc', label: 'T-Roc', labelEn: 'T-Roc' },
  { value: 'tiguan_allspace', label: 'Tiguan Allspace', labelEn: 'Tiguan Allspace' },
  { value: 'touran', label: 'Touran', labelEn: 'Touran' },
  { value: 'sharan', label: 'Sharan', labelEn: 'Sharan' },
  { value: 'caddy', label: 'Caddy', labelEn: 'Caddy' },
  { value: 'crafter', label: 'Crafter', labelEn: 'Crafter' },
  { value: 'transporter', label: 'Transporter', labelEn: 'Transporter' },
  { value: 'amarok', label: 'Amarok', labelEn: 'Amarok' },
  { value: 'california', label: 'California', labelEn: 'California' },
  { value: 'caravelle', label: 'Caravelle', labelEn: 'Caravelle' },
  { value: 'multivan', label: 'Multivan', labelEn: 'Multivan' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== YEARS (1925-2025) ====================
export const CAR_YEARS: DropdownOption[] = (() => {
  const years: DropdownOption[] = [];
  for (let year = 2025; year >= 1925; year--) {
    years.push({
      value: year.toString(),
      label: year.toString(),
      labelEn: year.toString()
    });
  }
  return years;
})();

// ==================== FUEL TYPES ====================
export const FUEL_TYPES: DropdownOption[] = [
  { value: 'petrol', label: 'Бензин', labelEn: 'Petrol' },
  { value: 'diesel', label: 'Дизел', labelEn: 'Diesel' },
  { value: 'hybrid', label: 'Хибрид', labelEn: 'Hybrid' },
  { value: 'electric', label: 'Електрически', labelEn: 'Electric' },
  { value: 'lpg', label: 'LPG', labelEn: 'LPG' },
  { value: 'cng', label: 'CNG', labelEn: 'CNG' },
  { value: 'ethanol', label: 'Етанол', labelEn: 'Ethanol' },
  { value: 'hydrogen', label: 'Водород', labelEn: 'Hydrogen' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== TRANSMISSION TYPES ====================
export const TRANSMISSION_TYPES: DropdownOption[] = [
  { value: 'manual', label: 'Ръчна', labelEn: 'Manual' },
  { value: 'automatic', label: 'Автоматична', labelEn: 'Automatic' },
  { value: 'semi_automatic', label: 'Полуавтоматична', labelEn: 'Semi-Automatic' },
  { value: 'cvt', label: 'CVT', labelEn: 'CVT' },
  { value: 'dsg', label: 'DSG', labelEn: 'DSG' },
  { value: 'tiptronic', label: 'Tiptronic', labelEn: 'Tiptronic' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== COLORS ====================
export const CAR_COLORS: DropdownOption[] = [
  { value: 'white', label: 'Бял', labelEn: 'White' },
  { value: 'black', label: 'Черен', labelEn: 'Black' },
  { value: 'silver', label: 'Сребърен', labelEn: 'Silver' },
  { value: 'gray', label: 'Сив', labelEn: 'Gray' },
  { value: 'red', label: 'Червен', labelEn: 'Red' },
  { value: 'blue', label: 'Син', labelEn: 'Blue' },
  { value: 'green', label: 'Зелен', labelEn: 'Green' },
  { value: 'yellow', label: 'Жълт', labelEn: 'Yellow' },
  { value: 'orange', label: 'Оранжев', labelEn: 'Orange' },
  { value: 'brown', label: 'Кафяв', labelEn: 'Brown' },
  { value: 'beige', label: 'Бежов', labelEn: 'Beige' },
  { value: 'gold', label: 'Златист', labelEn: 'Gold' },
  { value: 'purple', label: 'Лилав', labelEn: 'Purple' },
  { value: 'pink', label: 'Розов', labelEn: 'Pink' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== DOORS ====================
export const DOOR_COUNTS: DropdownOption[] = [
  { value: '2', label: '2', labelEn: '2' },
  { value: '3', label: '3', labelEn: '3' },
  { value: '4', label: '4', labelEn: '4' },
  { value: '5', label: '5', labelEn: '5' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== SEATS ====================
export const SEAT_COUNTS: DropdownOption[] = [
  { value: '2', label: '2', labelEn: '2' },
  { value: '4', label: '4', labelEn: '4' },
  { value: '5', label: '5', labelEn: '5' },
  { value: '6', label: '6', labelEn: '6' },
  { value: '7', label: '7', labelEn: '7' },
  { value: '8', label: '8', labelEn: '8' },
  { value: '9', label: '9', labelEn: '9' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== CURRENCIES ====================
export const CURRENCIES: DropdownOption[] = [
  { value: 'EUR', label: 'EUR (€)', labelEn: 'EUR (€)' },
  { value: 'BGN', label: 'BGN (лв)', labelEn: 'BGN (лв)' },
  { value: 'USD', label: 'USD ($)', labelEn: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)', labelEn: 'GBP (£)' },
  { value: 'CHF', label: 'CHF (₣)', labelEn: 'CHF (₣)' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== PRICE TYPES ====================
export const PRICE_TYPES: DropdownOption[] = [
  { value: 'fixed', label: 'Фиксирана', labelEn: 'Fixed' },
  { value: 'negotiable', label: 'Договорна', labelEn: 'Negotiable' },
  { value: 'auction', label: 'Търг', labelEn: 'Auction' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== ACCOUNT TYPES ====================
export const ACCOUNT_TYPES: DropdownOption[] = [
  { value: 'private', label: 'Частно лице', labelEn: 'Private Person' },
  { value: 'dealer', label: 'Търговец', labelEn: 'Dealer' },
  { value: 'company', label: 'Фирма', labelEn: 'Company' },
  { value: 'garage', label: 'Автосервиз', labelEn: 'Garage' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== LEGAL FORMS ====================
export const LEGAL_FORMS: DropdownOption[] = [
  { value: 'EOOD', label: 'ЕООД - Еднолично дружество с ограничена отговорност', labelEn: 'EOOD - Single Member Limited Liability Company' },
  { value: 'OOD', label: 'ООД - Дружество с ограничена отговорност', labelEn: 'OOD - Limited Liability Company' },
  { value: 'AD', label: 'АД - Акционерно дружество', labelEn: 'AD - Joint Stock Company' },
  { value: 'ET', label: 'ЕТ - Едноличен търговец', labelEn: 'ET - Sole Trader' },
  { value: 'EAD', label: 'ЕАД - Еднолично акционерно дружество', labelEn: 'EAD - Single Member Joint Stock Company' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== GENDERS ====================
export const GENDERS: DropdownOption[] = [
  { value: 'male', label: 'Мъж', labelEn: 'Male' },
  { value: 'female', label: 'Жена', labelEn: 'Female' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== NATIONALITIES ====================
export const NATIONALITIES: DropdownOption[] = [
  { value: 'BG', label: 'България', labelEn: 'Bulgaria' },
  { value: 'DE', label: 'Германия', labelEn: 'Germany' },
  { value: 'FR', label: 'Франция', labelEn: 'France' },
  { value: 'IT', label: 'Италия', labelEn: 'Italy' },
  { value: 'ES', label: 'Испания', labelEn: 'Spain' },
  { value: 'UK', label: 'Великобритания', labelEn: 'United Kingdom' },
  { value: 'US', label: 'САЩ', labelEn: 'United States' },
  { value: 'TR', label: 'Турция', labelEn: 'Turkey' },
  { value: 'GR', label: 'Гърция', labelEn: 'Greece' },
  { value: 'RO', label: 'Румъния', labelEn: 'Romania' },
  { value: 'RS', label: 'Сърбия', labelEn: 'Serbia' },
  { value: 'MK', label: 'Македония', labelEn: 'Macedonia' },
  { value: 'AL', label: 'Албания', labelEn: 'Albania' },
  { value: 'HR', label: 'Хърватия', labelEn: 'Croatia' },
  { value: 'SI', label: 'Словения', labelEn: 'Slovenia' },
  { value: 'HU', label: 'Унгария', labelEn: 'Hungary' },
  { value: 'SK', label: 'Словакия', labelEn: 'Slovakia' },
  { value: 'CZ', label: 'Чехия', labelEn: 'Czech Republic' },
  { value: 'PL', label: 'Полша', labelEn: 'Poland' },
  { value: 'AT', label: 'Австрия', labelEn: 'Austria' },
  { value: 'CH', label: 'Швейцария', labelEn: 'Switzerland' },
  { value: 'NL', label: 'Холандия', labelEn: 'Netherlands' },
  { value: 'BE', label: 'Белгия', labelEn: 'Belgium' },
  { value: 'LU', label: 'Люксембург', labelEn: 'Luxembourg' },
  { value: 'DK', label: 'Дания', labelEn: 'Denmark' },
  { value: 'SE', label: 'Швеция', labelEn: 'Sweden' },
  { value: 'NO', label: 'Норвегия', labelEn: 'Norway' },
  { value: 'FI', label: 'Финландия', labelEn: 'Finland' },
  { value: 'IE', label: 'Ирландия', labelEn: 'Ireland' },
  { value: 'PT', label: 'Португалия', labelEn: 'Portugal' },
  { value: 'MT', label: 'Малта', labelEn: 'Malta' },
  { value: 'CY', label: 'Кипър', labelEn: 'Cyprus' },
  { value: 'EE', label: 'Естония', labelEn: 'Estonia' },
  { value: 'LV', label: 'Латвия', labelEn: 'Latvia' },
  { value: 'LT', label: 'Литва', labelEn: 'Lithuania' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== DOCUMENT TYPES ====================
export const DOCUMENT_TYPES: DropdownOption[] = [
  { value: 'id_card', label: 'Лична карта', labelEn: 'ID Card' },
  { value: 'passport', label: 'Паспорт', labelEn: 'Passport' },
  { value: 'driving_license', label: 'Шофьорска книжка', labelEn: 'Driving License' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== CAR CATEGORIES ====================
export const CAR_CATEGORIES: DropdownOption[] = [
  { value: 'sedan', label: 'Седан', labelEn: 'Sedan' },
  { value: 'hatchback', label: 'Хечбек', labelEn: 'Hatchback' },
  { value: 'wagon', label: 'Комби', labelEn: 'Wagon' },
  { value: 'suv', label: 'SUV', labelEn: 'SUV' },
  { value: 'coupe', label: 'Купе', labelEn: 'Coupe' },
  { value: 'convertible', label: 'Кабриолет', labelEn: 'Convertible' },
  { value: 'pickup', label: 'Пикап', labelEn: 'Pickup' },
  { value: 'van', label: 'Ван', labelEn: 'Van' },
  { value: 'minivan', label: 'Миниван', labelEn: 'Minivan' },
  { value: 'crossover', label: 'Кросоувър', labelEn: 'Crossover' },
  { value: 'sports_car', label: 'Спортна кола', labelEn: 'Sports Car' },
  { value: 'luxury', label: 'Луксозна кола', labelEn: 'Luxury Car' },
  { value: 'electric', label: 'Електрическа кола', labelEn: 'Electric Car' },
  { value: 'hybrid', label: 'Хибридна кола', labelEn: 'Hybrid Car' },
  { value: 'classic', label: 'Класическа кола', labelEn: 'Classic Car' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== VEHICLE CONDITIONS ====================
export const VEHICLE_CONDITIONS: DropdownOption[] = [
  { value: 'excellent', label: 'Отлично', labelEn: 'Excellent' },
  { value: 'very_good', label: 'Много добре', labelEn: 'Very Good' },
  { value: 'good', label: 'Добре', labelEn: 'Good' },
  { value: 'fair', label: 'Задоволително', labelEn: 'Fair' },
  { value: 'poor', label: 'Лошо', labelEn: 'Poor' },
  { value: 'damaged', label: 'Повредено', labelEn: 'Damaged' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== MILEAGE RANGES ====================
export const MILEAGE_RANGES: DropdownOption[] = [
  { value: '0-10000', label: '0 - 10,000 км', labelEn: '0 - 10,000 km' },
  { value: '10000-50000', label: '10,000 - 50,000 км', labelEn: '10,000 - 50,000 km' },
  { value: '50000-100000', label: '50,000 - 100,000 км', labelEn: '50,000 - 100,000 km' },
  { value: '100000-150000', label: '100,000 - 150,000 км', labelEn: '100,000 - 150,000 km' },
  { value: '150000-200000', label: '150,000 - 200,000 км', labelEn: '150,000 - 200,000 km' },
  { value: '200000+', label: '200,000+ км', labelEn: '200,000+ km' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== PRICE RANGES ====================
export const PRICE_RANGES: DropdownOption[] = [
  { value: '0-5000', label: '0 - 5,000 лв', labelEn: '0 - 5,000 BGN' },
  { value: '5000-10000', label: '5,000 - 10,000 лв', labelEn: '5,000 - 10,000 BGN' },
  { value: '10000-20000', label: '10,000 - 20,000 лв', labelEn: '10,000 - 20,000 BGN' },
  { value: '20000-30000', label: '20,000 - 30,000 лв', labelEn: '20,000 - 30,000 BGN' },
  { value: '30000-50000', label: '30,000 - 50,000 лв', labelEn: '30,000 - 50,000 BGN' },
  { value: '50000-75000', label: '50,000 - 75,000 лв', labelEn: '50,000 - 75,000 BGN' },
  { value: '75000-100000', label: '75,000 - 100,000 лв', labelEn: '75,000 - 100,000 BGN' },
  { value: '100000+', label: '100,000+ лв', labelEn: '100,000+ BGN' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== SORT OPTIONS ====================
export const SORT_OPTIONS: DropdownOption[] = [
  { value: 'newest', label: 'Най-нови', labelEn: 'Newest' },
  { value: 'oldest', label: 'Най-стари', labelEn: 'Oldest' },
  { value: 'price_low', label: 'Цена: ниска → висока', labelEn: 'Price: Low → High' },
  { value: 'price_high', label: 'Цена: висока → ниска', labelEn: 'Price: High → Low' },
  { value: 'year_new', label: 'Година: нова → стара', labelEn: 'Year: New → Old' },
  { value: 'year_old', label: 'Година: стара → нова', labelEn: 'Year: Old → New' },
  { value: 'mileage_low', label: 'Пробег: малък → голям', labelEn: 'Mileage: Low → High' },
  { value: 'mileage_high', label: 'Пробег: голям → малък', labelEn: 'Mileage: High → Low' },
  { value: 'most_viewed', label: 'Най-гледани', labelEn: 'Most Viewed' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== AVAILABLE HOURS ====================
export const AVAILABLE_HOURS: DropdownOption[] = [
  { value: '9-17', label: 'Понеделник - Петък: 9:00 - 17:00', labelEn: 'Monday - Friday: 9:00 AM - 5:00 PM' },
  { value: '8-18', label: 'Понеделник - Петък: 8:00 - 18:00', labelEn: 'Monday - Friday: 8:00 AM - 6:00 PM' },
  { value: '9-18', label: 'Понеделник - Петък: 9:00 - 18:00', labelEn: 'Monday - Friday: 9:00 AM - 6:00 PM' },
  { value: '10-19', label: 'Понеделник - Петък: 10:00 - 19:00', labelEn: 'Monday - Friday: 10:00 AM - 7:00 PM' },
  { value: '24-7', label: '24/7 - Всеки ден', labelEn: '24/7 - Every Day' },
  { value: 'weekends', label: 'Само уикенди', labelEn: 'Weekends Only' },
  { value: 'evenings', label: 'Вечерни часове', labelEn: 'Evening Hours' },
  { value: 'flexible', label: 'Гъвкаво време', labelEn: 'Flexible Hours' },
  { value: 'by_appointment', label: 'По уговорка', labelEn: 'By Appointment' },
  { value: 'other', label: 'Друго', labelEn: 'Other' }
];

// ==================== HELPER FUNCTIONS ====================

export const getDropdownOptions = (type: string): DropdownOption[] => {
  const optionsMap: Record<string, DropdownOption[]> = {
    vehicleTypes: VEHICLE_TYPES,
    sellerTypes: SELLER_TYPES,
    carBrands: CAR_BRANDS,
    carYears: CAR_YEARS,
    fuelTypes: FUEL_TYPES,
    transmissionTypes: TRANSMISSION_TYPES,
    carColors: CAR_COLORS,
    doorCounts: DOOR_COUNTS,
    seatCounts: SEAT_COUNTS,
    currencies: CURRENCIES,
    priceTypes: PRICE_TYPES,
    accountTypes: ACCOUNT_TYPES,
    legalForms: LEGAL_FORMS,
    genders: GENDERS,
    nationalities: NATIONALITIES,
    documentTypes: DOCUMENT_TYPES,
    carCategories: CAR_CATEGORIES,
    vehicleConditions: VEHICLE_CONDITIONS,
    mileageRanges: MILEAGE_RANGES,
    priceRanges: PRICE_RANGES,
    sortOptions: SORT_OPTIONS,
    availableHours: AVAILABLE_HOURS
  };

  return optionsMap[type] || [];
};

export const findOptionByValue = (type: string, value: string): DropdownOption | undefined => {
  const options = getDropdownOptions(type);
  return options.find(option => option.value === value);
};

export const getOptionLabel = (type: string, value: string, language: 'bg' | 'en' = 'bg'): string => {
  const option = findOptionByValue(type, value);
  if (!option) return value;
  
  return language === 'bg' ? option.label : (option.labelEn || option.label);
};

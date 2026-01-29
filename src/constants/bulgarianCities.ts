// Bulgarian Cities/Provinces - Complete List
// مدن/محافظات بلغاريا - القائمة الكاملة

export interface BulgarianCity {
  id: string;
  nameEn: string;
  nameBg: string;
  nameAr: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isCapital?: boolean;
  population?: number;
}

export const BULGARIAN_CITIES: BulgarianCity[] = [
  {
    id: 'sofia-grad',
    nameEn: 'Sofia - City',
    nameBg: 'София - град',
    nameAr: 'صوفيا – المدينة',
    coordinates: { lat: 42.6977, lng: 23.3219 },
    isCapital: true,
    population: 1241675
  },
  {
    id: 'plovdiv',
    nameEn: 'Plovdiv',
    nameBg: 'Пловдив',
    nameAr: 'بلوفديف',
    coordinates: { lat: 42.1354, lng: 24.7453 },
    population: 346893
  },
  {
    id: 'varna',
    nameEn: 'Varna',
    nameBg: 'Варна',
    nameAr: 'فارنا',
    coordinates: { lat: 43.2141, lng: 27.9147 },
    population: 334870
  },
  {
    id: 'burgas',
    nameEn: 'Burgas',
    nameBg: 'Бургас',
    nameAr: 'بورغاس',
    coordinates: { lat: 42.5048, lng: 27.4626 },
    population: 202766
  },
  {
    id: 'ruse',
    nameEn: 'Ruse',
    nameBg: 'Русе',
    nameAr: 'روسه',
    coordinates: { lat: 43.8486, lng: 25.9654 },
    population: 149642
  },
  {
    id: 'stara-zagora',
    nameEn: 'Stara Zagora',
    nameBg: 'Стара Загора',
    nameAr: 'ستارا زاغورا',
    coordinates: { lat: 42.4258, lng: 25.6342 },
    population: 138272
  },
  {
    id: 'pleven',
    nameEn: 'Pleven',
    nameBg: 'Плевен',
    nameAr: 'بلفن',
    coordinates: { lat: 43.4170, lng: 24.6167 },
    population: 106954
  },
  {
    id: 'sliven',
    nameEn: 'Sliven',
    nameBg: 'Сливен',
    nameAr: 'سليفن',
    coordinates: { lat: 42.6824, lng: 26.3223 },
    population: 91620
  },
  {
    id: 'dobrich',
    nameEn: 'Dobrich',
    nameBg: 'Добрич',
    nameAr: 'دوبريتش',
    coordinates: { lat: 43.5667, lng: 27.8333 },
    population: 89394
  },
  {
    id: 'shumen',
    nameEn: 'Shumen',
    nameBg: 'Шумен',
    nameAr: 'شومن',
    coordinates: { lat: 43.2706, lng: 26.9344 },
    population: 80855
  },
  {
    id: 'pernik',
    nameEn: 'Pernik',
    nameBg: 'Перник',
    nameAr: 'برنيك',
    coordinates: { lat: 42.6053, lng: 23.0370 },
    population: 80191
  },
  {
    id: 'haskovo',
    nameEn: 'Haskovo',
    nameBg: 'Хасково',
    nameAr: 'هاسكوفو',
    coordinates: { lat: 41.9344, lng: 25.5558 },
    population: 76397
  },
  {
    id: 'yambol',
    nameEn: 'Yambol',
    nameBg: 'Ямбол',
    nameAr: 'يامبول',
    coordinates: { lat: 42.4836, lng: 26.5106 },
    population: 74132
  },
  {
    id: 'pazardzhik',
    nameEn: 'Pazardzhik',
    nameBg: 'Пазарджик',
    nameAr: 'بازارجيك',
    coordinates: { lat: 42.1889, lng: 24.3331 },
    population: 71979
  },
  {
    id: 'blagoevgrad',
    nameEn: 'Blagoevgrad',
    nameBg: 'Благоевград',
    nameAr: 'بلاغويفغراد',
    coordinates: { lat: 42.0205, lng: 23.0979 },
    population: 70881
  },
  {
    id: 'veliko-tarnovo',
    nameEn: 'Veliko Tarnovo',
    nameBg: 'Велико Търново',
    nameAr: 'فيليكو ترنوفو',
    coordinates: { lat: 43.0757, lng: 25.6172 },
    population: 68783
  },
  {
    id: 'vratsa',
    nameEn: 'Vratsa',
    nameBg: 'Враца',
    nameAr: 'فراتسا',
    coordinates: { lat: 43.2100, lng: 23.5533 },
    population: 60692
  },
  {
    id: 'gabrovo',
    nameEn: 'Gabrovo',
    nameBg: 'Габрово',
    nameAr: 'غابروفو',
    coordinates: { lat: 42.8747, lng: 25.3330 },
    population: 58950
  },
  {
    id: 'vidin',
    nameEn: 'Vidin',
    nameBg: 'Видин',
    nameAr: 'فيدين',
    coordinates: { lat: 43.9857, lng: 22.8683 },
    population: 52929
  },
  {
    id: 'kyustendil',
    nameEn: 'Kyustendil',
    nameBg: 'Кюстендил',
    nameAr: 'كيوستينديل',
    coordinates: { lat: 42.2858, lng: 22.6897 },
    population: 44532
  },
  {
    id: 'kardzhali',
    nameEn: 'Kardzhali',
    nameBg: 'Кърджали',
    nameAr: 'كارجالي',
    coordinates: { lat: 41.6378, lng: 25.3783 },
    population: 43880
  },
  {
    id: 'montana',
    nameEn: 'Montana',
    nameBg: 'Монтана',
    nameAr: 'مونتانا',
    coordinates: { lat: 43.4089, lng: 23.2258 },
    population: 43421
  },
  {
    id: 'targovishte',
    nameEn: 'Targovishte',
    nameBg: 'Търговище',
    nameAr: 'تارغوفيشته',
    coordinates: { lat: 43.2500, lng: 26.5667 },
    population: 37812
  },
  {
    id: 'lovech',
    nameEn: 'Lovech',
    nameBg: 'Ловеч',
    nameAr: 'لوفتش',
    coordinates: { lat: 43.1367, lng: 24.7144 },
    population: 36296
  },
  {
    id: 'silistra',
    nameEn: 'Silistra',
    nameBg: 'Силистра',
    nameAr: 'سيليسترا',
    coordinates: { lat: 44.1167, lng: 27.2667 },
    population: 35607
  },
  {
    id: 'razgrad',
    nameEn: 'Razgrad',
    nameBg: 'Разград',
    nameAr: 'رازغراد',
    coordinates: { lat: 43.5333, lng: 26.5167 },
    population: 33238
  },
  {
    id: 'smolyan',
    nameEn: 'Smolyan',
    nameBg: 'Смолян',
    nameAr: 'سموليان',
    coordinates: { lat: 41.5742, lng: 24.7011 },
    population: 30283
  },
  {
    id: 'sofia-oblast',
    nameEn: 'Sofia - Province',
    nameBg: 'София - област',
    nameAr: 'صوفيا – المحافظة',
    coordinates: { lat: 42.7339, lng: 23.2894 },
    population: 247489
  }
];

// Helper functions
export const getCityById = (id: string): BulgarianCity | undefined => {
  return BULGARIAN_CITIES.find(city => city.id === id);
};

export const getCityName = (id: string, language: 'en' | 'bg' | 'ar' = 'bg'): string => {
  const city = getCityById(id);
  if (!city) return id;
  
  switch (language) {
    case 'en':
      return city.nameEn;
    case 'bg':
      return city.nameBg;
    case 'ar':
      return city.nameAr;
    default:
      return city.nameBg;
  }
};

export const getCitiesForDropdown = (language: 'en' | 'bg' | 'ar' = 'bg') => {
  return BULGARIAN_CITIES.map(city => ({
    value: city.id,
    label: language === 'en' ? city.nameEn : language === 'ar' ? city.nameAr : city.nameBg,
    coordinates: city.coordinates
  })).sort((a, b) => a.label.localeCompare(b.label));
};

export const getMajorCities = (): BulgarianCity[] => {
  return BULGARIAN_CITIES.filter(city => city.population && city.population > 70000);
};

export default BULGARIAN_CITIES;




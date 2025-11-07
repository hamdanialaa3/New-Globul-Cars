// Bulgaria Regions and Cities Data
// بيانات المناطق والمدن في بلغاريا

export interface Region {
  name: string;
  nameEn: string;
  cities: string[];
  citiesEn?: string[];
}

export const BULGARIA_REGIONS: Region[] = [
  {
    name: 'София-град',
    nameEn: 'Sofia City',
    cities: ['София', 'Банкя', 'Нови Искър'],
    citiesEn: ['Sofia', 'Bankya', 'Novi Iskar']
  },
  {
    name: 'Пловдив',
    nameEn: 'Plovdiv',
    cities: ['Пловдив', 'Асеновград', 'Карлово', 'Хисаря', 'Пещера', 'Кричим', 'Брезово', 'Съединение', 'Раковски', 'Марица'],
    citiesEn: ['Plovdiv', 'Asenovgrad', 'Karlovo', 'Hisarya', 'Peshtera', 'Krichim', 'Brezovo', 'Saedinenie', 'Rakovski', 'Maritsa']
  },
  {
    name: 'Варна',
    nameEn: 'Varna',
    cities: ['Варна', 'Аксаково', 'Белослав', 'Бяла', 'Вълчи дол', 'Девня', 'Долни чифлик', 'Дългопол', 'Провадия', 'Суворово', 'Ветрино'],
    citiesEn: ['Varna', 'Aksakovo', 'Beloslav', 'Byala', 'Valchi dol', 'Devnya', 'Dolni chiflik', 'Dalgopol', 'Provadia', 'Suvorovo', 'Vetrino']
  },
  {
    name: 'Бургас',
    nameEn: 'Burgas',
    cities: ['Бургас', 'Айтос', 'Карнобат', 'Несебър', 'Поморие', 'Средец', 'Малко Търново', 'Приморско', 'Созопол', 'Царево', 'Руен', 'Сунгурларе'],
    citiesEn: ['Burgas', 'Aytos', 'Karnobat', 'Nessebar', 'Pomorie', 'Sredets', 'Malko Tarnovo', 'Primorsko', 'Sozopol', 'Tsarevo', 'Ruen', 'Sungurlare']
  },
  {
    name: 'Стара Загора',
    nameEn: 'Stara Zagora',
    cities: ['Стара Загора', 'Казанлък', 'Раднево', 'Гълъбово', 'Чирпан', 'Димитровград', 'Опан', 'Мъглиж', 'Павел баня', 'Николаево'],
    citiesEn: ['Stara Zagora', 'Kazanlak', 'Radnevo', 'Galabovo', 'Chirpan', 'Dimitrovgrad', 'Opan', 'Maglizh', 'Pavel Banya', 'Nikolaevo']
  },
  {
    name: 'Плевен',
    nameEn: 'Pleven',
    cities: ['Плевен', 'Левски', 'Червен бряг', 'Кнежа', 'Долни Дъбник', 'Долна Митрополия', 'Гулянци', 'Исперих', 'Никопол', 'Белене', 'Пордим'],
    citiesEn: ['Pleven', 'Levski', 'Cherven Bryag', 'Knezha', 'Dolni Dabnik', 'Dolna Mitropoliya', 'Gulyantsi', 'Isperih', 'Nikopol', 'Belene', 'Pordim']
  },
  {
    name: 'Русе',
    nameEn: 'Ruse',
    cities: ['Русе', 'Бяла', 'Борово', 'Ветово', 'Две могили', 'Иваново', 'Сливо поле', 'Ценово'],
    citiesEn: ['Ruse', 'Byala', 'Borovo', 'Vetovo', 'Dve Mogili', 'Ivanovo', 'Slivo Pole', 'Tsenovo']
  },
  {
    name: 'Сливен',
    nameEn: 'Sliven',
    cities: ['Сливен', 'Нова Загора', 'Котел', 'Твърдица'],
    citiesEn: ['Sliven', 'Nova Zagora', 'Kotel', 'Tvarditsa']
  },
  {
    name: 'Добрич',
    nameEn: 'Dobrich',
    cities: ['Добрич', 'Балчик', 'Каварна', 'Тервел', 'Генерал Тошево', 'Шабла', 'Крушари'],
    citiesEn: ['Dobrich', 'Balchik', 'Kavarna', 'Tervel', 'General Toshevo', 'Shabla', 'Krushari']
  },
  {
    name: 'Шумен',
    nameEn: 'Shumen',
    cities: ['Шумен', 'Велики Преслав', 'Хитрино', 'Каспичан', 'Нови пазар', 'Смядово'],
    citiesEn: ['Shumen', 'Veliki Preslav', 'Hitrino', 'Kaspichan', 'Novi Pazar', 'Smyadovo']
  },
  {
    name: 'Перник',
    nameEn: 'Pernik',
    cities: ['Перник', 'Радомир', 'Батановци', 'Брезник', 'Земен', 'Ковачевци', 'Трън'],
    citiesEn: ['Pernik', 'Radomir', 'Batanovtsi', 'Breznik', 'Zemen', 'Kovachevtsi', 'Tran']
  },
  {
    name: 'Хасково',
    nameEn: 'Haskovo',
    cities: ['Хасково', 'Димитровград', 'Харманли', 'Свиленград', 'Любимец', 'Маджарово', 'Минерални бани', 'Мъдрец', 'Симеоновград', 'Стамболово', 'Тополовград'],
    citiesEn: ['Haskovo', 'Dimitrovgrad', 'Harmanli', 'Svilengrad', 'Lyubimets', 'Madzharovo', 'Mineralni Bani', 'Madrets', 'Simeonovgrad', 'Stambolovo', 'Topolovgrad']
  },
  {
    name: 'Пазарджик',
    nameEn: 'Pazardzhik',
    cities: ['Пазарджик', 'Панагюрище', 'Велинград', 'Пещера', 'Септември', 'Батак', 'Белово', 'Брацигово', 'Лесичово', 'Ракитово', 'Стрелча'],
    citiesEn: ['Pazardzhik', 'Panagyurishte', 'Velingrad', 'Peshtera', 'Septemvri', 'Batak', 'Belovo', 'Bratsigovo', 'Lesichovo', 'Rakitovo', 'Strelcha']
  },
  {
    name: 'Ямбол',
    nameEn: 'Yambol',
    cities: ['Ямбол', 'Елхово', 'Тунджа', 'Болярово', 'Стралджа'],
    citiesEn: ['Yambol', 'Elhovo', 'Tundzha', 'Bolyarovo', 'Straldzha']
  },
  {
    name: 'Благоевград',
    nameEn: 'Blagoevgrad',
    cities: ['Благоевград', 'Сандански', 'Петрич', 'Гоце Делчев', 'Банско', 'Разлог', 'Белица', 'Гърмен', 'Hadzhidimovo', 'Кресна', 'Симитли', 'Струмяни', 'Якоруда'],
    citiesEn: ['Blagoevgrad', 'Sandanski', 'Petrich', 'Gotse Delchev', 'Bansko', 'Razlog', 'Belitsa', 'Garmen', 'Hadzhidimovo', 'Kresna', 'Simitli', 'Strumyani', 'Yakoruda']
  },
  {
    name: 'Велико Търново',
    nameEn: 'Veliko Tarnovo',
    cities: ['Велико Търново', 'Горна Оряховица', 'Свищов', 'Елена', 'Златарица', 'Килифарево', 'Лясковец', 'Павликени', 'Полски Тръмбеш', 'Стражица', 'Сухиндол'],
    citiesEn: ['Veliko Tarnovo', 'Gorna Oryahovitsa', 'Svishtov', 'Elena', 'Zlataritsa', 'Kilifarevo', 'Lyaskovets', 'Pavlikeni', 'Polski Trambesh', 'Strazhitsa', 'Suhindol']
  },
  {
    name: 'Враца',
    nameEn: 'Vratsa',
    cities: ['Враца', 'Козлодуй', 'Мездра', 'Бяла Слатина', 'Борован', 'Криводол', 'Мизия', 'Оряхово', 'Роман', 'Хайредин'],
    citiesEn: ['Vratsa', 'Kozloduy', 'Mezdra', 'Byala Slatina', 'Borovan', 'Krivodol', 'Miziya', 'Oryahovo', 'Roman', 'Hayredin']
  },
  {
    name: 'Видин',
    nameEn: 'Vidin',
    cities: ['Видин', 'Белоградчик', 'Брегово', 'Грамада', 'Дунавци', 'Кула', 'Новаситория', 'Ружинци'],
    citiesEn: ['Vidin', 'Belogradchik', 'Bregovo', 'Gramada', 'Dunavtsi', 'Kula', 'Novasitoria', 'Ruzhintsi']
  },
  {
    name: 'Монтана',
    nameEn: 'Montana',
    cities: ['Монтана', 'Берковица', 'Лом', 'Бойчиновци', 'Брусарци', 'Вълчедръм', 'Георги Дамяново', 'Медковец', 'Чипровци', 'Якимово'],
    citiesEn: ['Montana', 'Berkovitsa', 'Lom', 'Boychinovtsi', 'Brusartsi', 'Valchedram', 'Georgi Damyanovo', 'Medkovets', 'Chiprovtsi', 'Yakimovo']
  },
  {
    name: 'Ловеч',
    nameEn: 'Lovech',
    cities: ['Ловеч', 'Троян', 'Тетевен', 'Луковит', 'Априлци', 'Летница', 'Угърчин', 'Ябланица'],
    citiesEn: ['Lovech', 'Troyan', 'Teteven', 'Lukovit', 'Apriltsi', 'Letnitsa', 'Ugarchin', 'Yablanitsa']
  },
  {
    name: 'Кюстендил',
    nameEn: 'Kyustendil',
    cities: ['Кюстендил', 'Дупница', 'Бобов дол', 'Бобошево', 'Кочериново', 'Невестино', 'Рила', 'Сапарева баня'],
    citiesEn: ['Kyustendil', 'Dupnitsa', 'Bobov Dol', 'Boboshevo', 'Kocherinovo', 'Nevestino', 'Rila', 'Sapareva Banya']
  },
  {
    name: 'Кърджали',
    nameEn: 'Kardzhali',
    cities: ['Кърджали', 'Момчилград', 'Ардино', 'Джебел', 'Крумовград', 'Черноочене'],
    citiesEn: ['Kardzhali', 'Momchilgrad', 'Ardino', 'Dzhebel', 'Krumovgrad', 'Chernoochene']
  },
  {
    name: 'Силистра',
    nameEn: 'Silistra',
    cities: ['Силистра', 'Тутракан', 'Алфатар', 'Главиница', 'Дулово', 'Кайнарджа', 'Ситово'],
    citiesEn: ['Silistra', 'Tutrakan', 'Alfatar', 'Glavinitsa', 'Dulovo', 'Kaynardzha', 'Sitovo']
  },
  {
    name: 'Разград',
    nameEn: 'Razgrad',
    cities: ['Разград', 'Исперих', 'Кубрат', 'Завет', 'Лозница', 'Самуил', 'Цар Калоян'],
    citiesEn: ['Razgrad', 'Isperih', 'Kubrat', 'Zavet', 'Loznitsa', 'Samuil', 'Tsar Kaloyan']
  },
  {
    name: 'Търговище',
    nameEn: 'Targovishte',
    cities: ['Търговище', 'Омуртаг', 'Попово', 'Антонов', 'Опака'],
    citiesEn: ['Targovishte', 'Omurtag', 'Popovo', 'Antonovo', 'Opaka']
  },
  {
    name: 'Габрово',
    nameEn: 'Gabrovo',
    cities: ['Габрово', 'Севлиево', 'Дряново', 'Трявна'],
    citiesEn: ['Gabrovo', 'Sevlievo', 'Dryanovo', 'Tryavna']
  },
  {
    name: 'Смолян',
    nameEn: 'Smolyan',
    cities: ['Смолян', 'Чепеларе', 'Девин', 'Доспат', 'Баните', 'Борино', 'Златоград', 'Мадан', 'Неделино', 'Рудозем'],
    citiesEn: ['Smolyan', 'Chepelare', 'Devin', 'Dospat', 'Banite', 'Borino', 'Zlatograd', 'Madan', 'Nedelino', 'Rudozem']
  }
];

// المدن الرئيسية الأكثر شعبية
export const POPULAR_CITIES = [
  'София',
  'Пловдив',
  'Варна',
  'Бургас',
  'Русе',
  'Стара Загора',
  'Плевен',
  'Сливен',
  'Добрич',
  'Шумен'
];

// Helper function to get cities by region with translation support
export const getCitiesByRegion = (regionName: string, language: 'bg' | 'en' = 'bg'): { name: string; nameEn?: string }[] => {
  const region = BULGARIA_REGIONS.find(r => r.name === regionName || r.nameEn === regionName);
  if (!region) return [];
  
  // Return cities with both BG and EN names
  return region.cities.map((city, idx) => ({
    name: language === 'en' && region.citiesEn ? region.citiesEn[idx] : city,
    nameEn: region.citiesEn ? region.citiesEn[idx] : undefined
  }));
};

// Helper function to get all cities
export const getAllCities = (): string[] => {
  return BULGARIA_REGIONS.flatMap(region => region.cities).sort();
};

// Helper function to get region by city
export const getRegionByCity = (cityName: string): string | null => {
  const region = BULGARIA_REGIONS.find(r => r.cities.includes(cityName));
  return region ? region.name : null;
};


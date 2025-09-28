/**
 * CLEAN MINIMAL TRANSLATIONS RESET (2025-09-27)
 * The previously corrupted file has been entirely replaced with a concise, typed baseline.
 */

export type BulgarianLanguage = 'bg' | 'en';

interface BaseCarsSort { newest: string; oldest: string; priceLow: string; priceHigh: string; yearNew: string; yearOld: string; mileageLow: string; mileageHigh: string }
interface BaseCars { title: string; subtitle: string; featured: string; results: { title: string; found: string }; sort: BaseCarsSort; noResults: { title: string; message: string; clearFilters: string } }
interface BaseSearchResults { loading: string; empty: string; count: string; sort: { relevance: string; price: string; date: string; mileage: string; year: string }; view: { grid: string; list: string }; badges: { promoted: string; new: string; featured: string }; actions: { favorite: string; unfavorite: string } }
interface BaseCarSearch { 
  title: string; 
  tabs: { search: string; filters: string; popular: string; trending: string }; 
  advanced: { title: string }; 
  filters: { title: string }; 
  reset: string; 
  search: string; 
  searching: string;
  showAdvanced: string;
  showFilters: string;
  basicData: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  typeAndCondition: string;
  condition: string;
  new: string;
  used: string;
  fuelType: string;
  petrol: string;
  diesel: string;
  electric: string;
  hybrid: string;
}
interface BaseSettings {
  title: string;
  language: string;
  dashboard: string;
  analytics: string;
  digitalTwin: string;
  subscription: string;
  boldText: string;
  enableBoldText: string;
  disableBoldText: string;
}
interface BaseCommon {
  loading: string;
  close: string;
  all: string;
  yes: string;
  no: string;
  valid: string;
  expired: string;
  expiringSoon: string;
  add: string;
  cancel: string;
  submitting: string;
}
interface BaseRatings {
  addReview: string;
  overallRating: string;
  stars: string;
  selectRating: string;
  categoryRatings: string;
  for: string;
  reviewTitle: string;
  titlePlaceholder: string;
  reviewComment: string;
  submitReview: string;
  loadMore: string;
  categories: {
    reliability: string;
    performance: string;
    comfort: string;
    value: string;
    design: string;
  };
  errors: {
    noRating: string;
    noTitle: string;
    noComment: string;
    unratedCategories: string;
    submitFailed: string;
  };
}
interface BaseAdvancedSearch {
  title: string;
  subtitle: string;
  reset: string;
  search: string;
  searching: string;
  saveSearch: string;
  basicData: string;
  make: string;
  model: string;
  modelPlaceholder: string;
  vehicleType: string;
  numberOfSeats: string;
  numberOfDoors: string;
  slidingDoor: string;
  typeAndCondition: string;
  paymentType: string;
  price: string;
  firstRegistration: string;
  mileage: string;
  huValidUntil: string;
  huPlaceholder: string;
  numberOfOwners: string;
  fullServiceHistory: string;
  roadworthy: string;
  // Vehicle types
  cabriolet: string;
  estate: string;
  offroad: string;
  saloon: string;
  small: string;
  sports: string;
  van: string;
  // Conditions
  new: string;
  used: string;
  preRegistration: string;
  employeeCar: string;
  classic: string;
  demonstration: string;
  // Payment types
  buy: string;
  leasing: string;
  // Common values
  any: string;
  all: string;
  yes: string;
  no: string;
  from: string;
  to: string;
  euro: string;
  km: string;
  german: string;
  japanese: string;
  american: string;
  korean: string;
  french: string;
  italian: string;
  swedish: string;
  other: string;
  fuelType: string;
  exteriorColour: string;
  interiorColour: string;
  sellerType: string;
  // Technical data section
  technicalData: string;
  power: string;
  hp: string;
  kw: string;
  cubicCapacity: string;
  ccm: string;
  // Exterior
  exterior: string;
  trailerCoupling: string;
  trailerLoadBraked: string;
  trailerLoadUnbraked: string;
  noseWeight: string;
  parkingSensors: string;
  camera360: string;
  camera: string;
  front: string;
  rear: string;
  rearTrafficAlert: string;
  selfSteeringSystems: string;
  cruiseControl: string;
  // More specific labels
  exteriorColorLabel: string;
  trailerLoadBrakedLabel: string;
  trailerLoadUnbrakedLabel: string;
  // Interior
  interior: string;
  interiorMaterial: string;
  airbags: string;
  airConditioning: string;
  // Features/Extras
  extras: string;
  alarm: string;
  ambientLighting: string;
  androidAuto: string;
  appleCarPlay: string;
  armrest: string;
  autoTintedMirror: string;
  additionalHeating: string;
  bluetooth: string;
  cargoBarrier: string;
  cdPlayer: string;
  dabRadio: string;
  digitalCockpit: string;
  disabledAccess: string;
  electricRearSeats: string;
  electricSeats: string;
  electricSeatsMemory: string;
  electricWindows: string;
  emergencyCallSystem: string;
  fatigueWarning: string;
  foldingRearSeats: string;
  foldingMirrors: string;
  handsFreeSystem: string;
  headUpDisplay: string;
  heatedRearSeats: string;
  heatedSeats: string;
  heatedSteeringWheel: string;
  wirelessCharging: string;
  integratedMusicStreaming: string;
  isofix: string;
  leatherSteeringWheel: string;
  lumbarSupport: string;
  massageSeats: string;
  multifunctionalSteeringWheel: string;
  navigation: string;
  onBoardComputer: string;
  paddleShifters: string;
  passengerIsofix: string;
  seatVentilation: string;
  rightHandDrive: string;
  skiBag: string;
  smokersPackage: string;
  audioSystem: string;
  sportsSeats: string;
  touchscreen: string;
  tunerRadio: string;
  tv: string;
  usbPort: string;
  virtualMirrors: string;
  voiceControl: string;
  winterPackage: string;
  wlanWifiHotspot: string;
  // Offer details
  offerDetails: string;
  seller: string;
  dealerRating: string;
  listingOnlineSince: string;
  specialOptions: string;
  listingsWithPhotos: string;
  listingsWithVideo: string;
  discountOffers: string;
  nonSmokerCar: string;
  taxi: string;
  vatDeductible: string;
  warranty: string;
  damagedVehicles: string;
  dontShow: string;
  commercialExportImport: string;
  approvedUsedCarProgram: string;
  select: string;
  // Location
  location: string;
  country: string;
  cityZipCode: string;
  radius: string;
  tenKm: string;
  deliveryOffers: string;
  showOnlyDeliveryOffers: string;
  searchInDescription: string;
  descriptionPlaceholder: string;
  enterKeywords: string;
  resetFilters: string;
  searchCars: string;
  searchResults: string;
  applyFiltersAbove: string;
  fuelTankVolume: string;
  liters: string;
  weight: string;
  kg: string;
  cylinder: string;
  driveType: string;
  allWheelDrive: string;
  frontWheelDrive: string;
  rearWheelDrive: string;
  transmission: string;
  automatic: string;
  semiAutomatic: string;
  manualGearbox: string;
  fuelConsumption: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: string;
  // Fuel types
  petrol: string;
  diesel: string;
  electric: string;
  ethanol: string;
  hybridDieselElectric: string;
  hybridPetrolElectric: string;
  hydrogen: string;
  lpg: string;
  naturalGas: string;
  pluginHybrid: string;
  // Colors
  black: string;
  beige: string;
  grey: string;
  brown: string;
  white: string;
  orange: string;
  blue: string;
  yellow: string;
  red: string;
  green: string;
  silver: string;
  gold: string;
  purple: string;
  matte: string;
  metallic: string;
  // Exterior features
  exterior: string;
  trailerCoupling: string;
  trailerAssist: string;
  trailerLoadBraked: string;
  trailerLoadUnbraked: string;
  noseWeight: string;
  parkingSensors: string;
  camera360: string;
  camera: string;
  front: string;
  rear: string;
  rearTrafficAlert: string;
  selfSteeringSystems: string;
  cruiseControl: string;
  adaptiveCruiseControl: string;
  others: string;
  // Safety and convenience features
  abs: string;
  adaptiveLighting: string;
  airSuspension: string;
  allSeasonTyres: string;
  alloyWheels: string;
  bixenonHeadlights: string;
  blindSpotAssist: string;
  centralLocking: string;
  daytimeRunningLights: string;
  distanceWarning: string;
  dynamicChassisControl: string;
  electricTailgate: string;
  emergencyBrakeAssist: string;
  emergencyTyre: string;
  emergencyTyreRepairKit: string;
  esp: string;
  fogLamps: string;
  foldingRoof: string;
  fourWheelDrive: string;
  glareFreeHeadlights: string;
  headlightWasher: string;
  heatedWindshield: string;
  highBeamAssist: string;
  hillStartAssist: string;
  immobilizer: string;
  keylessCentralLocking: string;
  laneChangeAssist: string;
  laserHeadlights: string;
  ledHeadlights: string;
  ledRunningLights: string;
  lightSensor: string;
  nightVisionAssist: string;
  panoramicRoof: string;
  powerAssistedSteering: string;
  rainSensor: string;
  roofRack: string;
  spareTyre: string;
  speedLimitControl: string;
  sportsPackage: string;
  sportsSuspension: string;
  startStopSystem: string;
  steelWheels: string;
  summerTyres: string;
  sunroof: string;
  tintedWindows: string;
  tractionControl: string;
  trafficSignRecognition: string;
  tyrePressureMonitoring: string;
  winterTyres: string;
  xenonHeadlights: string;
  // Interior
  interior: string;
  interiorMaterial: string;
  cloth: string;
  leather: string;
  partLeather: string;
  alcantara: string;
  velour: string;
  // Offer details
  offerDetails: string;
  dealer: string;
  private: string;
  garage: string;
  warranty: string;
  extendedWarranty: string;
  noWarranty: string;
  serviceHistory: string;
  fullServiceHistory: string;
  partialServiceHistory: string;
  noServiceHistory: string;
  accidentFree: string;
  damaged: string;
  roadworthy: string;
  notRoadworthy: string;
  huValid: string;
  numberOfOwners: string;
  availability: string;
  available: string;
  reserved: string;
  sold: string;
  delivery: string;
  deliveryAvailable: string;
  pickupOnly: string;
  // Additional vehicle data fields
  vehicleType: string;
  numberOfSeats: string;
  numberOfDoors: string;
  slidingDoor: string;
  paymentType: string;
  buy: string;
  leasing: string;
  price: string;
  firstRegistrationDate: string;
  mileage: string;
  country: string;
  cityZipCode: string;
  radius: string;
  additionalOffersWithDelivery: string;
  preRegistration: string;
  employeesCar: string;
  classicVehicle: string;
  demonstrationVehicle: string;
  // Fuel type options
  gasolineFuel: string;
  dieselFuel: string;
  electricFuel: string;
  ethanolFuel: string;
  hybridDieselElectric: string;
  hybridGasolineElectric: string;
  hydrogenFuel: string;
  lpgFuel: string;
  naturalGasFuel: string;
  otherFuel: string;
  pluginHybridFuel: string;
  // Interior colors
  interiorBlack: string;
  interiorBeige: string;
  interiorBlue: string;
  interiorBrown: string;
  interiorGray: string;
  interiorRed: string;
  interiorOther: string;
  // Interior materials
  alcantara: string;
  fabric: string;
  artificialLeather: string;
  partialLeather: string;
  fullLeather: string;
  velour: string;
  materialOther: string;
  // Countries
  bulgaria: string;
  germany: string;
  austria: string;
  switzerland: string;
  countryOther: string;
  // Bulgarian cities
  sofia: string;
  plovdiv: string;
  varna: string;
  burgas: string;
  ruse: string;
  staraZagora: string;
  pleven: string;
  dobrich: string;
  sliven: string;
  shumen: string;
  pernik: string;
  haskovo: string;
  // Placeholders
  fromPlaceholder: string;
  toPlaceholder: string;
  exampleYear: string;
  // Vehicle condition options
  newCondition: string;
  usedCondition: string;
  preRegistrationCondition: string;
  employeeCondition: string;
  classicCondition: string;
  demonstrationCondition: string;
  // Common options
  allOptions: string;
  purchaseOption: string;
  leasingOption: string;
  yesOption: string;
  noOption: string;
}
interface BaseFooter {
  about: {
    title: string;
    description: string;
  };
  quickLinks: {
    title: string;
    home: string;
    cars: string;
    sell: string;
    about: string;
    contact: string;
    help: string;
    advancedSearch: string;
  };
  categories: {
    title: string;
    sedan: string;
    suv: string;
    hatchback: string;
    coupe: string;
    convertible: string;
    wagon: string;
  };
  contact: {
    title: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  copyright: {
    rights: string;
  };
  links: {
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    sitemap: string;
  };
  legal: {
    privacy: string;
    terms: string;
    cookies: string;
    sitemap: string;
  };
}
interface SellSteps { 0: string; 1: string; 2: string; 3: string; 4: string; 5: string; 6: string }
interface BaseSell {
  hero: { title: string; subtitle: string; startNow: string };
  features: {
    fast: { title: string; description: string };
    mobile: { title: string; description: string };
    secure: { title: string; description: string };
    free: { title: string; description: string };
    audience: { title: string; description: string };
    analytics: { title: string; description: string };
  };
  howItWorks: { title: string; steps: SellSteps };
  start: { chooseTypeTitle: string; chooseTypeSubtitle: string; continue: string; processInfoTitle: string; processInfoText: string };
}
interface HomeStats { cars: string; satisfiedCustomers: string; dealers: string; satisfaction: string }
interface HomeFeatured { title: string; subtitle: string; viewAll: string }
interface HomeFeatureItem { title: string; description: string }
interface HomeFeatures { title: string; subtitle: string; search: HomeFeatureItem; verified: HomeFeatureItem; finance: HomeFeatureItem; insurance: HomeFeatureItem }
interface HomeTranslations { hero: { title: string; subtitle: string; browseCars: string; sellCar: string }; stats: HomeStats; featured: HomeFeatured; features: HomeFeatures }
interface BaseMessaging {
  title: string;
  subtitle: string;
}
interface RootTranslations { nav: Record<string, string>; home: HomeTranslations; cars: BaseCars; searchResults: BaseSearchResults; carSearch: BaseCarSearch; common: BaseCommon; ratings: BaseRatings; advancedSearch: BaseAdvancedSearch; sell: BaseSell; settings: BaseSettings; messaging: BaseMessaging; footer: BaseFooter }

export const translations: Record<BulgarianLanguage, RootTranslations> = {
  bg: {
    nav: { home: 'Начало', cars: 'Коли', sell: 'Продай', advancedSearch: 'Разширено търсене', settings: 'Настройки', login: 'Вход', register: 'Регистрация', logout: 'Изход' },
    home: { 
      hero: { title: 'Намери кола', subtitle: 'Хиляди обяви', browseCars: 'Разгледай', sellCar: 'Продай' },
      stats: {
        cars: '15 000+',
        satisfiedCustomers: '8 500+',
        dealers: '500+',
        satisfaction: '98%'
      },
      featured: {
        title: 'Препоръчани автомобили',
        subtitle: 'Подбрани оферти с високо качество',
        viewAll: 'Виж всички'
      },
      features: {
        title: 'Защо да изберете нас',
        subtitle: 'Инструменти и услуги, които ви помагат да купувате и продавате по-умно',
        search: { title: 'Мощно търсене', description: 'Филтрирайте по стотици критерии и намерете точния автомобил.' },
        verified: { title: 'Проверени обяви', description: 'Ръчно и автоматично валидиране за по-висока сигурност.' },
        finance: { title: 'Финансови опции', description: 'Лизинг и кредитни калкулатори директно в платформата.' },
        insurance: { title: 'Застраховка', description: 'Предложения за подходящи застраховки след покупка.' }
      }
    },
    cars: { title: 'Търсене на коли', subtitle: 'Нови и употребявани', featured: 'Акцент', results: { title: 'Резултати', found: 'намерени' }, sort: { newest: 'Най-нови', oldest: 'Най-стари', priceLow: 'Цена ↑', priceHigh: 'Цена ↓', yearNew: 'Нова година', yearOld: 'Стара година', mileageLow: 'Нисък пробег', mileageHigh: 'Висок пробег' }, noResults: { title: 'Няма резултати', message: 'Променете критериите', clearFilters: 'Изчисти' } },
    searchResults: { loading: 'Зареждане...', empty: 'Няма резултати', count: '{{count}} резултата', sort: { relevance: 'Релевантност', price: 'Цена', date: 'Дата', mileage: 'Пробег', year: 'Година' }, view: { grid: 'Мрежа', list: 'Списък' }, badges: { promoted: 'Платено', new: 'Ново', featured: 'Акцент' }, actions: { favorite: 'Любимо', unfavorite: 'Премахни' } },
    carSearch: {
      title: 'Детайлно търсене на коли',
      tabs: { search: 'Търсене', filters: 'Филтри', popular: 'Популярни', trending: 'Тенденции' },
      advanced: { title: 'Разширени опции' },
      filters: { title: 'Филтри' },
      reset: 'Изчисти',
      search: 'Търси',
      searching: 'Търсене...',
      showAdvanced: 'Покажи разширени',
      showFilters: 'Покажи филтрите',
      basicData: 'Основни данни',
      make: 'Марка',
      model: 'Модел',
      minPrice: 'Мин. цена (€)',
      maxPrice: 'Макс. цена (€)',
      typeAndCondition: 'Тип и състояние',
      condition: 'Състояние',
      new: 'Нов',
      used: 'Употребяван',
      fuelType: 'Вид гориво',
      petrol: 'Бензин',
      diesel: 'Дизел',
      electric: 'Електрически',
      hybrid: 'Хибрид'
    },
    settings: {
      title: 'Настройки',
      language: 'Език',
      dashboard: 'Табло',
      analytics: 'Аналитика',
      digitalTwin: 'Цифров двойник',
      subscription: 'Абонамент',
      boldText: 'Важно',
      enableBoldText: 'Активирай удебелен текст',
      disableBoldText: 'Деактивирай удебелен текст'
    },
    messaging: {
      title: 'Съобщения',
      subtitle: 'Управлявайте съобщенията си и комуникирайте с търговци'
    },
    sell: {
      hero: {
        title: 'Продай автомобила си лесно',
        subtitle: 'Публикувай обява за минути и достигни до стотици купувачи',
        startNow: 'Започни сега'
      },
      features: {
        fast: { title: 'Бързо публикуване', description: 'Създай професионална обява само с няколко стъпки.' },
        mobile: { title: 'Мобилно управление', description: 'Редактирай и следи обявата си от всяко устройство.' },
        secure: { title: 'Сигурност', description: 'Защитаваме данните ти и филтрираме измами.' },
        free: { title: 'Безплатно', description: 'Основното публикуване е без такса.' },
        audience: { title: 'Голяма аудитория', description: 'Достигни до реални купувачи от цяла България.' },
        analytics: { title: 'Статистика', description: 'Виж прегледи, интерес и потенциални купувачи.' }
      },
      howItWorks: {
        title: 'Как работи',
        steps: {
          0: '1. Създай профил или влез.',
          1: '2. Въведи данни за автомобила.',
            2: '3. Качи качествени снимки.',
            3: '4. Определи цена и условия.',
            4: '5. Публикувай и сподели.',
            5: '6. Отговаряй на запитвания.',
            6: '7. Завърши сделката безопасно.'
        }
      },
      start: {
        chooseTypeTitle: 'Изберете тип превозно средство',
        chooseTypeSubtitle: 'Изберете категорията на превозното средство което искате да публикувате',
        continue: 'Продължи',
        processInfoTitle: 'Процес на публикуване',
        processInfoText: 'Можете да допълните или редактирате обявата по всяко време преди публикуване.'
      }
    },
    common: {
      loading: 'Зареждане...',
      close: 'Затвори',
      all: 'Всички',
      yes: 'Да',
      no: 'Не',
      valid: 'Валиден',
      expired: 'Изтекъл',
      expiringSoon: 'Изтича скоро',
      add: 'Добави',
      cancel: 'Отказ',
      submitting: 'Изпращане...'
    },
    ratings: {
      addReview: 'Добави отзив',
      overallRating: 'Обща оценка',
      stars: 'звезди',
      selectRating: 'Изберете оценка',
      categoryRatings: 'Оценки по категории',
      for: 'за',
      reviewTitle: 'Заглавие на отзива',
      titlePlaceholder: 'Въведете заглавие...',
      reviewComment: 'Коментар',
      submitReview: 'Публикувай отзив',
      loadMore: 'Зареди още',
      categories: {
        reliability: 'Надеждност',
        performance: 'Производителност',
        comfort: 'Комфорт',
        value: 'Стойност за парите',
        design: 'Дизайн'
      },
      errors: {
        noRating: 'Моля, поставете обща оценка',
        noTitle: 'Моля, въведете заглавие',
        noComment: 'Моля, въведете коментар',
        unratedCategories: 'Моля, оценете всички категории',
        submitFailed: 'Грешка при публикуване на отзива'
      }
    },
    advancedSearch: {
      title: 'Подробно търсене: Коли – нови или употребявани',
      subtitle: 'Намерете идеалната кола с нашата разширена система за търсене',
      reset: 'Нулирай филтрите',
      search: 'Търси коли',
      searching: 'Търсене...',
      saveSearch: 'Запази това търсене',
      basicData: 'Основни данни',
      make: 'Марка',
      model: 'Модел',
      modelPlaceholder: 'например: GTI …',
      vehicleType: 'Тип превозно средство',
      numberOfSeats: 'Брой места',
      numberOfDoors: 'Брой врати',
      slidingDoor: 'Плъзгаща се врата',
      typeAndCondition: 'Тип и състояние',
      paymentType: 'Тип плащане',
      price: 'Цена',
      firstRegistration: 'Първа регистрация',
      mileage: 'Пробег',
      huValidUntil: 'HU поне валиден до',
      huPlaceholder: 'например: 2025',
      numberOfOwners: 'Брой собственици',
      fullServiceHistory: 'Пълна сервизна история',
      roadworthy: 'Пътно способен',
      // Vehicle types
      cabriolet: 'Кабриолет/ Родстър',
      estate: 'Комби',
      offroad: 'Джип/ Пикап/ SUV',
      saloon: 'Седан',
      small: 'Малък автомобил',
      sports: 'Спортен/ Купе',
      van: 'Ван/ Микробус',
      // Conditions
      new: 'Нови',
      used: 'Употребявани',
      preRegistration: 'Предварителна регистрация',
      employeeCar: 'Служебен автомобил',
      classic: 'Класически',
      demonstration: 'Демонстрационен',
      // Payment types
      buy: 'Покупка',
      leasing: 'Лизинг',
      // Common values
      any: 'Всички',
      all: 'Всички',
      yes: 'Да',
      no: 'Не',
      from: 'от',
      to: 'до',
      euro: '€',
      km: 'km',
      german: 'Немски',
      japanese: 'Японски',
      american: 'Американски',
      korean: 'Корейски',
      french: 'Френски',
      italian: 'Италиански',
      swedish: 'Шведски',
      other: 'Други',
      fuelType: 'Вид гориво',
      exteriorColour: 'Външен цвят',
      interiorColour: 'Вътрешен цвят',
      sellerType: 'Тип продавач',
      // Technical data
      technicalData: 'Технически данни',
      power: 'Мощност',
      hp: 'к.с.',
      kw: 'кW',
      cubicCapacity: 'Работен обем',
      ccm: 'куб.см',
      fuelTankVolume: 'Обем на резервоара',
      liters: 'л',
      weight: 'Тегло',
      kg: 'кг',
      cylinder: 'Цилиндри',
      driveType: 'Тип задвижване',
      allWheelDrive: 'Задвижване на всички колела',
      frontWheelDrive: 'Предно задвижване',
      rearWheelDrive: 'Задно задвижване',
      transmission: 'Трансмисия',
      automatic: 'Автоматична',
      semiAutomatic: 'Полуавтоматична',
      manualGearbox: 'Ръчна скоростна кутия',
      fuelConsumption: 'Разход на гориво (комбиниран) до',
      emissionSticker: 'Екологичен стикер',
      emissionClass: 'Екологичен клас',
      particulateFilter: 'Филтър за твърди частици',
      // Fuel types
      petrol: 'Бензин',
      diesel: 'Дизел',
      electric: 'Електрически',
      ethanol: 'Етанол (FFV, E85 и др.)',
      hybridDieselElectric: 'Хибрид (дизел/електрически)',
      hybridPetrolElectric: 'Хибрид (бензин/електрически)',
      hydrogen: 'Водород',
      lpg: 'ГНП',
      naturalGas: 'Природен газ',
      pluginHybrid: 'Plug-in хибрид',
      // Colors
      black: 'Черен',
      beige: 'Бежов',
      grey: 'Сив',
      brown: 'Кафяв',
      white: 'Бял',
      orange: 'Оранжев',
      blue: 'Син',
      yellow: 'Жълт',
      red: 'Червен',
      green: 'Зелен',
      silver: 'Сребрист',
      gold: 'Златист',
      purple: 'Лилав',
      matte: 'Мат',
      metallic: 'Металик',
      // Exterior features
      exterior: 'Външно оборудване',
      trailerCoupling: 'Теглич',
      trailerAssist: 'Помощ при теглене',
      trailerLoadBraked: 'Товар на ремарке със спирачки от',
      trailerLoadUnbraked: 'Товар на ремарке без спирачки от',
      noseWeight: 'Натоварване на теглича',
      parkingSensors: 'Сензори за паркиране',
      camera360: '360° камера',
      camera: 'Камера',
      front: 'Предна',
      rear: 'Задна',
      rearTrafficAlert: 'Предупреждение за задно движение',
      selfSteeringSystems: 'Системи за самоуправление',
      cruiseControl: 'Круиз контрол',
      adaptiveCruiseControl: 'Адаптивен круиз контрол',
      others: 'Други',
      // Safety and convenience features
      abs: 'ABS',
      adaptiveLighting: 'Адаптивно осветление',
      airSuspension: 'Въздушно окачване',
      allSeasonTyres: 'Всесезонни гуми',
      alloyWheels: 'Алуминиеви джанти',
      bixenonHeadlights: 'Bi-xenon фарове',
      blindSpotAssist: 'Помощ при сляпа зона',
      centralLocking: 'Централно заключване',
      daytimeRunningLights: 'Дневни светлини',
      distanceWarning: 'Система за предупреждение за разстояние',
      dynamicChassisControl: 'Динамично управление на шасито',
      electricTailgate: 'Електрически багажник',
      emergencyBrakeAssist: 'Помощ при спиране в извънредна ситуация',
      emergencyTyre: 'Резервна гума за извънредни ситуации',
      emergencyTyreRepairKit: 'Комплект за ремонт на гуми',
      esp: 'ESP',
      fogLamps: 'Противомъглени фарове',
      foldingRoof: 'Сгъваем покрив',
      fourWheelDrive: 'Задвижване на четири колела',
      glareFreeHeadlights: 'Фарове без заслепяване',
      headlightWasher: 'Система за миене на фаровете',
      heatedWindshield: 'Подгряване на предното стъкло',
      highBeamAssist: 'Помощ за далечни светлини',
      hillStartAssist: 'Помощ при тръгване по наклон',
      immobilizer: 'Имобилайзер',
      keylessCentralLocking: 'Безключово централно заключване',
      laneChangeAssist: 'Помощ при смяна на лента',
      laserHeadlights: 'Лазерни фарове',
      ledHeadlights: 'LED фарове',
      ledRunningLights: 'LED дневни светлини',
      lightSensor: 'Светлинен сензор',
      nightVisionAssist: 'Помощ за нощно виждане',
      panoramicRoof: 'Панорамен покрив',
      powerAssistedSteering: 'Усилвател на волана',
      rainSensor: 'Сензор за дъжд',
      roofRack: 'Багажник на покрива',
      spareTyre: 'Резервна гума',
      speedLimitControl: 'Система за контрол на скоростта',
      sportsPackage: 'Спортен пакет',
      sportsSuspension: 'Спортно окачване',
      startStopSystem: 'Start-stop система',
      steelWheels: 'Железни джанти',
      summerTyres: 'Летни гуми',
      sunroof: 'Слънчев покрив',
      tintedWindows: 'Затъмнени стъкла',
      tractionControl: 'Контрол на сцеплението',
      trafficSignRecognition: 'Разпознаване на пътни знаци',
      tyrePressureMonitoring: 'Мониторинг на налягането в гумите',
      winterTyres: 'Зимни гуми',
      xenonHeadlights: 'Xenon фарове',
      // Interior
      interior: 'Интериор',
      interiorMaterial: 'Материал на интериора',
      cloth: 'Плат',
      leather: 'Кожа',
      partLeather: 'Частична кожа',
      alcantara: 'Алкантара',
      velour: 'Велур',
      // Offer details
      offerDetails: 'Детайли за офертата',
      dealer: 'Дилър',
      private: 'Частен',
      garage: 'Гараж',
      warranty: 'Гаранция',
      extendedWarranty: 'Удължена гаранция',
      noWarranty: 'Без гаранция',
      serviceHistory: 'История на обслужване',
      partialServiceHistory: 'Частична история на обслужване',
      noServiceHistory: 'Без история на обслужване',
      accidentFree: 'Без произшествия',
      damaged: 'Повреден',
      notRoadworthy: 'Не е годен за движение',
      huValid: 'Валиден технически преглед',
      availability: 'Наличност',
      available: 'Наличен',
      reserved: 'Резервиран',
      sold: 'Продаден',
      delivery: 'Доставка',
      deliveryAvailable: 'Възможна доставка',
      pickupOnly: 'Само за вземане',
      // Additional fields
      firstRegistrationDate: 'Дата на първа регистрация',
      country: 'Държава',
      cityZipCode: 'Град / пощенски код',
      radius: 'Радиус',
      additionalOffersWithDelivery: 'Допълнителни оферти с доставка',
      employeesCar: 'Служебна кола',
      classicVehicle: 'Класически автомобил',
      demonstrationVehicle: 'Демонстрационен автомобил',
      // Fuel type options
      gasolineFuel: 'Бензин',
      dieselFuel: 'Дизел',
      electricFuel: 'Електрически',
      ethanolFuel: 'Етанол (FFV, E85, etc.)',
      hybridDieselElectric: 'Хибриден (дизел/електрически)',
      hybridGasolineElectric: 'Хибриден (бензин/електрически)',
      hydrogenFuel: 'Водород',
      lpgFuel: 'LPG',
      naturalGasFuel: 'Природен газ',
      otherFuel: 'Други',
      pluginHybridFuel: 'Plug-in хибрид',
      // Interior colors
      interiorBlack: 'Черен',
      interiorBeige: 'Бежов',
      interiorBlue: 'Син',
      interiorBrown: 'Кафяв',
      interiorGray: 'Сив',
      interiorRed: 'Червен',
      interiorOther: 'Други',
      // Interior materials
      alcantara: 'Алкантара',
      fabric: 'Плат',
      artificialLeather: 'Изкуствена кожа',
      partialLeather: 'Частична кожа',
      fullLeather: 'Пълна кожа',
      velour: 'Велур',
      materialOther: 'Други',
      // Countries
      bulgaria: 'България',
      germany: 'Германия',
      austria: 'Австрия',
      switzerland: 'Швейцария',
      countryOther: 'Други',
      // Bulgarian cities
      sofia: 'София',
      plovdiv: 'Пловдив',
      varna: 'Варна',
      burgas: 'Бургас',
      ruse: 'Русе',
      staraZagora: 'Стара Загора',
      pleven: 'Плевен',
      dobrich: 'Добрич',
      sliven: 'Сливен',
      shumen: 'Шумен',
      pernik: 'Перник',
      haskovo: 'Хасково',
      // Placeholders
      fromPlaceholder: 'от',
      toPlaceholder: 'до',
      exampleYear: 'например: 2025',
      // Vehicle condition options
      newCondition: 'Нови',
      usedCondition: 'Употребявани',
      preRegistrationCondition: 'Предварителна регистрация',
      employeeCondition: 'Служебен автомобил',
      classicCondition: 'Класически',
      demonstrationCondition: 'Демонстрационен',
      // Common options
      allOptions: 'Всички',
      purchaseOption: 'Покупка',
      leasingOption: 'Лизинг',
      yesOption: 'Да',
      noOption: 'Не'
    },
    footer: {
      about: {
        title: 'За нас',
        description: 'Вашият доверен партньор в намирането на перфектната кола в България. Свързваме купувачи и продавачи с качествени превозни средства и изключително обслужване.'
      },
      quickLinks: {
        title: 'Бързи връзки',
        home: 'Начало',
        cars: 'Коли',
        sell: 'Продай кола',
        about: 'За нас',
        contact: 'Контакт',
        help: 'Помощ',
        advancedSearch: 'Разширено търсене'
      },
      categories: {
        title: 'Категории',
        sedan: 'Седан',
        suv: 'SUV',
        hatchback: 'Хечбек',
        coupe: 'Купе',
        convertible: 'Кабрио',
        wagon: 'Комби'
      },
      contact: {
        title: 'Информация за контакт',
        address: 'София, България',
        phone: '+359 2 123 4567',
        email: 'info@globulcars.bg',
        website: 'www.globulcars.bg'
      },
      copyright: {
        rights: 'Всички права запазени.'
      },
      links: {
        privacyPolicy: 'Политика за поверителност',
        termsOfService: 'Условия за ползване',
        cookiePolicy: 'Политика за бисквитки',
        sitemap: 'Карта на сайта'
      },
      legal: {
        privacy: 'Политика за поверителност',
        terms: 'Условия за ползване',
        cookies: 'Политика за бисквитки',
        sitemap: 'Карта на сайта'
      }
    }
  },
  en: {
    nav: { home: 'Home', cars: 'Cars', sell: 'Sell', advancedSearch: 'Advanced Search', settings: 'Settings', login: 'Login', register: 'Register', logout: 'Logout' },
    home: { 
      hero: { title: 'Find a Car', subtitle: 'Thousands of listings', browseCars: 'Browse', sellCar: 'Sell' },
      stats: {
        cars: '15,000+',
        satisfiedCustomers: '8,500+',
        dealers: '500+',
        satisfaction: '98%'
      },
      featured: {
        title: 'Featured Cars',
        subtitle: 'Curated high-quality listings',
        viewAll: 'View All'
      },
      features: {
        title: 'Why Choose Us',
        subtitle: 'Tools and services to help you buy and sell smarter',
        search: { title: 'Powerful Search', description: 'Filter across hundreds of criteria to find the perfect car.' },
        verified: { title: 'Verified Listings', description: 'Manual and automated validation for higher trust.' },
        finance: { title: 'Finance Options', description: 'Leasing and loan calculators built in.' },
        insurance: { title: 'Insurance', description: 'Get tailored insurance offers after purchase.' }
      }
    },
    cars: { title: 'Car Search', subtitle: 'New and used', featured: 'Featured', results: { title: 'Search Results', found: 'cars found' }, sort: { newest: 'Newest', oldest: 'Oldest', priceLow: 'Price (Low)', priceHigh: 'Price (High)', yearNew: 'Newest Year', yearOld: 'Oldest Year', mileageLow: 'Lowest Mileage', mileageHigh: 'Highest Mileage' }, noResults: { title: 'No Results', message: 'Try changing your search criteria or clear the filters', clearFilters: 'Clear Filters' } },
    searchResults: { 
      loading: 'Loading...', 
      empty: 'No results found', 
      count: '{{count}} results found', 
      sort: { relevance: 'Relevance', price: 'Price', date: 'Date', mileage: 'Mileage', year: 'Year' }, 
      view: { grid: 'Grid', list: 'List' }, 
      badges: { promoted: 'Promoted', new: 'New', featured: 'Featured' }, 
      actions: { favorite: 'Favorite', unfavorite: 'Unfavorite' } 
    },
    carSearch: {
      title: 'Detailed Search: Cars – new or used',
      tabs: { search: 'Search', filters: 'Filters', popular: 'Popular', trending: 'Trending' },
      advanced: { title: 'Advanced Options' },
      filters: { title: 'Filters' },
      reset: 'Reset',
      search: 'Search',
      searching: 'Searching...',
      showAdvanced: 'Show advanced',
      showFilters: 'Show filters',
      basicData: 'Basic Data',
      make: 'Make',
      model: 'Model',
      minPrice: 'Min Price (€)',
      maxPrice: 'Max Price (€)',
      typeAndCondition: 'Type and condition',
      condition: 'Condition',
      new: 'New',
      used: 'Used',
      fuelType: 'Fuel Type',
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      digitalTwin: 'Digital Twin',
      subscription: 'Subscription',
      boldText: 'Important',
      enableBoldText: 'Enable bold text',
      disableBoldText: 'Disable bold text'
    },
    messaging: {
      title: 'Messaging',
      subtitle: 'Manage your messages and communicate with dealers'
    },
    sell: {
      hero: {
        title: 'Sell your car easily',
        subtitle: 'Publish a listing in minutes and reach hundreds of buyers',
        startNow: 'Start now'
      },
      features: {
        fast: { title: 'Fast listing', description: 'Create a professional listing in just a few steps.' },
        mobile: { title: 'Mobile friendly', description: 'Edit and monitor your listing from any device.' },
        secure: { title: 'Secure', description: 'We protect your data and filter fraud attempts.' },
        free: { title: 'Free', description: 'Basic publishing has no fee.' },
        audience: { title: 'Broad audience', description: 'Reach real buyers across Bulgaria.' },
        analytics: { title: 'Analytics', description: 'See views, interest and potential buyers.' }
      },
      howItWorks: {
        title: 'How it works',
        steps: {
          0: '1. Create an account or sign in.',
          1: '2. Enter the vehicle details.',
          2: '3. Upload quality photos.',
          3: '4. Set price and conditions.',
          4: '5. Publish and share.',
          5: '6. Respond to inquiries.',
          6: '7. Close the deal safely.'
        }
      },
      start: {
        chooseTypeTitle: 'Select vehicle type',
        chooseTypeSubtitle: 'Choose the type of vehicle you want to list',
        continue: 'Continue',
        processInfoTitle: 'Listing Process',
        processInfoText: 'You can complete or edit your listing at any time before publishing.'
      }
    },
    common: {
      loading: 'Loading...',
      close: 'Close',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      valid: 'Valid',
      expired: 'Expired',
      expiringSoon: 'Expiring Soon',
      add: 'Add',
      cancel: 'Cancel',
      submitting: 'Submitting...'
    },
    ratings: {
      addReview: 'Add Review',
      overallRating: 'Overall Rating',
      stars: 'stars',
      selectRating: 'Select Rating',
      categoryRatings: 'Category Ratings',
      for: 'for',
      reviewTitle: 'Review Title',
      titlePlaceholder: 'Enter title...',
      reviewComment: 'Comment',
      submitReview: 'Submit Review',
      loadMore: 'Load More',
      categories: {
        reliability: 'Reliability',
        performance: 'Performance',
        comfort: 'Comfort',
        value: 'Value for Money',
        design: 'Design'
      },
      errors: {
        noRating: 'Please provide an overall rating',
        noTitle: 'Please enter a title',
        noComment: 'Please enter a comment',
        unratedCategories: 'Please rate all categories',
        submitFailed: 'Failed to submit review'
      }
    },
    advancedSearch: {
      title: 'Detailed Search: Cars – new or used',
      subtitle: 'Find the perfect car with our advanced search system',
      reset: 'Reset filters',
      search: 'Search cars',
      searching: 'Searching...',
      saveSearch: 'Save this search',
      basicData: 'Basic Data',
      make: 'Make',
      model: 'Model',
      modelPlaceholder: 'e.g.: GTI …',
      vehicleType: 'Vehicle Type',
      numberOfSeats: 'Number of seats',
      numberOfDoors: 'Number of doors',
      slidingDoor: 'Sliding door',
      typeAndCondition: 'Type and condition',
      paymentType: 'Payment type',
      price: 'Price',
      firstRegistration: 'First registration',
      mileage: 'Mileage',
      huValidUntil: 'HU at least valid until',
      huPlaceholder: 'e.g.: 2025',
      numberOfOwners: 'Number of owners',
      fullServiceHistory: 'Full service history',
      roadworthy: 'Roadworthy',
      // Vehicle types
      cabriolet: 'Cabriolet/Roadster',
      estate: 'Estate',
      offroad: 'Off-road/Pickup/SUV',
      saloon: 'Saloon',
      small: 'Small car',
      sports: 'Sports car/Coupe',
      van: 'Van/Mini bus',
      // Conditions
      new: 'New',
      used: 'Used',
      preRegistration: 'Pre-registration',
      employeeCar: 'Employee car',
      classic: 'Classic',
      demonstration: 'Demonstration',
      // Payment types
      buy: 'Buy',
      leasing: 'Leasing',
      // Common values
      any: 'Any',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      from: 'from',
      to: 'to',
      euro: '€',
      km: 'km',
      german: 'German',
      japanese: 'Japanese',
      american: 'American',
      korean: 'Korean',
      french: 'French',
      italian: 'Italian',
      swedish: 'Swedish',
      other: 'Other',
      fuelType: 'Fuel Type',
      exteriorColour: 'Exterior Colour',
      interiorColour: 'Interior Colour',
      sellerType: 'Seller Type',
      // Technical data
      technicalData: 'Technical data',
      power: 'Power',
      hp: 'hp',
      kw: 'kW',
      cubicCapacity: 'Cubic Capacity',
      ccm: 'ccm',
      fuelTankVolume: 'Fuel tank volume',
      liters: 'l',
      weight: 'Weight',
      kg: 'kg',
      cylinder: 'Cylinder',
      driveType: 'Drive type',
      allWheelDrive: 'All wheel drive',
      frontWheelDrive: 'Front wheel drive',
      rearWheelDrive: 'Rear wheel drive',
      transmission: 'Transmission',
      automatic: 'Automatic',
      semiAutomatic: 'Semi-automatic',
      manualGearbox: 'Manual gearbox',
      fuelConsumption: 'Fuel consumption (combined) up to',
      emissionSticker: 'Emission Sticker',
      emissionClass: 'Emission Class',
      particulateFilter: 'Particulate filter',
      // Fuel types
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      ethanol: 'Ethanol (FFV, E85, etc.)',
      hybridDieselElectric: 'Hybrid (diesel/electric)',
      hybridPetrolElectric: 'Hybrid (petrol/electric)',
      hydrogen: 'Hydrogen',
      lpg: 'LPG',
      naturalGas: 'Natural Gas',
      pluginHybrid: 'Plug-in hybrid',
      // Colors
      black: 'Black',
      beige: 'Beige',
      grey: 'Grey',
      brown: 'Brown',
      white: 'White',
      orange: 'Orange',
      blue: 'Blue',
      yellow: 'Yellow',
      red: 'Red',
      green: 'Green',
      silver: 'Silver',
      gold: 'Gold',
      purple: 'Purple',
      matte: 'Matte',
      metallic: 'Metallic',
      // Exterior features
      exterior: 'Exterior',
      trailerCoupling: 'Trailer coupling',
      trailerAssist: 'Trailer assist',
      trailerLoadBraked: 'Trailer load braked from',
      trailerLoadUnbraked: 'Trailer load unbraked from',
      noseWeight: 'Nose Weight',
      parkingSensors: 'Parking sensors',
      camera360: '360° Camera',
      camera: 'Camera',
      front: 'Front',
      rear: 'Rear',
      rearTrafficAlert: 'Rear traffic alert',
      selfSteeringSystems: 'Self-steering systems',
      cruiseControl: 'Cruise control',
      adaptiveCruiseControl: 'Adaptive Cruise Control',
      others: 'Others',
      // Safety and convenience features
      abs: 'ABS',
      adaptiveLighting: 'Adaptive lighting',
      airSuspension: 'Air suspension',
      allSeasonTyres: 'All season tyres',
      alloyWheels: 'Alloy wheels',
      bixenonHeadlights: 'Bi-xenon headlights',
      blindSpotAssist: 'Blind spot assist',
      centralLocking: 'Central locking',
      daytimeRunningLights: 'Daytime running lights',
      distanceWarning: 'Distance warning system',
      dynamicChassisControl: 'Dynamic chassis control',
      electricTailgate: 'Electric tailgate',
      emergencyBrakeAssist: 'Emergency brake assist',
      emergencyTyre: 'Emergency tyre',
      emergencyTyreRepairKit: 'Emergency tyre repair kit',
      esp: 'ESP',
      fogLamps: 'Fog lamps',
      foldingRoof: 'Folding roof',
      fourWheelDrive: 'Four wheel drive',
      glareFreeHeadlights: 'Glare-free high beam headlights',
      headlightWasher: 'Headlight washer system',
      heatedWindshield: 'Heated windshield',
      highBeamAssist: 'High beam assist',
      hillStartAssist: 'Hill-start assist',
      immobilizer: 'Immobilizer',
      keylessCentralLocking: 'Keyless central locking',
      laneChangeAssist: 'Lane change assist',
      laserHeadlights: 'Laser headlights',
      ledHeadlights: 'LED headlights',
      ledRunningLights: 'LED running lights',
      lightSensor: 'Light sensor',
      nightVisionAssist: 'Night vision assist',
      panoramicRoof: 'Panoramic roof',
      powerAssistedSteering: 'Power Assisted Steering',
      rainSensor: 'Rain sensor',
      roofRack: 'Roof rack',
      spareTyre: 'Spare tyre',
      speedLimitControl: 'Speed limit control system',
      sportsPackage: 'Sports package',
      sportsSuspension: 'Sports suspension',
      startStopSystem: 'Start-stop system',
      steelWheels: 'Steel wheels',
      summerTyres: 'Summer tyres',
      sunroof: 'Sunroof',
      tintedWindows: 'Tinted windows',
      tractionControl: 'Traction control',
      trafficSignRecognition: 'Traffic sign recognition',
      tyrePressureMonitoring: 'Tyre pressure monitoring',
      winterTyres: 'Winter tyres',
      xenonHeadlights: 'Xenon headlights',
      // Interior
      interior: 'Interior',
      interiorMaterial: 'Interior Material',
      cloth: 'Cloth',
      leather: 'Leather',
      partLeather: 'Part leather',
      alcantara: 'Alcantara',
      velour: 'Velour',
      // Offer details
      offerDetails: 'Offer Details',
      dealer: 'Dealer',
      private: 'Private',
      garage: 'Garage',
      warranty: 'Warranty',
      extendedWarranty: 'Extended warranty',
      noWarranty: 'No warranty',
      serviceHistory: 'Service History',
      partialServiceHistory: 'Partial service history',
      noServiceHistory: 'No service history',
      accidentFree: 'Accident Free',
      damaged: 'Damaged',
      notRoadworthy: 'Not roadworthy',
      huValid: 'HU Valid',
      availability: 'Availability',
      available: 'Available',
      reserved: 'Reserved',
      sold: 'Sold',
      delivery: 'Delivery',
      deliveryAvailable: 'Delivery available',
      pickupOnly: 'Pickup only',
      // Additional fields
      firstRegistrationDate: 'First Registration Date',
      country: 'Country',
      cityZipCode: 'City / zip code',
      radius: 'Radius',
      additionalOffersWithDelivery: 'Additional offers with delivery',
      employeesCar: 'Employee\'s car',
      classicVehicle: 'Classic Vehicle',
      demonstrationVehicle: 'Demonstration Vehicle',
      // Fuel type options
      gasolineFuel: 'Gasoline',
      dieselFuel: 'Diesel',
      electricFuel: 'Electric',
      ethanolFuel: 'Ethanol (FFV, E85, etc.)',
      hybridDieselElectric: 'Hybrid (diesel/electric)',
      hybridGasolineElectric: 'Hybrid (gasoline/electric)',
      hydrogenFuel: 'Hydrogen',
      lpgFuel: 'LPG',
      naturalGasFuel: 'Natural Gas',
      otherFuel: 'Other',
      pluginHybridFuel: 'Plug-in Hybrid',
      // Interior colors
      interiorBlack: 'Black',
      interiorBeige: 'Beige',
      interiorBlue: 'Blue',
      interiorBrown: 'Brown',
      interiorGray: 'Gray',
      interiorRed: 'Red',
      interiorOther: 'Other',
      // Interior materials
      alcantara: 'Alcantara',
      fabric: 'Fabric',
      artificialLeather: 'Artificial Leather',
      partialLeather: 'Partial Leather',
      fullLeather: 'Full Leather',
      velour: 'Velour',
      materialOther: 'Other',
      // Countries
      bulgaria: 'Bulgaria',
      germany: 'Germany',
      austria: 'Austria',
      switzerland: 'Switzerland',
      countryOther: 'Other',
      // Bulgarian cities
      sofia: 'Sofia',
      plovdiv: 'Plovdiv',
      varna: 'Varna',
      burgas: 'Burgas',
      ruse: 'Ruse',
      staraZagora: 'Stara Zagora',
      pleven: 'Pleven',
      dobrich: 'Dobrich',
      sliven: 'Sliven',
      shumen: 'Shumen',
      pernik: 'Pernik',
      haskovo: 'Haskovo',
      // Placeholders
      fromPlaceholder: 'from',
      toPlaceholder: 'to',
      exampleYear: 'e.g., 2025',
      // Vehicle condition options
      newCondition: 'New',
      usedCondition: 'Used',
      preRegistrationCondition: 'Pre-registration',
      employeeCondition: 'Employee Car',
      classicCondition: 'Classic',
      demonstrationCondition: 'Demonstration',
      // Common options
      allOptions: 'All',
      purchaseOption: 'Purchase',
      leasingOption: 'Leasing',
      yesOption: 'Yes',
      noOption: 'No'
    },
    footer: {
      about: {
        title: 'About Us',
        description: 'Your trusted partner in finding the perfect car in Bulgaria. We connect buyers and sellers with quality vehicles and exceptional service.'
      },
      quickLinks: {
        title: 'Quick Links',
        home: 'Home',
        cars: 'Cars',
        sell: 'Sell Car',
        about: 'About',
        contact: 'Contact',
        help: 'Help',
        advancedSearch: 'Advanced Search'
      },
      categories: {
        title: 'Categories',
        sedan: 'Sedan',
        suv: 'SUV',
        hatchback: 'Hatchback',
        coupe: 'Coupe',
        convertible: 'Convertible',
        wagon: 'Wagon'
      },
      contact: {
        title: 'Contact Info',
        address: 'Sofia, Bulgaria',
        phone: '+359 2 123 4567',
        email: 'info@globulcars.bg',
        website: 'www.globulcars.bg'
      },
      copyright: {
        rights: 'All rights reserved.'
      },
      links: {
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        cookiePolicy: 'Cookie Policy',
        sitemap: 'Sitemap'
      },
      legal: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy',
        sitemap: 'Sitemap'
      }
    }
  }
};

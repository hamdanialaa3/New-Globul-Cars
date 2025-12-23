export const translations = {
  bg: {
    loading: 'Зареждане...',
    buttons: {
      back: 'Назад',
      save: 'Запази',
      saving: 'Записване...',
      delete: 'Изтрий',
      cancel: 'Отказ'
    },
    discardChanges: 'Откажи промените',
    uploadImages: 'Качете снимки',
    confirmDiscard: 'Да се откажат ли промените?',
    sections: {
      images: 'Снимки',
      basicInfo: 'Основна информация',
      description: 'Описание',
      equipment: 'Оборудване',
      price: 'Цена',
      contact: 'Контакт',
      location: 'Локация',
      locationPrice: 'Локация и Цена',
      technical: 'Технически характеристики',
      status: 'Статус'
    },
    fields: {
      makeModel: 'Марка и Модел',
      year: 'Година',
      mileage: 'Пробег',
      power: 'Мощност',
      engineSize: 'Обем на двигателя',
      price: 'Цена',
      firstRegistration: 'Първа регистрация',
      firstRegistrationYear: 'Първа регистрация (Година)',
      firstRegistrationMonth: 'Първа регистрация (Месец)',
      fuelType: 'Гориво',
      transmission: 'Скоростна кутия',
      bodyType: 'Купе',
      color: 'Цвят',
      doors: 'Врати',
      seats: 'Седалки',
      condition: 'Състояние',
      driveType: 'Задвижване',
      roadworthy: 'Изправен и регистриран?',
      saleType: 'Тип продажба',
      saleTimeline: 'Кога ще продавате?',
      accidentFree: 'Без катастрофи',
      serviceHistory: 'Сервизна история',
      sellerName: 'Име на продавач',
      sellerPhone: 'Телефон',
      sellerEmail: 'Имейл',
      city: 'Град',
      region: 'Област',
      listingStatus: 'Статус на обявата',
      priceType: 'Тип цена',
      negotiable: 'Договаряне',
      vatDeductible: 'ДДС приспада',
      financing: 'Финансиране',
      tradeIn: 'Замяна'
    },
    placeholders: {
      select: 'Изберете',
      otherFuel: 'Друго гориво',
      bodyTypeOther: 'Друго купе',
      colorOther: 'Друг цвят',
      description: 'Описание на автомобила',
      noImages: 'Няма качени снимки'
    },
    hints: {
      makeModel: 'Изберете марка и модел от списъка',
      doors: 'Изберете конфигурация на вратите'
    },
    errors: {
      carIdMissing: 'Липсва ID на обявата',
      carNotFound: 'Обявата не е намерена',
      noPermission: 'Нямате права за редакция',
      loadError: 'Грешка при зареждане',
      saveError: 'Грешка при запис',
      saveFailed: 'Грешка при запис',
      deleteError: 'Грешка при изтриване',
      imageUploadFailed: 'Качването на снимки се провали'
    },
    prompts: {
      deleteConfirm: 'Сигурни ли сте, че искате да изтриете тази обява?',
      discardChanges: 'Имате незаписани промени. Сигурни ли сте, че искате да напуснете?'
    },
    success: {
      saved: 'Успешно записано'
    },
    status: {
      active: 'Активна',
      sold: 'Продадена',
      pending: 'Чернова',
      inactive: 'Неактивна'
    },
    fuelTypes: {
      petrol: 'Бензин',
      diesel: 'Дизел',
      electric: 'Електрически',
      hybrid: 'Хибрид',
      lpg: 'LPG / Газ',
      __other__: 'Друго'
    },
    transmissions: { manual: 'Ръчна', automatic: 'Автоматична' },
    colors: {
      white: 'Бял', black: 'Черен', silver: 'Сребрист', gray: 'Сив', blue: 'Син', red: 'Червен', green: 'Зелен', other: 'Друг'
    },
    conditions: { new: 'Нова', used: 'Употребявана', parts: 'За части' },
    driveTypes: {
      'front-wheel': 'Предно', 'rear-wheel': 'Задно', 'all-wheel': '4x4'
    },
    roadworthyOptions: { yes: 'Да', no: 'Не' },
    saleTypeOptions: { private: 'Частно', commercial: 'Търговец' },
    saleTimelineOptions: { unknown: 'Не знам', soon: 'Възможно най-скоро', months: 'В следващите месеци' },
    equipment: {
      safety: 'Безопасност',
      comfort: 'Комфорт',
      infotainment: 'Инфоразвлечение',
      extras: 'Екстри',
      extra: 'Екстри',
      // Items
      abs: 'ABS', esp: 'ESP', airbags: 'Въздушни възглавници', parkingSensors: 'Парктроник', rearviewCamera: 'Камера за задно', blindSpotMonitor: 'Следене на мъртва зона', laneDeparture: 'Асистент лента', collisionWarning: 'Предупр. за удар',
      ac: 'Климатик', climate: 'Климатроник', heatedSeats: 'Отопляеми седалки', ventilatedSeats: 'Вентилирани седалки', sunroof: 'Шибедах', rainSensor: 'Датчик дъжд', cruiseControl: 'Темпомат', parkAssist: 'Паркинг асистент',
      navigation: 'Навигация', bluetooth: 'Bluetooth', usb: 'USB', carPlay: 'Apple CarPlay', androidAuto: 'Android Auto', soundSystem: 'Аудио система', wifi: 'Wi‑Fi', radio: 'Радио',
      ledLights: 'LED фарове', xenon: 'Ксенон', daylight: 'Дневни светлини', alloyWheels: 'Лети джанти', keyless: 'Безключов достъп', startStop: 'Start/Stop', sportPackage: 'Спорт пакет', towHitch: 'Теглич'
    },
    priceTypes: { fixed: 'Фиксирана', negotiable: 'Договаряне', bestOffer: 'Най-добра оферта' },
    labels: {
      fixedPrice: 'Фиксирана цена',
      negotiable: 'Договаряне'
    },
    hintsInline: {},
  },
  en: {
    loading: 'Loading...',
    buttons: {
      back: 'Back',
      save: 'Save',
      saving: 'Saving...',
      delete: 'Delete',
      cancel: 'Cancel'
    },
    discardChanges: 'Discard changes',
    uploadImages: 'Upload images',
    confirmDiscard: 'Discard unsaved changes?',
    sections: {
      images: 'Photos',
      basicInfo: 'Basic Info',
      description: 'Description',
      equipment: 'Equipment',
      price: 'Price',
      contact: 'Contact',
      location: 'Location',
      locationPrice: 'Location & Price',
      technical: 'Technical Specifications',
      status: 'Status'
    },
    fields: {
      makeModel: 'Make & Model',
      year: 'Year',
      mileage: 'Mileage',
      power: 'Power (HP)',
      engineSize: 'Engine Size (cc)',
      price: 'Price',
      firstRegistration: 'First Registration',
      firstRegistrationYear: 'First registration year',
      firstRegistrationMonth: 'First registration month',
      fuelType: 'Fuel type',
      transmission: 'Transmission',
      bodyType: 'Body type',
      color: 'Color',
      doors: 'Doors',
      seats: 'Seats',
      condition: 'Condition',
      driveType: 'Drivetrain',
      roadworthy: 'Roadworthy & registered?',
      saleType: 'Type of sale',
      saleTimeline: 'When do you plan to sell?',
      accidentFree: 'Accident free',
      serviceHistory: 'Service history',
      sellerName: 'Seller name',
      sellerPhone: 'Phone',
      sellerEmail: 'Email',
      city: 'City',
      region: 'Region / Province',
      listingStatus: 'Listing status',
      priceType: 'Price type',
      negotiable: 'Negotiable',
      vatDeductible: 'VAT deductible',
      financing: 'Financing',
      tradeIn: 'Trade-in'
    },
    placeholders: {
      select: 'Select',
      otherFuel: 'Other fuel',
      bodyTypeOther: 'Other body type',
      colorOther: 'Other color',
      description: 'Describe the vehicle',
      noImages: 'No images uploaded'
    },
    hints: {
      makeModel: 'Pick make and model from the list',
      doors: 'Choose the door configuration'
    },
    errors: {
      carIdMissing: 'Car ID is missing',
      carNotFound: 'Listing not found',
      noPermission: 'You do not have permission',
      loadError: 'Error loading car data',
      saveError: 'Failed to save changes',
      saveFailed: 'Failed to save changes',
      deleteError: 'Failed to delete listing',
      imageUploadFailed: 'Image upload failed'
    },
    prompts: {
      deleteConfirm: 'Are you sure you want to delete this listing?',
      discardChanges: 'You have unsaved changes. Are you sure you want to leave?'
    },
    success: { saved: 'Saved successfully' },
    status: {
      active: 'Active',
      sold: 'Sold',
      pending: 'Draft',
      inactive: 'Inactive'
    },
    fuelTypes: {
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid',
      lpg: 'LPG / Gas',
      __other__: 'Other'
    },
    transmissions: { manual: 'Manual', automatic: 'Automatic' },
    colors: {
      white: 'White', black: 'Black', silver: 'Silver', gray: 'Gray', blue: 'Blue', red: 'Red', green: 'Green', other: 'Other'
    },
    conditions: { new: 'New', used: 'Used', parts: 'For parts' },
    driveTypes: { 'front-wheel': 'FWD', 'rear-wheel': 'RWD', 'all-wheel': 'AWD' },
    roadworthyOptions: { yes: 'Yes', no: 'No' },
    saleTypeOptions: { private: 'Private', commercial: 'Commercial (VAT)' },
    saleTimelineOptions: { unknown: "Don't know yet", soon: 'As soon as possible', months: 'Within months' },
    equipment: {
      safety: 'Safety',
      comfort: 'Comfort',
      infotainment: 'Infotainment',
      extras: 'Extras',
      extra: 'Extras',
      // Items
      abs: 'ABS', esp: 'ESP', airbags: 'Airbags', parkingSensors: 'Parking Sensors', rearviewCamera: 'Rearview Camera', blindSpotMonitor: 'Blind Spot Monitor', laneDeparture: 'Lane Departure', collisionWarning: 'Collision Warning',
      ac: 'Air Conditioning', climate: 'Climate Control', heatedSeats: 'Heated Seats', ventilatedSeats: 'Ventilated Seats', sunroof: 'Sunroof', rainSensor: 'Rain Sensor', cruiseControl: 'Cruise Control', parkAssist: 'Park Assist',
      navigation: 'Navigation', bluetooth: 'Bluetooth', usb: 'USB', carPlay: 'Apple CarPlay', androidAuto: 'Android Auto', soundSystem: 'Sound System', wifi: 'Wi‑Fi Hotspot', radio: 'Radio',
      ledLights: 'LED Lights', xenon: 'Xenon', daylight: 'Daytime Running Lights', alloyWheels: 'Alloy Wheels', keyless: 'Keyless Entry', startStop: 'Start/Stop', sportPackage: 'Sport Package', towHitch: 'Tow Hitch'
    },
    priceTypes: { fixed: 'Fixed', negotiable: 'Negotiable', bestOffer: 'Best offer' },
    labels: {
      fixedPrice: 'Fixed Price',
      negotiable: 'Negotiable'
    },
    hintsInline: {},
  }
};

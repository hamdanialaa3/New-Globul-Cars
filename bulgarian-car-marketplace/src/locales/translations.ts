// Unified Bulgarian Car Marketplace Translations (cleaned & de-duplicated)
// Structure parity between 'bg' and 'en' locales.
export const translations = {
  bg: {
    home: {
      hero: {
        title: 'Най-доброто място за търсене и продажба на коли в България',
        subtitle: 'Открийте перфектната кола от хиляди проверени обяви или продайте своята бързо и лесно.',
        browseCars: 'Разгледай коли',
        sellCar: 'Продай кола'
      },
      stats: {
        cars: 'коли',
        satisfiedCustomers: 'доволни клиенти',
        dealers: 'дилъри',
        satisfaction: 'удовлетвореност'
      },
      featured: {
        title: 'Препоръчани коли',
        subtitle: 'Открийте най-добрите оферти, избрани специално за вас',
        viewAll: 'Виж всички'
      },
      features: {
        title: 'Защо да изберете нас?',
        subtitle: 'Предлагаме най-добрите услуги за вашия автомобилен опит',
        search: { title: 'Умно търсене', description: 'Усъвършенствана система за търсене с множество филтри за намиране на идеалната кола' },
        verified: { title: 'Проверени обяви', description: 'Всички коли са проверени и валидирани преди публикуване' },
        finance: { title: 'Финансови решения', description: 'Гъвкави опции за финансиране и лизинг за всеки бюджет' },
        insurance: { title: 'Застраховка', description: 'Партнираме с водещи застрахователни компании за най-добри цени' },
        pricing: { title: 'Най-добри цени', description: 'Конкурентни цени с прозрачни сделки и без скрити такси' },
        secure: { title: 'Сигурни транзакции', description: 'Безопасна обработка на плащания със защита на купувач и продавач' },
        mobile: { title: 'Мобилно приложение', description: 'Достъп до пазара навсякъде с нашето адаптивно мобилно приложение' },
        local: { title: 'Местна експертиза', description: 'Задълбочени познания за българския автомобилен пазар и местните регулации' },
        fast: { title: 'Бърза обработка', description: 'Бързи обяви на коли и незабавна комуникация между купувачи и продавачи' }
      },
      cityCars: {
        title: 'Коли по региони',
        subtitle: 'Разгледайте автомобили във всички региони на България',
        viewAll: 'Виж всички региони',
        carsAvailable: 'налични коли',
        viewCars: 'Виж коли',
        selectCity: 'Изберете регион',
        mapDescription: 'Кликнете на региона, за да видите автомобилите'
      }
    },
    cars: {
      title: 'Търси коли',
      subtitle: 'Намерете идеалния автомобил за вас',
      loading: 'Зареждане на автомобили...',
      noResults: 'Няма намерени автомобили',
      found: 'Намерени'
    },
    sell: {
      hero: {
        title: 'Продайте вашия автомобил бързо и лесно',
        subtitle: 'Достигнете до хиляди потенциални купувачи в цяла България',
        startNow: 'Започнете сега',
        smartAdd: 'Smart добавяне',
        smartAddDescription: 'Интелигентно създаване на обява'
      },
      features: {
        fast: {
          title: 'Бързо и лесно',
          description: 'Създайте обява за минути с нашия интуитивен процес стъпка по стъпка'
        },
        mobile: {
          title: 'Мобилна оптимизация',
          description: 'Създавайте и управлявайте обяви от всяко устройство - телефон, таблет или компютър'
        },
        secure: {
          title: 'Сигурно и защитено',
          description: 'Вашите данни са защитени с най-съвременните технологии за сигурност'
        },
        free: {
          title: 'Безплатна публикация',
          description: 'Публикувайте обяви безплатно и достигнете до широка аудитория без скрити такси'
        },
        audience: {
          title: 'Голяма аудитория',
          description: 'Хиляди активни купувачи търсят автомобили всеки ден в нашата платформа'
        },
        analytics: {
          title: 'Статистика и анализи',
          description: 'Следете прегледите, запитванията и интереса към вашата обява в реално време'
        }
      },
      howItWorks: {
        title: 'Как работи?',
        steps: {
          0: 'Изберете типа на превозното средство и типа продавач',
          1: 'Въведете основна информация - марка, модел, година, пробег',
          2: 'Добавете оборудване и екстри за по-голяма привлекателност',
          3: 'Качете качествени снимки на автомобила (до 20 снимки)',
          4: 'Определете цената и условията на продажбата',
          5: 'Добавете вашите контактни данни и местоположение',
          6: 'Прегледайте и публикувайте обявата - готово!'
        }
      },
      start: {
        chooseTypeTitle: 'Изберете тип превозно средство',
        chooseTypeSubtitle: 'Изберете категорията, която най-добре описва вашето превозно средство',
        continue: 'Продължи',
        processInfoTitle: 'За процеса на публикуване',
        processInfoText: 'Публикуването на обява отнема само няколко минути. Следвайте стъпките и попълнете необходимата информация. Всички данни се записват автоматично, така че можете да продължите по-късно.',
        vehicleTypes: {
          car: { title: 'Лека кола', desc: 'За лично ползване' },
          suv: { title: 'Джип/SUV', desc: 'Високопроходим' },
          van: { title: 'Ван', desc: 'Товарен/Комби' },
          motorcycle: { title: 'Мотоциклет', desc: 'Двуколесен' },
          truck: { title: 'Камион', desc: 'Товарен' },
          bus: { title: 'Автобус', desc: 'Пътнически' }
        }
      },
      sellerType: {
        title: 'Тип продавач',
        subtitle: 'Определете типа на продавача за да персонализираме процеса',
        continue: 'Продължи',
        back: 'Назад',
        private: {
          title: 'Частно лице',
          description: 'Продавам собствената си кола',
          features: {
            0: 'Без данъчни задължения',
            1: 'По-ниски такси',
            2: 'Директна комуникация',
            3: 'Гъвкави условия'
          }
        },
        dealer: {
          title: 'Търговец',
          description: 'Търговец на превозни средства',
          features: {
            0: 'Професионално обслужване',
            1: 'Гаранция за качество',
            2: 'Финансиране',
            3: 'Търговска регистрация'
          }
        },
        company: {
          title: 'Фирма',
          description: 'Фирма продава служебни коли',
          features: {
            0: 'Голям брой превозни средства',
            1: 'Професионално обслужване',
            2: 'Търговска регистрация',
            3: 'Специални условия'
          }
        },
        infoTitle: 'Защо е важно да изберете правилния тип продавач?',
        infoText: 'Типът продавач определя какви документи ще бъдат необходими, какви такси ще се прилагат и какви права и задължения ще имате като продавач.'
      }
    },
    nav: { 
      home: 'Начало', 
      cars: 'Търси коли', 
      sell: 'Продай', 
      brandGallery: 'Бранд Галерия', 
      login: 'Вход', 
      register: 'Регистрация', 
      logout: 'Изход',
      favorites: 'Любими',
      messages: 'Съобщения',
      notifications: 'Известия',
      events: 'Събития',
      myAccount: 'Моят профил',
      settings: 'Настройки',
      profile: 'Профил',
      dashboard: 'Табло',
      dealers: 'Търговци',
      finance: 'Финансиране',
      insurance: 'Застраховка',
      about: 'За нас',
      contact: 'Контакт',
      help: 'Помощ',
      advancedSearch: 'Разширено търсене',
      explore: 'Разгледай',
      exploreCars: 'Разгледай коли',
      topBrands: 'Топ марки',
      searchCars: 'Търси коли'
    },
    profileTypes: {
      private: 'Личен',
      dealer: 'Дилър',
      company: 'Компания',
    },
    profile: {
      title: 'Моят профил',
      subtitle: 'Управлявайте вашия профил и настройки',
      editProfile: 'Редактирай профил',
      addCar: 'Добави кола',
      businessInfo: 'Бизнес информация',
      messages: 'Съобщения',
      logout: 'Изход',
      load_user_error_generic: 'Грешка при зареждане на профила',
      personalInfo: 'Лична информация',
      edit: 'Редактирай',
      save: 'Запази',
      cancel: 'Отказ',
      displayName: 'Име',
      email: 'Имейл',
      phoneNumber: 'Телефон',
      city: 'Град',
      region: 'Регион',
      preferredLanguage: 'Предпочитан език',
      memberSince: 'Член от',
      notSet: 'Не е зададено',
      bio: 'Биография',
      bioPlaceholder: 'Напишете кратка биография за себе си...',
      saveChanges: 'Запази промените',
      cancelEdit: 'Отказ',
      gallery: 'Галерия',
      addImage: 'Добави снимка',
      changeCover: 'Смени корица',
      uploadCover: 'Качи корица',
      anonymous: 'Анонимен',
      notLoggedIn: 'Моля влезте в системата за да видите вашия профил',
      view: 'Преглед',
      stats: {
        cars: 'Коли',
        favorites: 'Любими',
        messages: 'Съобщения',
        views: 'Прегледи'
      },
      myCars: 'Моите коли',
      noCars: 'Нямате добавени коли',
      noCarsDescription: 'Започнете да продавате вашите автомобили сега',
      addFirstCar: 'Добави първа кола',
      garage: {
        title: 'Моят гараж',
        myGarage: 'Моят гараж',
        viewGarage: 'Преглед на гаража',
        emptyTitle: 'Гаражът е празен',
        emptyDescription: 'Добавете автомобили в гаража си за бърз достъп и управление',
        addToGarage: 'Добави в гаража',
        removeFromGarage: 'Премахни от гаража',
        totalCars: 'Общо автомобили',
        activeCars: 'Активни обяви',
        soldCars: 'Продадени',
        draftCars: 'Чернови',
        statistics: 'Статистика на гаража',
        manageAll: 'Управлявай всички',
        sortBy: 'Подреди по',
        filterBy: 'Филтрирай по',
        status: {
          all: 'Всички',
          active: 'Активни',
          sold: 'Продадени',
          draft: 'Чернови',
          pending: 'Чакащи одобрение'
        }
      },
      accountSettings: 'Настройки на акаунта',
      notifications: 'Известия',
      privacy: 'Поверителност',
      security: 'Сигурност',
      deleteAccount: 'Изтрий акаунт',
      deleteAccountConfirm: 'Сигурни ли сте, че искате да изтриете акаунта си?'
    },
    languages: {
      bulgarian: 'Български',
      english: 'English',
      bg: 'Български',
      en: 'English'
    },
    topBrands: {
      topBrands: 'Топ марки',
      allBrands: 'Всички марки',
      viewAll: 'Виж всички',
      series: 'серии',
      popularBrands: 'Популярни марки',
      generation: 'Генерация'
    },
    footer: {
      description: 'Водещата платформа за търсене и продажба на коли в България с хиляди проверени обяви.',
      quickLinks: 'Бързи връзки', services: 'Услуги', contact: 'Контакт', support: 'Поддръжка',
      address: 'София, България', rights: 'Всички права запазени.', privacy: 'Поверителност', terms: 'Условия', cookies: 'Бисквитки', dataDeletion: 'Изтриване на данни'
    },
    contact: {
      title: 'Свържете се с нас',
      subtitle: 'Тук сме, за да ви помогнем с всякакви въпроси или притеснения. Свържете се с нашия екип.',
      info: {
        title: 'Свържете се с нас',
        address: { title: 'Адрес', text: 'София, България' },
        phone: { title: 'Телефон', text: '+359 2 123 4567' },
        email: { title: 'Имейл', text: 'info@globulcars.bg' },
        hours: { title: 'Работно време', text: 'Пон-Пет: 9:00-18:00' }
      },
      form: {
        title: 'Изпратете ни съобщение', success: 'Благодаря! Вашето съобщение беше изпратено успешно.',
        name: 'Пълно име', email: 'Имейл адрес', phone: 'Телефонен номер', inquiryType: 'Тип запитване',
        inquiryTypes: { general: 'Общо запитване', support: 'Техническа поддръжка', sales: 'Въпрос за продажби' },
        subject: 'Тема', message: 'Съобщение', send: 'Изпрати съобщение'
      }
    },
    carSearch: {
      tabs: { search: 'Търсене', filters: 'Филтри', popular: 'Популярни', trending: 'Актуални' },
      searching: 'Търся...'
    },
    searchResults: {
      loading: 'Зареждам резултати...', empty: 'Няма намерени резултати', count: 'резултата намерени',
      sort: { relevance: 'Релевантност', price: 'Цена', date: 'Дата', mileage: 'Пробег', year: 'Година' },
      view: { grid: 'Решетка', list: 'Списък' },
      badges: { promoted: 'Промотирано', new: 'Ново', favorite: 'Любимо' },
      pagination: { previous: 'Предишна', next: 'Следваща', page: 'Страница' }
    },
    advancedSearch: {
      title: 'Подробно търсене: Коли – нови или употребявани',
      search: 'Търси', searching: 'Търся...', 
      saveSearch: 'Запази търсенето',
      save: 'Запази',
      searchName: 'Име на търсенето',
      searchNamePlaceholder: 'напр. BMW 3 Series 2020+ София',
      saveSearchDescription: 'Дайте име на това търсене за бърз достъп по-късно',
      searchSummary: 'Резюме на търсенето',
      pleaseEnterName: 'Моля, въведете име за търсенето',
      reset: 'Нулирай', resetFilters: 'Изчисти филтрите',
      applyFiltersAbove: 'Приложи горните филтри', searchCars: 'Търси коли', searchResults: 'Резултати от търсенето',
      basicData: 'Основни данни', technicalData: 'Технически данни', exterior: 'Екстериор', interior: 'Интериор', offerDetails: 'Детайли на офертата',
      any: 'Всички', from: 'от', to: 'до', yes: 'Да', no: 'Не', comingSoon: 'Скоро...', fuelType: 'Тип гориво',
      make: 'Марка', model: 'Модел', modelPlaceholder: 'напр. GTI …', vehicleType: 'Тип превозно средство',
      numberOfSeats: 'Брой места', numberOfDoors: 'Брой врати', slidingDoor: 'Плъзгаща врата', typeAndCondition: 'Тип и състояние', paymentType: 'Тип плащане',
      price: 'Цена', firstRegistrationDate: 'Дата на първа регистрация', mileage: 'Пробег', huValid: 'HU валиден', numberOfOwners: 'Брой собственици',
      fullServiceHistory: 'Пълна сервизна история', roadworthy: 'Годен за движение', country: 'Държава', cityZipCode: 'Град / пощенски код', radius: 'Радиус',
      additionalOffersWithDelivery: 'Допълнителни оферти с доставка', preRegistration: 'Предварителна регистрация', employeeCar: 'Служебна кола',
      classicVehicle: 'Класическо превозно средство', demonstrationVehicle: 'Демонстрационно превозно средство',
      cabriolet: 'Кабриолет/Родстер', estate: 'Комби', suv: 'Джип/Пикап/SUV', saloon: 'Седан', small: 'Малка кола', sports: 'Спортна кола/Купе', van: 'Ван/Минибус', other: 'Други',
      bulgaria: 'България', germany: 'Германия', france: 'Франция', italy: 'Италия', spain: 'Испания', german: 'Немска', japanese: 'Японска', american: 'Американска', korean: 'Корейска', french: 'Френска', italian: 'Италианска', swedish: 'Шведска',
      interiorColour: 'Цвят на интериора', interiorMaterial: 'Материал на интериора', exteriorColour: 'Цвят на екстериора', allOptions: 'Всички', yesOption: 'Да', noOption: 'Не', fromPlaceholder: 'От', toPlaceholder: 'До', power: 'Мощност', cubicCapacity: 'Работен обем',
      trailerCoupling: 'Теглич', trailerLoadBraked: 'Товар ремарке със спирачки', trailerLoadUnbraked: 'Товар ремарке без спирачки', parkingSensors: 'Сензори за паркиране', airConditioning: 'Климатизация', airbags: 'Въздушни възглавници', extras: 'Екстри',
      alarm: 'Аларма', ambientLighting: 'Амбиентно осветление', androidAuto: 'Android Auto', appleCarPlay: 'Apple CarPlay', armrest: 'Подлакътник', autoTintedMirror: 'Автоматично затъмняващи огледала', additionalHeating: 'Допълнително отопление', bluetooth: 'Bluetooth', cargoBarrier: 'Преграда за товари', cdPlayer: 'CD плейър',
      dabRadio: 'DAB радио', digitalCockpit: 'Дигитален кокпит', disabledAccess: 'Достъп за инвалиди', electricRearSeats: 'Електрически задни седалки', electricSeats: 'Електрически седалки', electricSeatsMemory: 'Електрически седалки с памет', electricWindows: 'Електрически прозорци', emergencyCallSystem: 'Система за извънредни повиквания', fatigueWarning: 'Предупреждение за умора',
      foldingRearSeats: 'Сгъваеми задни седалки', foldingMirrors: 'Сгъваеми огледала', handsFreeSystem: 'Hands-free система', headUpDisplay: 'Head-up дисплей', heatedRearSeats: 'Подгрявани задни седалки', heatedSeats: 'Подгрявани седалки', heatedSteeringWheel: 'Подгряван волан', wirelessCharging: 'Безжично зареждане', integratedMusicStreaming: 'Вградено стрийминг на музика', isofix: 'ISOFIX',
      leatherSteeringWheel: 'Кожен волан', lumbarSupport: 'Лумбална поддръжка', massageSeats: 'Масажни седалки', multifunctionalSteeringWheel: 'Многофункционален волан', navigation: 'Навигация', onBoardComputer: 'Бордови компютър', paddleShifters: 'Лостчета за скорости', passengerIsofix: 'ISOFIX за пътник', seatVentilation: 'Вентилация на седалките', rightHandDrive: 'Десен волан',
      skiBag: 'Ски чанта', smokersPackage: 'Пакет за пушачи', audioSystem: 'Аудио система', sportsSeats: 'Спортни седалки', touchscreen: 'Тъчскрийн', tunerRadio: 'Радио тунер', tv: 'ТВ', usbPort: 'USB порт', virtualMirrors: 'Виртуални огледала', voiceControl: 'Гласово управление',
      winterPackage: 'Зимен пакет', wlanWifiHotspot: 'WLAN/WiFi хотспот', seller: 'Продавач', dealerRating: 'Оценка на дилъра', listingOnlineSince: 'Онлайн от', specialOptions: 'Специални опции', listingsWithPhotos: 'Обяви с снимки', listingsWithVideo: 'Обяви с видео', reducedPrice: 'Оферти с отстъпка', nonSmoker: 'Непушачески автомобил',
      taxi: 'Такси', vatDeductible: 'ДДС възстановим', damagedVehicles: 'Повредени автомобили', dontShow: 'Не показвай', commercialExportImport: 'Търговски, експорт/импорт', approvedUsedCarProgram: 'Програма за одобрени употребявани автомобили', choose: 'Избери', location: 'Местоположение', deliveryOffers: 'Оферти за доставка', showOnlyDeliveryOffers: 'Покажи само оферти с доставка',
      searchInDescription: 'Търси в описанието', descriptionPlaceholder: 'Въведете ключови думи за търсене в описанието...', enterKeywords: 'Въведете ключови думи...', availability: 'Наличност', available: 'Наличен', reserved: 'Резервиран', sold: 'Продаден', delivery: 'Доставка', deliveryAvailable: 'Възможна доставка', pickupOnly: 'Само вземане',
      // Extended filters (second definition merged)
      sellerType: 'Тип продавач', dealer: 'Дилър', private: 'Частно лице', garage: 'Автокъща', extendedWarranty: 'Разширена гаранция', noWarranty: 'Без гаранция',
      serviceHistory: 'Сервизна история', partialServiceHistory: 'Частична сервизна история', noServiceHistory: 'Без сервизна история', accidentFree: 'Без катастрофи', damaged: 'Повредено', notRoadworthy: 'Не е годен за движение', valid: 'Валиден', expired: 'Изтекъл', expiringSoon: 'Изтича скоро',
      
      // Missing fuel types
      electricFuel: 'Електрически',
      ethanolFuel: 'Етанол',
      hybridDieselElectric: 'Хибрид дизел/електрически',
      hybridGasolineElectric: 'Хибрид бензин/електрически',
      hydrogenFuel: 'Водород',
      lpgFuel: 'LPG (газ)',
      naturalGasFuel: 'Природен газ (CNG)',
      otherFuel: 'Друго',
      pluginHybridFuel: 'Plug-in хибрид',
      
      // Missing colors
      black: 'Черен',
      beige: 'Бежов',
      gray: 'Сив',
      brown: 'Кафяв',
      white: 'Бял',
      orange: 'Оранжев',
      blue: 'Син',
      yellow: 'Жълт',
      red: 'Червен',
      green: 'Зелен',
      silver: 'Сребърен',
      gold: 'Златен',
      purple: 'Лилав',
      matte: 'Матов',
      metallic: 'Металик',
      
      // Missing interior colors
      interiorBeige: 'Бежов',
      interiorBlack: 'Черен',
      interiorBlue: 'Син',
      interiorBrown: 'Кафяв',
      interiorGray: 'Сив',
      interiorRed: 'Червен',
      interiorOther: 'Друг',
      
      // Missing interior materials
      alcantara: 'Алкантара',
      fabric: 'Плат',
      artificialLeather: 'Изкуствена кожа',
      partialLeather: 'Частична кожа',
      fullLeather: 'Пълна кожа',
      velour: 'Велур',
      materialOther: 'Друг',
      
      // Missing countries
      austria: 'Австрия',
      switzerland: 'Швейцария',
      countryOther: 'Друга',
      
      // Missing cities
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
      
      // Missing general fields
      subtitle: 'Намерете идеалния автомобил с подробни филтри',
      all: 'Всички',
      offroad: 'Офроуд',
      
      // Missing condition types
      newCondition: 'Нов',
      usedCondition: 'Употребяван',
      preRegistrationCondition: 'Предварителна регистрация',
      employeeCondition: 'Служебна кола',
      classicCondition: 'Класически',
      demonstrationCondition: 'Демонстрационен',
      
      // Missing purchase options
      purchaseOption: 'Покупка',
      leasingOption: 'Лизинг',
      
      // Missing registration fields
      firstRegistration: 'Първа регистрация',
      huValidUntil: 'HU валиден до',
      exampleYear: 'напр. 2020',
      
      // Missing technical data
      fuelTankVolume: 'Обем на резервоара',
      
      // Missing fuel type translations
      gasolineFuel: 'Бензин',
      dieselFuel: 'Дизел',
      
      // Missing technical data translations
      weight: 'Тегло',
      cylinders: 'Цилиндри',
      driveType: 'Тип задвижване',
      frontWheelDrive: 'Предно задвижване',
      rearWheelDrive: 'Задно задвижване',
      allWheelDrive: 'Пълно задвижване',
      
      // Missing rating translations
      veryGoodRating: 'Много добро',
      goodRating: 'Добро',
      satisfactoryRating: 'Задоволително',
      
      // Missing time period translations
      adOnlineSince: 'Обява онлайн от',
      lastDay: 'Последния ден',
      last3Days: 'Последните 3 дни',
      lastWeek: 'Последната седмица',
      lastMonth: 'Последния месец',
      
      // Missing media translations
      adsWithPictures: 'Обяви със снимки',
      onlyWithPictures: 'Само със снимки',
      adsWithVideo: 'Обяви с видео',
      onlyWithVideo: 'Само с видео',
      
      // Missing offer translations
      discountOffers: 'Оферти с отстъпка',
      onlyDiscountOffers: 'Само оферти с отстъпка',
      nonSmokerVehicle: 'Непушачески автомобил',
      onlyNonSmoker: 'Само непушачески',
      onlyTaxi: 'Само такси',
      vatReclaimable: 'ДДС възстановим',
      onlyVatReclaimable: 'Само ДДС възстановим',
      warranty: 'Гаранция',
      onlyWithWarranty: 'Само с гаранция',
      
      // Missing condition translations
      includeDamaged: 'Включи повредени',
      commercialExport: 'Търговски, експорт/импорт',
      approvedUsedProgramme: 'Програма за одобрени употребявани автомобили',
      
      // Missing location translations
      city: 'Град',
      onlyDeliveryOffers: 'Само оферти с доставка'
    },
    messaging: {
      title: 'Съобщения',
      subtitle: 'Управлявайте вашите разговори и съобщения',
      conversations: 'Разговори',
      newMessage: 'Ново съобщение',
      noConversations: 'Няма разговори',
      selectConversation: 'Изберете разговор',
      selectConversationDescription: 'Изберете разговор от списъка, за да започнете да чатите',
      noMessages: 'Няма съобщения',
      startConversation: 'Започнете разговор, като напишете съобщение',
      typeMessage: 'Напишете съобщение...',
      all: 'Всички',
      unread: 'Непрочетени',
      noSearchResults: 'Няма резултати от търсенето',
      noConversationsDescription: 'Започнете нов разговор с някой',
      send: 'Изпрати',
      online: 'Онлайн',
      lastSeen: 'Последно видян',
      typing: 'пише...',
      messageSent: 'Съобщението е изпратено',
      messageDelivered: 'Съобщението е доставено',
      messageRead: 'Съобщението е прочетено',
      errorSending: 'Грешка при изпращане',
      errorLoading: 'Грешка при зареждане',
      retry: 'Опитайте отново',
      deleteMessage: 'Изтрий съобщение',
      editMessage: 'Редактирай съобщение',
      replyToMessage: 'Отговори на съобщение',
      forwardMessage: 'Препрати съобщение',
      copyMessage: 'Копирай съобщение',
      markAsRead: 'Отбележи като прочетено',
      markAsUnread: 'Отбележи като непрочетено',
      archive: 'Архивирай',
      unarchive: 'Възстанови от архива',
      block: 'Блокирай',
      unblock: 'Отблокирай',
      report: 'Докладвай',
      mute: 'Заглуши',
      unmute: 'Включи звук',
      searchMessages: 'Търси съобщения',
      filterMessages: 'Филтрирай съобщения',
      allMessages: 'Всички съобщения',
      unreadMessages: 'Непрочетени съобщения',
      starredMessages: 'Отбелязани съобщения',
      mediaMessages: 'Медийни съобщения',
      fileMessages: 'Файлови съобщения',
      voiceMessages: 'Гласови съобщения',
      videoMessages: 'Видео съобщения',
      imageMessages: 'Снимки',
      documentMessages: 'Документи',
      locationMessages: 'Местоположения',
      contactMessages: 'Контакти',
      systemMessages: 'Системни съобщения',
      today: 'Днес',
      yesterday: 'Вчера',
      thisWeek: 'Тази седмица',
      lastWeek: 'Миналата седмица',
      thisMonth: 'Този месец',
      lastMonth: 'Миналия месец',
      older: 'По-стари',
      newer: 'По-нови',
      loadMore: 'Зареди още',
      noMoreMessages: 'Няма повече съобщения',
      connectionError: 'Грешка в връзката',
      reconnecting: 'Повторно свързване...',
      connected: 'Свързано',
      disconnected: 'Изключено',
      typingIndicator: 'потребител пише...',
      multipleTyping: 'потребители пишат...',
      messageStatus: {
        sending: 'Изпраща се',
        sent: 'Изпратено',
        delivered: 'Доставено',
        read: 'Прочетено',
        failed: 'Неуспешно'
      },
      messageTypes: {
        text: 'Текст',
        image: 'Снимка',
        video: 'Видео',
        audio: 'Аудио',
        file: 'Файл',
        location: 'Местоположение',
        contact: 'Контакт',
        sticker: 'Стикер',
        gif: 'GIF',
        emoji: 'Емоджи'
      },
      actions: {
        reply: 'Отговори',
        forward: 'Препрати',
        copy: 'Копирай',
        delete: 'Изтрий',
        edit: 'Редактирай',
        star: 'Отбележи',
        unstar: 'Премахни отбелязването',
        pin: 'Закачи',
        unpin: 'Откачи',
        save: 'Запази',
        share: 'Сподели',
        download: 'Изтегли',
        open: 'Отвори',
        print: 'Отпечатай',
        export: 'Експортирай',
        import: 'Импортирай'
      },
      settings: {
        title: 'Настройки на съобщенията',
        notifications: 'Известия',
        sound: 'Звук',
        vibration: 'Вибриране',
        preview: 'Преглед',
        autoDownload: 'Автоматично изтегляне',
        dataUsage: 'Използване на данни',
        privacy: 'Поверителност',
        security: 'Сигурност',
        backup: 'Резервно копие',
        restore: 'Възстановяване',
        clear: 'Изчисти',
        reset: 'Нулирай'
      },
      errors: {
        networkError: 'Грешка в мрежата',
        serverError: 'Грешка в сървъра',
        authenticationError: 'Грешка в автентикацията',
        permissionError: 'Грешка в разрешенията',
        fileSizeError: 'Файлът е твърде голям',
        fileTypeError: 'Типът файл не се поддържа',
        messageTooLong: 'Съобщението е твърде дълго',
        messageEmpty: 'Съобщението е празно',
        userNotFound: 'Потребителят не е намерен',
        conversationNotFound: 'Разговорът не е намерен',
        messageNotFound: 'Съобщението не е намерено',
        accessDenied: 'Достъпът е отказан',
        rateLimited: 'Твърде много заявки',
        maintenanceMode: 'Режим на поддръжка',
        updateRequired: 'Изисква се актуализация'
      }
  },
    dashboard: {
      title: 'Табло', subtitle: 'Управлявайте вашите обяви и активност', overview: 'Преглед',
      totalCars: 'Общо коли', viewCars: 'Виж коли', totalUsers: 'Общо потребители', viewUsers: 'Виж потребители', totalMessages: 'Общо съобщения', viewMessages: 'Виж съобщения', totalRevenue: 'Общо приходи', viewRevenue: 'Виж приходи',
      recentActivity: 'Скорошна активност', newCars: 'Нови обяви', viewNewCars: 'Виж нови', newUsers: 'Нови потребители', viewNewUsers: 'Виж нови потребители', newMessages: 'Нови съобщения', viewNewMessages: 'Виж нови съобщения', systemStatus: 'Системен статус', viewSystemStatus: 'Виж статус',
      analytics: 'Анализи', pageViews: 'Преглеждания', userEngagement: 'Ангажираност', conversionRate: 'Конверсия', bounceRate: 'Bounce Rate',
      settings: 'Настройки', generalSettings: 'Основни настройки', siteName: 'Име на сайта', siteDescription: 'Описание на сайта', saveSettings: 'Запази настройки',
      notificationSettings: 'Настройки за известия', emailNotifications: 'Имейл известия', smsNotifications: 'SMS известия', pushNotifications: 'Push известия',
      securitySettings: 'Сигурност', currentPassword: 'Текуща парола', newPassword: 'Нова парола', confirmPassword: 'Потвърди паролата', updatePassword: 'Обнови паролата',
      help: 'Помощ и Поддръжка', contactSupport: 'Свържи се с поддръжка',
      stats: {
        listingsOnline: 'Активни обяви', thisWeek: 'тази седмица', views: 'Преглеждания', lastWeek: 'миналата седмица', newInquiries: 'Нови запитвания', unread: 'непрочетени', potentialSales: 'Потенциални продажби', basedOnInquiries: 'На база запитвания'
      },
      timeAgo: { justNow: 'Току-що', hoursAgo: 'преди {{count}} ч.', dayAgo: 'преди 1 ден', daysAgo: 'преди {{count}} дни' },
      myListings: 'Моите обяви', carStatus: { active: 'Активна', pending: 'Чакаща', sold: 'Продадена', draft: 'Чернова' }, noListings: 'Няма обяви',
      actions: { addNewListing: 'Нова обява', viewStatistics: 'Виж статистики', editProfile: 'Редактирай профил', settings: 'Настройки', financialReports: 'Финансови отчети', support: 'Поддръжка', viewAllMessages: 'Всички съобщения' },
      recentInquiries: 'Последни запитвания', noMessages: 'Няма съобщения', notifications: 'Известия', noNotifications: 'Няма известия', quickActions: 'Бързи действия',
      improvementTips: 'Съвети за подобрение', tips: { addMorePhotos: 'Добавете повече снимки', respondQuickly: 'Отговаряйте бързо', maintainCompetitivePrices: 'Поддържайте конкурентни цени', updateDescriptions: 'Актуализирайте описанията' }
    },
    notifications: {
      title: 'Известия',
      loading: 'Зареждане...',
      noNotifications: 'Няма известия',
      noNotificationsDesc: 'Ще получавате известия тук за важни събития.',
      justNow: 'Току-що',
      minutesAgo: 'преди минути',
      hoursAgo: 'преди часове',
      daysAgo: 'преди дни',
      viewDetails: 'Виж детайли',
      markAsRead: 'Отбележи като прочетено',
      delete: 'Изтрий',
      markAllRead: 'Отбележи всички като прочетени',
      settings: 'Настройки',
      viewAll: 'Виж всички',
      loginRequired: 'Изисква се вход',
      loginToView: 'Моля, влезте в системата, за да видите известията си.',
      all: 'Всички',
      unread: 'Непрочетени',
      messages: 'Съобщения',
      system: 'Система'
    },
    fullThemeDemo: {
      title: 'Демо на пълна тема', overview: 'Преглед', primaryTheme: 'Основна тема', testPrimary: 'Тествай основна', secondaryTheme: 'Вторична тема', testSecondary: 'Тествай вторична', accentTheme: 'Акцентна тема', testAccent: 'Тествай акцент', neutralTheme: 'Неутрална тема', testNeutral: 'Тествай неутрална',
      typography: 'Типография', headings: 'Заглавия', testHeadings: 'Тествай заглавия', bodyText: 'Основен текст', testBodyText: 'Тествай текст', captions: 'Надписи', testCaptions: 'Тествай надписи', links: 'Връзки', testLinks: 'Тествай връзки',
      components: 'Компоненти', buttons: 'Бутони', testButtons: 'Тествай бутони', inputs: 'Полетa', testInputs: 'Тествай полета', cards: 'Карти', testCards: 'Тествай карти', modals: 'Модали', testModals: 'Тествай модали',
      layout: 'Оформление', grid: 'Мрежа', testGrid: 'Тествай мрежа', spacing: 'Отстояния', testSpacing: 'Тествай отстояния', borders: 'Рамки', testBorders: 'Тествай рамки', shadows: 'Сенки', testShadows: 'Тествай сенки'
    },
    ratingSystem: { label: 'Оценка', votes: 'гласа' },
    auth: {
      login: { title: 'Вход', email: 'Имейл', password: 'Парола', loading: 'Влизане...', submit: 'Вход', noAccount: 'Нямате акаунт?', register: 'Регистрирайте се тук' },
      register: { title: 'Регистрация', firstName: 'Име', lastName: 'Фамилия', email: 'Имейл', password: 'Парола', confirmPassword: 'Потвърди парола', loading: 'Създаване...', submit: 'Регистрация', haveAccount: 'Вече имате акаунт?', login: 'Влезте тук' },
      orContinueWith: 'Или продължи с', continueWithGoogle: 'Вход с Google', continueWithFacebook: 'Вход с Facebook', continueWithApple: 'Вход с Apple',
      required: {
        title: 'Изисква се вход',
        message: 'За достъп до тази страница, моля влезте в профила си.',
        loginButton: 'Вход в системата',
        backButton: 'Обратно към началото',
        enjoyFeatures: 'Влезте, за да се насладите на всички функции и услуги.'
      },
      pageNames: {
        advancedSearch: 'Подробното търсене',
        sell: 'Продажбата на кола',
        sellCar: 'Продажбата на кола',
        brandGallery: 'Галерията на марки',
        dealers: 'Търговците',
        finance: 'Финансирането',
        thisPage: 'тази страница'
      }
    },
    errors: {
      notFound: {
        title: '404',
        subtitle: 'Страницата не е намерена',
        description: 'Страницата, която търсите, не съществува или е преместена.',
        homeButton: 'Към началната страница'
      }
    },
    common: {
      back: 'Назад',
      loading: 'Зареждане...',
      save: 'Запази',
      cancel: 'Отказ',
      confirm: 'Потвърди',
      delete: 'Изтрий',
      edit: 'Редактирай',
      bulgarian: 'Български',
      english: 'English',
      language: 'Език',
      theme: 'Тема',
      lightMode: 'Светъл режим',
      darkMode: 'Тъмен режим',
      clearCache: 'Изчисти кеша',
      cacheCleared: 'Кешът е изчистен успешно!'
    },
    emailVerification: {
      invalidLink: 'Невалиден линк за потвърждение',
      successTitle: 'Потвърждение успешно!',
      successMessage: 'Вашият имейл адрес е успешно потвърден!',
      errorTitle: 'Грешка при потвърждение',
      errorMessage: 'Грешка при потвърждение на имейл адреса',
      verifyingTitle: 'Потвърждаване...',
      goToHome: 'Към началната страница',
      goToLogin: 'Към вход',
      autoRedirect: 'Ще бъдете пренасочени автоматично след 3 секунди...'
    },
    search: {
      placeholder: 'Търсене на коли...',
      button: 'Търси',
      advanced: 'Подробно търсене',
      results: 'Резултати',
      noResults: 'Няма намерени резултати',
      loading: 'Зареждане...'
    },
    header: {
      loggedAs: 'Влязъл като',
      // My Account Section
      myAccount: 'Моят профил',
      overview: 'Преглед',
      myStatistics: 'Моята статистика',
      myProfile: 'Моят профил',
      
      // Vehicles Section
      vehiclesSection: 'Моите коли',
      carPark: 'Моите превозни средства',
      myAds: 'Моите обяви',
      savedSearches: 'Запазени търсения',
      mySearches: 'Моите търсения',
      myFavorites: 'Любими',
      garage: 'Гараж',
      
      // Communication Section
      communicationSection: 'Комуникация',
      messages: 'Съобщения',
      notifications: 'Известия',
      inquiries: 'Запитвания',
      
      // Finance Section
      financeSection: 'Финанси',
      financeCalculator: 'Финансов калкулатор',
      invoices: 'Фактури',
      commissions: 'Комисионни',
      financialReports: 'Финансови отчети',
      insurance: 'Застраховка',
      
      // Settings Section
      settingsSection: 'Настройки и контрол',
      preferences: 'Предпочитания',
      
      // Appearance
      appearance: 'Външен вид',
      lightMode: 'Светъл режим',
      darkMode: 'Тъмен режим',
      autoMode: 'Автоматичен',
      
      // Text Size
      textSize: 'Размер на текста',
      textSmall: 'Малък',
      textMedium: 'Среден',
      textLarge: 'Голям',
      
      // Language
      language: 'Език',
      bulgarian: 'Български',
      english: 'English',
      
      // Notification Settings
      notificationSettings: 'Настройки за известия',
      emailNotif: 'Имейл известия',
      pushNotif: 'Push известия',
      smsNotif: 'SMS известия',
      
      // Account Settings
      accountSettings: 'Настройки на профила',
      editProfile: 'Редактирай профил',
      changeAvatar: 'Промени аватар',
      changeCover: 'Промени корица',
      privacySettings: 'Настройки за поверителност',
      personalData: 'Лични данни',
      
      // Security
      security: 'Сигурност',
      changePassword: 'Промени парола',
      twoFactorAuth: 'Двуфакторна автентикация',
      activeSessions: 'Активни сесии',
      
      // Help & Support
      helpSupport: 'Помощ и поддръжка',
      faq: 'Често задавани въпроси',
      contactSupport: 'Свържи се с поддръжка',
      reportIssue: 'Докладвай проблем',
      dealerInfo: 'Информация за търговеца',
      
      // Actions
      logout: 'Изход'
    }
  },
  en: {
    home: {
      hero: {
        title: 'The Best Place to Buy and Sell Cars in Bulgaria',
        subtitle: 'Find your perfect car from thousands of verified listings or sell yours quickly and easily.',
        browseCars: 'Browse Cars',
        sellCar: 'Sell Car'
      },
      stats: { cars: 'cars', satisfiedCustomers: 'satisfied customers', dealers: 'dealers', satisfaction: 'satisfaction' },
      featured: { title: 'Featured Cars', subtitle: 'Discover the best deals, handpicked just for you', viewAll: 'View All' },
      features: {
        title: 'Why Choose Us?', subtitle: 'We provide the best services for your automotive experience',
        search: { title: 'Smart Search', description: 'Advanced search system with multiple filters to find your ideal car' },
        verified: { title: 'Verified Listings', description: 'All cars are checked and validated before being published' },
        finance: { title: 'Finance Solutions', description: 'Flexible financing and leasing options for every budget' },
        insurance: { title: 'Insurance', description: 'We partner with leading insurance companies for the best rates' },
        pricing: { title: 'Best Pricing', description: 'Competitive pricing with transparent deals and no hidden fees' },
        secure: { title: 'Secure Transactions', description: 'Safe and secure payment processing with buyer and seller protection' },
        mobile: { title: 'Mobile Friendly', description: 'Access the marketplace anywhere with our responsive mobile app' },
        local: { title: 'Local Expertise', description: 'Deep knowledge of the Bulgarian car market and local regulations' },
        fast: { title: 'Fast Processing', description: 'Quick car listings and instant communication between buyers and sellers' }
      },
      cityCars: {
        title: 'Cars by Regions',
        subtitle: 'Explore vehicles in all regions across Bulgaria',
        viewAll: 'View All Regions',
        carsAvailable: 'cars available',
        viewCars: 'View Cars',
        selectCity: 'Select a region',
        mapDescription: 'Click on a region to view its cars'
      }
    },
    cars: {
      title: 'Browse Cars',
      subtitle: 'Find the perfect vehicle for you',
      loading: 'Loading cars...',
      noResults: 'No cars found',
      found: 'Found'
    },
    sell: {
      hero: {
        title: 'Sell Your Car Fast & Easy',
        subtitle: 'Reach thousands of potential buyers across Bulgaria',
        startNow: 'Start Now',
        smartAdd: 'Smart Add',
        smartAddDescription: 'Intelligent listing creation'
      },
      features: {
        fast: {
          title: 'Fast & Easy',
          description: 'Create a listing in minutes with our intuitive step-by-step process'
        },
        mobile: {
          title: 'Mobile Optimized',
          description: 'Create and manage listings from any device - phone, tablet or computer'
        },
        secure: {
          title: 'Secure & Safe',
          description: 'Your data is protected with the latest security technologies'
        },
        free: {
          title: 'Free Publication',
          description: 'Publish listings for free and reach a wide audience without hidden fees'
        },
        audience: {
          title: 'Large Audience',
          description: 'Thousands of active buyers search for cars daily on our platform'
        },
        analytics: {
          title: 'Statistics & Analytics',
          description: 'Track views, inquiries and interest in your listing in real-time'
        }
      },
      howItWorks: {
        title: 'How It Works?',
        steps: {
          0: 'Select vehicle type and seller type',
          1: 'Enter basic information - make, model, year, mileage',
          2: 'Add equipment and extras for more appeal',
          3: 'Upload quality photos of the car (up to 20 photos)',
          4: 'Set the price and sale conditions',
          5: 'Add your contact details and location',
          6: 'Review and publish the listing - done!'
        }
      },
      start: {
        chooseTypeTitle: 'Choose Vehicle Type',
        chooseTypeSubtitle: 'Select the category that best describes your vehicle',
        continue: 'Continue',
        processInfoTitle: 'About the Publishing Process',
        processInfoText: 'Publishing a listing takes just a few minutes. Follow the steps and fill in the required information. All data is saved automatically, so you can continue later.',
        vehicleTypes: {
          car: { title: 'Passenger Car', desc: 'Personal use' },
          suv: { title: 'SUV/Jeep', desc: 'Off-road' },
          van: { title: 'Van', desc: 'Cargo/Combi' },
          motorcycle: { title: 'Motorcycle', desc: 'Two-wheeled' },
          truck: { title: 'Truck', desc: 'Cargo' },
          bus: { title: 'Bus', desc: 'Passenger' }
        }
      },
      sellerType: {
        title: 'Seller Type',
        subtitle: 'Define the seller type to personalize the process',
        continue: 'Continue',
        back: 'Back',
        private: {
          title: 'Private Person',
          description: 'Selling my own car',
          features: {
            0: 'No tax obligations',
            1: 'Lower fees',
            2: 'Direct communication',
            3: 'Flexible terms'
          }
        },
        dealer: {
          title: 'Dealer',
          description: 'Vehicle dealer',
          features: {
            0: 'Professional service',
            1: 'Quality guarantee',
            2: 'Financing options',
            3: 'Commercial registration'
          }
        },
        company: {
          title: 'Company',
          description: 'Company selling fleet vehicles',
          features: {
            0: 'Large vehicle inventory',
            1: 'Professional service',
            2: 'Commercial registration',
            3: 'Special conditions'
          }
        },
        infoTitle: 'Why is it important to choose the right seller type?',
        infoText: 'The seller type determines what documents will be required, what fees will apply, and what rights and obligations you will have as a seller.'
      }
    },
    nav: { 
      home: 'Home', 
      cars: 'Search Cars', 
      sell: 'Sell', 
      brandGallery: 'Brand Gallery', 
      login: 'Login', 
      register: 'Register', 
      logout: 'Logout',
      favorites: 'Favorites',
      messages: 'Messages',
      notifications: 'Notifications',
      events: 'Events',
      myAccount: 'My Account',
      settings: 'Settings',
      profile: 'Profile',
      dashboard: 'Dashboard',
      dealers: 'Dealers',
      finance: 'Finance',
      insurance: 'Insurance',
      about: 'About',
      contact: 'Contact',
      help: 'Help',
      advancedSearch: 'Advanced Search',
      explore: 'Explore',
      exploreCars: 'Explore Cars',
      topBrands: 'Top Brands',
      searchCars: 'Search Cars'
    },
    profileTypes: {
      private: 'Private',
      dealer: 'Dealer',
      company: 'Company',
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your profile and settings',
      editProfile: 'Edit Profile',
      addCar: 'Add Car',
      businessInfo: 'Business Information',
      messages: 'Messages',
      logout: 'Logout',
      load_user_error_generic: 'Error loading profile',
      personalInfo: 'Personal Information',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      displayName: 'Name',
      email: 'Email',
      phoneNumber: 'Phone',
      city: 'City',
      region: 'Region',
      preferredLanguage: 'Preferred Language',
      memberSince: 'Member Since',
      notSet: 'Not Set',
      bio: 'Bio',
      bioPlaceholder: 'Write a short bio about yourself...',
      saveChanges: 'Save Changes',
      cancelEdit: 'Cancel',
      gallery: 'Gallery',
      addImage: 'Add Image',
      changeCover: 'Change Cover',
      uploadCover: 'Upload Cover',
      anonymous: 'Anonymous',
      notLoggedIn: 'Please sign in to view your profile',
      view: 'View',
      stats: {
        cars: 'Cars',
        favorites: 'Favorites',
        messages: 'Messages',
        views: 'Views'
      },
      myCars: 'My Cars',
      noCars: 'You have no cars listed',
      noCarsDescription: 'Start selling your vehicles now',
      addFirstCar: 'Add First Car',
      garage: {
        title: 'My Garage',
        myGarage: 'My Garage',
        viewGarage: 'View Garage',
        emptyTitle: 'Garage is Empty',
        emptyDescription: 'Add vehicles to your garage for quick access and management',
        addToGarage: 'Add to Garage',
        removeFromGarage: 'Remove from Garage',
        totalCars: 'Total Vehicles',
        activeCars: 'Active Listings',
        soldCars: 'Sold',
        draftCars: 'Drafts',
        statistics: 'Garage Statistics',
        manageAll: 'Manage All',
        sortBy: 'Sort by',
        filterBy: 'Filter by',
        status: {
          all: 'All',
          active: 'Active',
          sold: 'Sold',
          draft: 'Drafts',
          pending: 'Pending Approval'
        }
      },
      accountSettings: 'Account Settings',
      notifications: 'Notifications',
      privacy: 'Privacy',
      security: 'Security',
      deleteAccount: 'Delete Account',
      deleteAccountConfirm: 'Are you sure you want to delete your account?'
    },
    languages: {
      bulgarian: 'Bulgarian',
      english: 'English',
      bg: 'Bulgarian',
      en: 'English'
    },
    topBrands: {
      topBrands: 'Top Brands',
      allBrands: 'All Brands',
      viewAll: 'View All',
      series: 'series',
      popularBrands: 'Popular Brands',
      generation: 'Generation'
    },
    footer: {
      description: 'The leading platform for buying and selling cars in Bulgaria with thousands of verified listings.',
      quickLinks: 'Quick Links', services: 'Services', contact: 'Contact', support: 'Support',
      address: 'Sofia, Bulgaria', rights: 'All rights reserved.', privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', dataDeletion: 'Data Deletion'
    },
    contact: {
      title: 'Contact Us', subtitle: 'We are here to help you with any questions or concerns. Get in touch with our team.',
      info: {
        title: 'Get in Touch',
        address: { title: 'Address', text: 'Sofia, Bulgaria' },
        phone: { title: 'Phone', text: '+359 2 123 4567' },
        email: { title: 'Email', text: 'info@globulcars.bg' },
        hours: { title: 'Working Hours', text: 'Mon-Fri: 9:00-18:00' }
      },
      form: {
        title: 'Send us a Message', success: 'Thank you! Your message has been sent successfully.',
        name: 'Full Name', email: 'Email Address', phone: 'Phone Number', inquiryType: 'Inquiry Type',
        inquiryTypes: { general: 'General Inquiry', support: 'Technical Support', sales: 'Sales Question' },
        subject: 'Subject', message: 'Message', send: 'Send Message'
      }
    },
    carSearch: { tabs: { search: 'Search', filters: 'Filters', popular: 'Popular', trending: 'Trending' }, searching: 'Searching...' },
    searchResults: {
      loading: 'Loading results...', empty: 'No results found', count: 'results found',
      sort: { relevance: 'Relevance', price: 'Price', date: 'Date', mileage: 'Mileage', year: 'Year' },
      view: { grid: 'Grid', list: 'List' },
      badges: { promoted: 'Promoted', new: 'New', favorite: 'Favorite' },
      pagination: { previous: 'Previous', next: 'Next', page: 'Page' }
    },
    advancedSearch: {
      title: 'Advanced Search: Cars – new or used',
      search: 'Search', searching: 'Searching...', 
      saveSearch: 'Save Search',
      save: 'Save',
      searchName: 'Search Name',
      searchNamePlaceholder: 'e.g. BMW 3 Series 2020+ Sofia',
      saveSearchDescription: 'Give this search a name for quick access later',
      searchSummary: 'Search Summary',
      pleaseEnterName: 'Please enter a name for this search',
      reset: 'Reset', resetFilters: 'Clear Filters',
      applyFiltersAbove: 'Apply filters above', searchCars: 'Search Cars', searchResults: 'Search Results',
      basicData: 'Basic Data', technicalData: 'Technical data', exterior: 'Exterior', interior: 'Interior', offerDetails: 'Offer Details',
      any: 'Any', from: 'from', to: 'to', yes: 'Yes', no: 'No', comingSoon: 'Coming soon...', fuelType: 'Fuel type',
      make: 'Make', model: 'Model', modelPlaceholder: 'e.g. GTI …', vehicleType: 'Vehicle type',
      numberOfSeats: 'Number of Seats', numberOfDoors: 'Number of doors', slidingDoor: 'Sliding door', typeAndCondition: 'Type and condition', paymentType: 'Payment type',
      price: 'Price', firstRegistrationDate: 'First Registration Date', mileage: 'Mileage', huValid: 'HU Valid', numberOfOwners: 'Number of Owners',
      fullServiceHistory: 'Full service history', roadworthy: 'Roadworthy', country: 'Country', cityZipCode: 'City / zip code', radius: 'Radius',
      additionalOffersWithDelivery: 'Additional offers with delivery', preRegistration: 'Pre-Registration', employeeCar: 'Employee\'s car',
      classicVehicle: 'Classic Vehicle', demonstrationVehicle: 'Demonstration Vehicle',
      cabriolet: 'Cabriolet/ Roadster', estate: 'Estate', suv: 'SUV/Pickup', saloon: 'Saloon', small: 'Small Car', sports: 'Sports Car/Coupe', van: 'Van/Minibus', other: 'Other',
      bulgaria: 'Bulgaria', germany: 'Germany', france: 'France', italy: 'Italy', spain: 'Spain', german: 'German', japanese: 'Japanese', american: 'American', korean: 'Korean', french: 'French', italian: 'Italian', swedish: 'Swedish',
      interiorColour: 'Interior Colour', interiorMaterial: 'Interior Material', exteriorColour: 'Exterior Colour', allOptions: 'All', yesOption: 'Yes', noOption: 'No', fromPlaceholder: 'From', toPlaceholder: 'To', power: 'Power', cubicCapacity: 'Cubic Capacity',
      trailerCoupling: 'Trailer Coupling', trailerLoadBraked: 'Trailer Load Braked', trailerLoadUnbraked: 'Trailer Load Unbraked', parkingSensors: 'Parking Sensors', airConditioning: 'Air Conditioning', airbags: 'Airbags', extras: 'Extras',
      alarm: 'Alarm', ambientLighting: 'Ambient Lighting', androidAuto: 'Android Auto', appleCarPlay: 'Apple CarPlay', armrest: 'Armrest', autoTintedMirror: 'Auto-tinted Mirror', additionalHeating: 'Additional Heating', bluetooth: 'Bluetooth', cargoBarrier: 'Cargo Barrier', cdPlayer: 'CD Player',
      dabRadio: 'DAB Radio', digitalCockpit: 'Digital Cockpit', disabledAccess: 'Disabled Access', electricRearSeats: 'Electric Rear Seats', electricSeats: 'Electric Seats', electricSeatsMemory: 'Electric Seats Memory', electricWindows: 'Electric Windows', emergencyCallSystem: 'Emergency Call System', fatigueWarning: 'Fatigue Warning',
      foldingRearSeats: 'Folding Rear Seats', foldingMirrors: 'Folding Mirrors', handsFreeSystem: 'Hands-free System', headUpDisplay: 'Head-up Display', heatedRearSeats: 'Heated Rear Seats', heatedSeats: 'Heated Seats', heatedSteeringWheel: 'Heated Steering Wheel', wirelessCharging: 'Wireless Charging', integratedMusicStreaming: 'Integrated Music Streaming', isofix: 'ISOFIX',
      leatherSteeringWheel: 'Leather Steering Wheel', lumbarSupport: 'Lumbar Support', massageSeats: 'Massage Seats', multifunctionalSteeringWheel: 'Multifunctional Steering Wheel', navigation: 'Navigation', onBoardComputer: 'On-board Computer', paddleShifters: 'Paddle Shifters', passengerIsofix: 'Passenger ISOFIX', seatVentilation: 'Seat Ventilation', rightHandDrive: 'Right-hand Drive',
      skiBag: 'Ski Bag', smokersPackage: 'Smoker\'s Package', audioSystem: 'Audio System', sportsSeats: 'Sports Seats', touchscreen: 'Touchscreen', tunerRadio: 'Tuner Radio', tv: 'TV', usbPort: 'USB Port', virtualMirrors: 'Virtual Mirrors', voiceControl: 'Voice Control',
      winterPackage: 'Winter Package', wlanWifiHotspot: 'WLAN/WiFi Hotspot', seller: 'Seller', dealerRating: 'Dealer Rating', listingOnlineSince: 'Listing Online Since', specialOptions: 'Special Options', listingsWithPhotos: 'Listings with Photos', listingsWithVideo: 'Listings with Video', reducedPrice: 'Reduced Price', nonSmoker: 'Non-smoker',
      taxi: 'Taxi', vatDeductible: 'VAT Deductible', damagedVehicles: 'Damaged Vehicles', dontShow: 'Don\'t Show', commercialExportImport: 'Commercial, Export/Import', approvedUsedCarProgram: 'Approved Used Car Program', choose: 'Choose', location: 'Location', deliveryOffers: 'Delivery Offers', showOnlyDeliveryOffers: 'Show only offers with delivery',
      searchInDescription: 'Search in Description', descriptionPlaceholder: 'Enter keywords to search in description...', enterKeywords: 'Enter keywords...', availability: 'Availability', available: 'Available', reserved: 'Reserved', sold: 'Sold', delivery: 'Delivery', deliveryAvailable: 'Delivery available', pickupOnly: 'Pickup only',
      sellerType: 'Seller Type', dealer: 'Dealer', private: 'Private', garage: 'Garage', extendedWarranty: 'Extended warranty', noWarranty: 'No warranty',
      serviceHistory: 'Service History', partialServiceHistory: 'Partial service history', noServiceHistory: 'No service history', accidentFree: 'Accident free', damaged: 'Damaged', notRoadworthy: 'Not roadworthy', valid: 'Valid', expired: 'Expired', expiringSoon: 'Expiring soon',
      
      // Missing fuel types
      electricFuel: 'Electric',
      ethanolFuel: 'Ethanol',
      hybridDieselElectric: 'Hybrid Diesel/Electric',
      hybridGasolineElectric: 'Hybrid Gasoline/Electric',
      hydrogenFuel: 'Hydrogen',
      lpgFuel: 'LPG (Gas)',
      naturalGasFuel: 'Natural Gas (CNG)',
      otherFuel: 'Other',
      pluginHybridFuel: 'Plug-in Hybrid',
      
      // Missing colors
      black: 'Black',
      beige: 'Beige',
      gray: 'Gray',
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
      
      // Missing interior colors
      interiorBeige: 'Beige',
      interiorBlack: 'Black',
      interiorBlue: 'Blue',
      interiorBrown: 'Brown',
      interiorGray: 'Gray',
      interiorRed: 'Red',
      interiorOther: 'Other',
      
      // Missing interior materials
      alcantara: 'Alcantara',
      fabric: 'Fabric',
      artificialLeather: 'Artificial Leather',
      partialLeather: 'Partial Leather',
      fullLeather: 'Full Leather',
      velour: 'Velour',
      materialOther: 'Other',
      
      // Missing countries
      austria: 'Austria',
      switzerland: 'Switzerland',
      countryOther: 'Other',
      
      // Missing cities
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
      
      // Missing general fields
      subtitle: 'Find your ideal car with detailed filters',
      all: 'All',
      offroad: 'Offroad',
      
      // Missing condition types
      newCondition: 'New',
      usedCondition: 'Used',
      preRegistrationCondition: 'Pre-Registration',
      employeeCondition: 'Employee\'s Car',
      classicCondition: 'Classic',
      demonstrationCondition: 'Demonstration',
      
      // Missing purchase options
      purchaseOption: 'Purchase',
      leasingOption: 'Leasing',
      
      // Missing registration fields
      firstRegistration: 'First Registration',
      huValidUntil: 'HU Valid Until',
      exampleYear: 'e.g. 2020',
      
      // Missing technical data
      fuelTankVolume: 'Fuel Tank Volume',
      
      // Missing fuel type translations
      gasolineFuel: 'Gasoline',
      dieselFuel: 'Diesel',
      
      // Missing technical data translations
      weight: 'Weight',
      cylinders: 'Cylinders',
      driveType: 'Drive Type',
      frontWheelDrive: 'Front Wheel Drive',
      rearWheelDrive: 'Rear Wheel Drive',
      allWheelDrive: 'All Wheel Drive',
      
      // Missing rating translations
      veryGoodRating: 'Very Good',
      goodRating: 'Good',
      satisfactoryRating: 'Satisfactory',
      
      // Missing time period translations
      adOnlineSince: 'Ad Online Since',
      lastDay: 'Last Day',
      last3Days: 'Last 3 Days',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      
      // Missing media translations
      adsWithPictures: 'Ads with Pictures',
      onlyWithPictures: 'Only with Pictures',
      adsWithVideo: 'Ads with Video',
      onlyWithVideo: 'Only with Video',
      
      // Missing offer translations
      discountOffers: 'Discount Offers',
      onlyDiscountOffers: 'Only Discount Offers',
      nonSmokerVehicle: 'Non-smoker Vehicle',
      onlyNonSmoker: 'Only Non-smoker',
      onlyTaxi: 'Only Taxi',
      vatReclaimable: 'VAT Reclaimable',
      onlyVatReclaimable: 'Only VAT Reclaimable',
      warranty: 'Warranty',
      onlyWithWarranty: 'Only with Warranty',
      
      // Missing condition translations
      includeDamaged: 'Include Damaged',
      commercialExport: 'Commercial, Export/Import',
      approvedUsedProgramme: 'Approved Used Car Programme',
      
      // Missing location translations
      city: 'City',
      onlyDeliveryOffers: 'Only Delivery Offers'
    },
    messaging: {
      title: 'Messages',
      subtitle: 'Manage your conversations and messages',
      conversations: 'Conversations',
      newMessage: 'New Message',
      noConversations: 'No conversations',
      selectConversation: 'Select a conversation',
      selectConversationDescription: 'Select a conversation from the list to start chatting',
      noMessages: 'No messages',
      startConversation: 'Start a conversation by typing a message',
      typeMessage: 'Type a message...',
      all: 'All',
      unread: 'Unread',
      noSearchResults: 'No search results',
      noConversationsDescription: 'Start a new conversation with someone',
      send: 'Send',
      online: 'Online',
      lastSeen: 'Last seen',
      typing: 'typing...',
      messageSent: 'Message sent',
      messageDelivered: 'Message delivered',
      messageRead: 'Message read',
      errorSending: 'Error sending',
      errorLoading: 'Error loading',
      retry: 'Retry',
      deleteMessage: 'Delete message',
      editMessage: 'Edit message',
      replyToMessage: 'Reply to message',
      forwardMessage: 'Forward message',
      copyMessage: 'Copy message',
      markAsRead: 'Mark as read',
      markAsUnread: 'Mark as unread',
      archive: 'Archive',
      unarchive: 'Unarchive',
      block: 'Block',
      unblock: 'Unblock',
      report: 'Report',
      mute: 'Mute',
      unmute: 'Unmute',
      searchMessages: 'Search messages',
      filterMessages: 'Filter messages',
      allMessages: 'All messages',
      unreadMessages: 'Unread messages',
      starredMessages: 'Starred messages',
      mediaMessages: 'Media messages',
      fileMessages: 'File messages',
      voiceMessages: 'Voice messages',
      videoMessages: 'Video messages',
      imageMessages: 'Images',
      documentMessages: 'Documents',
      locationMessages: 'Locations',
      contactMessages: 'Contacts',
      systemMessages: 'System messages',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      lastWeek: 'Last week',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      older: 'Older',
      newer: 'Newer',
      loadMore: 'Load more',
      noMoreMessages: 'No more messages',
      connectionError: 'Connection error',
      reconnecting: 'Reconnecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      typingIndicator: 'user is typing...',
      multipleTyping: 'users are typing...',
      messageStatus: {
        sending: 'Sending',
        sent: 'Sent',
        delivered: 'Delivered',
        read: 'Read',
        failed: 'Failed'
      },
      messageTypes: {
        text: 'Text',
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        file: 'File',
        location: 'Location',
        contact: 'Contact',
        sticker: 'Sticker',
        gif: 'GIF',
        emoji: 'Emoji'
      },
      actions: {
        reply: 'Reply',
        forward: 'Forward',
        copy: 'Copy',
        delete: 'Delete',
        edit: 'Edit',
        star: 'Star',
        unstar: 'Unstar',
        pin: 'Pin',
        unpin: 'Unpin',
        save: 'Save',
        share: 'Share',
        download: 'Download',
        open: 'Open',
        print: 'Print',
        export: 'Export',
        import: 'Import'
      },
      settings: {
        title: 'Message settings',
        notifications: 'Notifications',
        sound: 'Sound',
        vibration: 'Vibration',
        preview: 'Preview',
        autoDownload: 'Auto download',
        dataUsage: 'Data usage',
        privacy: 'Privacy',
        security: 'Security',
        backup: 'Backup',
        restore: 'Restore',
        clear: 'Clear',
        reset: 'Reset'
      },
      errors: {
        networkError: 'Network error',
        serverError: 'Server error',
        authenticationError: 'Authentication error',
        permissionError: 'Permission error',
        fileSizeError: 'File too large',
        fileTypeError: 'File type not supported',
        messageTooLong: 'Message too long',
        messageEmpty: 'Message is empty',
        userNotFound: 'User not found',
        conversationNotFound: 'Conversation not found',
        messageNotFound: 'Message not found',
        accessDenied: 'Access denied',
        rateLimited: 'Too many requests',
        maintenanceMode: 'Maintenance mode',
        updateRequired: 'Update required'
      }
    },
    dashboard: {
      title: 'Dashboard', subtitle: 'Manage your listings and activity', overview: 'Overview',
      totalCars: 'Total Cars', viewCars: 'View Cars', totalUsers: 'Total Users', viewUsers: 'View Users', totalMessages: 'Total Messages', viewMessages: 'View Messages', totalRevenue: 'Total Revenue', viewRevenue: 'View Revenue',
      recentActivity: 'Recent Activity', newCars: 'New Cars', viewNewCars: 'View New Cars', newUsers: 'New Users', viewNewUsers: 'View New Users', newMessages: 'New Messages', viewNewMessages: 'View New Messages', systemStatus: 'System Status', viewSystemStatus: 'View System Status',
      analytics: 'Analytics', pageViews: 'Page Views', userEngagement: 'User Engagement', conversionRate: 'Conversion Rate', bounceRate: 'Bounce Rate',
      settings: 'Settings', generalSettings: 'General Settings', siteName: 'Site Name', siteDescription: 'Site Description', saveSettings: 'Save Settings',
      notificationSettings: 'Notification Settings', emailNotifications: 'Email Notifications', smsNotifications: 'SMS Notifications', pushNotifications: 'Push Notifications',
      securitySettings: 'Security Settings', currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm Password', updatePassword: 'Update Password',
      help: 'Help & Support', contactSupport: 'Contact Support',
      stats: {
        listingsOnline: 'Listings Online', thisWeek: 'this week', views: 'Views', lastWeek: 'last week', newInquiries: 'New Inquiries', unread: 'unread', potentialSales: 'Potential Sales', basedOnInquiries: 'Based on inquiries'
      },
      timeAgo: { justNow: 'Just now', hoursAgo: '{{count}} hours ago', dayAgo: '1 day ago', daysAgo: '{{count}} days ago' },
      myListings: 'My Listings', carStatus: { active: 'Active', pending: 'Pending', sold: 'Sold', draft: 'Draft' }, noListings: 'No listings',
      actions: { addNewListing: 'Add New Listing', viewStatistics: 'View Statistics', editProfile: 'Edit Profile', settings: 'Settings', financialReports: 'Financial Reports', support: 'Support', viewAllMessages: 'View All Messages' },
      recentInquiries: 'Recent Inquiries', noMessages: 'No messages', notifications: 'Notifications', noNotifications: 'No notifications', quickActions: 'Quick Actions',
      improvementTips: 'Improvement Tips', tips: { addMorePhotos: 'Add more photos', respondQuickly: 'Respond quickly', maintainCompetitivePrices: 'Maintain competitive prices', updateDescriptions: 'Update descriptions' }
    },
    notifications: {
      title: 'Notifications',
      loading: 'Loading...',
      noNotifications: 'No notifications',
      noNotificationsDesc: 'You will receive notifications here for important events.',
      justNow: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      viewDetails: 'View details',
      markAsRead: 'Mark as read',
      delete: 'Delete',
      markAllRead: 'Mark all as read',
      settings: 'Settings',
      viewAll: 'View all',
      loginRequired: 'Login Required',
      loginToView: 'Please sign in to view your notifications.',
      all: 'All',
      unread: 'Unread',
      messages: 'Messages',
      system: 'System'
    },
    fullThemeDemo: {
      title: 'Full Theme Demo Page', overview: 'Overview', primaryTheme: 'Primary Theme', testPrimary: 'Test Primary', secondaryTheme: 'Secondary Theme', testSecondary: 'Test Secondary', accentTheme: 'Accent Theme', testAccent: 'Test Accent', neutralTheme: 'Neutral Theme', testNeutral: 'Test Neutral',
      typography: 'Typography', headings: 'Headings', testHeadings: 'Test Headings', bodyText: 'Body Text', testBodyText: 'Test Body Text', captions: 'Captions', testCaptions: 'Test Captions', links: 'Links', testLinks: 'Test Links',
      components: 'Components', buttons: 'Buttons', testButtons: 'Test Buttons', inputs: 'Inputs', testInputs: 'Test Inputs', cards: 'Cards', testCards: 'Test Cards', modals: 'Modals', testModals: 'Test Modals',
      layout: 'Layout', grid: 'Grid', testGrid: 'Test Grid', spacing: 'Spacing', testSpacing: 'Test Spacing', borders: 'Borders', testBorders: 'Test Borders', shadows: 'Shadows', testShadows: 'Test Shadows'
    },
    ratingSystem: { label: 'Rating', votes: 'votes' },
    auth: {
      login: { title: 'Login', email: 'Email', password: 'Password', loading: 'Logging in...', submit: 'Login', noAccount: "Don't have an account?", register: 'Register here' },
      register: { title: 'Register', firstName: 'First Name', lastName: 'Last Name', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password', loading: 'Creating account...', submit: 'Register', haveAccount: 'Already have an account?', login: 'Login here' },
      orContinueWith: 'Or continue with', continueWithGoogle: 'Continue with Google', continueWithFacebook: 'Continue with Facebook', continueWithApple: 'Continue with Apple',
      required: {
        title: 'Login Required',
        message: 'Please sign in to access this page.',
        loginButton: 'Sign In',
        backButton: 'Back to Home',
        enjoyFeatures: 'Sign in to enjoy all features and services.'
      },
      pageNames: {
        advancedSearch: 'Advanced Search',
        sell: 'Sell Car',
        sellCar: 'Sell Car',
        brandGallery: 'Brand Gallery',
        dealers: 'Dealers',
        finance: 'Finance',
        thisPage: 'this page'
      }
    },
    errors: {
      notFound: {
        title: '404',
        subtitle: 'Page Not Found',
        description: 'The page you are looking for does not exist or has been moved.',
        homeButton: 'Go to Homepage'
      }
    },
    common: {
      back: 'Back',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      bulgarian: 'Bulgarian',
      english: 'English',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      clearCache: 'Clear Cache',
      cacheCleared: 'Cache cleared successfully!'
    },
    emailVerification: {
      invalidLink: 'Invalid verification link',
      successTitle: 'Verification Successful!',
      successMessage: 'Your email address has been verified successfully!',
      errorTitle: 'Verification Error',
      errorMessage: 'Error verifying email address',
      verifyingTitle: 'Verifying...',
      goToHome: 'Go to Homepage',
      goToLogin: 'Go to Login',
      autoRedirect: 'You will be redirected automatically in 3 seconds...'
    },
    search: {
      placeholder: 'Search for cars...',
      button: 'Search',
      advanced: 'Advanced Search',
      results: 'Results',
      noResults: 'No results found',
      loading: 'Loading...'
    },
    header: {
      loggedAs: 'Logged as',
      // My Account Section
      myAccount: 'My Account',
      overview: 'Overview',
      myStatistics: 'My Statistics',
      myProfile: 'My Profile',
      
      // Vehicles Section
      vehiclesSection: 'My Vehicles',
      carPark: 'My Vehicles',
      myAds: 'My Ads',
      savedSearches: 'Saved Searches',
      mySearches: 'My Searches',
      myFavorites: 'Favorites',
      garage: 'Garage',
      
      // Communication Section
      communicationSection: 'Communication',
      messages: 'Messages',
      notifications: 'Notifications',
      inquiries: 'Inquiries',
      
      // Finance Section
      financeSection: 'Finance',
      financeCalculator: 'Finance Calculator',
      invoices: 'Invoices',
      commissions: 'Commissions',
      financialReports: 'Financial Reports',
      insurance: 'Insurance',
      
      // Settings Section
      settingsSection: 'Settings & Control',
      preferences: 'Preferences',
      
      // Appearance
      appearance: 'Appearance',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      autoMode: 'Auto',
      
      // Text Size
      textSize: 'Text Size',
      textSmall: 'Small',
      textMedium: 'Medium',
      textLarge: 'Large',
      
      // Language
      language: 'Language',
      bulgarian: 'Български',
      english: 'English',
      
      // Notification Settings
      notificationSettings: 'Notification Settings',
      emailNotif: 'Email Notifications',
      pushNotif: 'Push Notifications',
      smsNotif: 'SMS Notifications',
      
      // Account Settings
      accountSettings: 'Account Settings',
      editProfile: 'Edit Profile',
      changeAvatar: 'Change Avatar',
      changeCover: 'Change Cover',
      privacySettings: 'Privacy Settings',
      personalData: 'Personal Data',
      
      // Security
      security: 'Security',
      changePassword: 'Change Password',
      twoFactorAuth: 'Two-Factor Authentication',
      activeSessions: 'Active Sessions',
      
      // Help & Support
      helpSupport: 'Help & Support',
      faq: 'FAQ',
      contactSupport: 'Contact Support',
      reportIssue: 'Report Issue',
      dealerInfo: 'Dealer Info',
      
      // Actions
      logout: 'Logout'
    }
  }
} as const;

export type BulgarianLanguage = 'bg' | 'en';
export default translations;
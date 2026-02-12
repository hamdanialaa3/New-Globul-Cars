// Bulgarian translations - My Listings
export const myListings = {
  title: 'Моите обяви',
  subtitle: 'Управлявайте обявите си, следете представянето и се свързвайте с купувачи.',
  loadError: 'Не успяхме да заредим обявите. Опитайте да презаредите.',
  confirmDelete: 'Сигурни ли сте, че искате окончателно да изтриете тази обява?',
  loading: 'Зареждаме обявите...',
  empty: {
    title: 'Няма обяви',
    subtitle: 'Все още не сте създали автомобилна обява.',
    cta: 'Създай първа обява'
  },
  filters: {
    status: 'Статус:',
    statusAll: 'Всички',
    statusActive: 'Активни',
    statusSold: 'Продадени',
    statusPending: 'В изчакване',
    statusInactive: 'Неактивни',
    sortBy: 'Сортирай по:',
    sortDate: 'Най-нови',
    sortPrice: 'Цена',
    sortViews: 'Прегледи',
    sortInquiries: 'Запитвания',
    order: 'Подредба:',
    orderDesc: 'Низходящо',
    orderAsc: 'Възходящо',
    search: 'Търсене:',
    searchPlaceholder: 'Търси обяви...'
  },
  stats: {
    total: 'Общо обяви',
    active: 'Активни',
    sold: 'Продадени',
    views: 'Общо прегледи',
    inquiries: 'Запитвания',
    messages: 'Съобщения',
    activeAds: 'Активни обяви',
    totalViews: 'Общо прегледи',
    totalListings: 'Общо обяви'
  },
  status: {
    active: 'Активна',
    sold: 'Продадена',
    pending: 'В изчакване',
    inactive: 'Неактивна'
  },
  badges: {
    featured: 'Топ',
    urgent: 'Спешна'
  },
  cards: {
    priceMissing: 'Цена по запитване',
    mileageMissing: 'Без пробег',
    locationMissing: 'Няма локация',
    doors: 'врати',
    seats: 'места',
    doorsMissing: 'Няма данни за врати',
    seatsMissing: 'Няма данни за места',
    safety: 'Сигурност',
    comfort: 'Комфорт',
    infotainment: 'Инфотеймънт',
    extras: 'Екстри',
    features: 'функции',
    dealer: 'Дилър',
    private: 'Частно лице'
  },
  actions: {
    view: 'Преглед на обявата',
    edit: 'Редактирай',
    deactivate: 'Деактивирай',
    activate: 'Активирай',
    unfeature: 'Премахни от топ',
    feature: 'Направи топ',
    delete: 'Изтрий обявата',
    errorGeneric: 'Нещо се обърка. Опитайте отново.'
  }
} as const;

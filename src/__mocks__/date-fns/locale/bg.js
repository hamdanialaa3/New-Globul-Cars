// Manual Jest mock for date-fns/locale/bg to resolve ESM import errors in tests
module.exports = {
  code: 'bg',
  formatDistance: () => '',
  formatRelative: () => '',
    localize: {
      month: () => 'яну',
      day: () => 'пн',
      era: () => 'сл.Хр.',
      quarter: () => 'Q1',
      dayPeriod: () => 'сутрин',
      ordinalNumber: () => '1',
    },
    formatLong: {
      date: () => 'dd.MM.yyyy',
      time: () => 'HH:mm',
      dateTime: () => 'dd.MM.yyyy HH:mm',
    },
    match: {
      ordinalNumber: () => null,
      month: () => null,
      day: () => null,
    }
};

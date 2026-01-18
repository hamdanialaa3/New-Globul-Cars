/**
 * أدوات تنسيق الأسعار
 * Price Formatting Utilities
 */

export const formatPrice = (price: number, currency: 'EUR' | 'BGN' = 'EUR'): string => {
  const formatter = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
};

export const formatPriceRange = (
  low: number,
  high: number,
  currency: 'EUR' | 'BGN' = 'EUR'
): string => {
  return `${formatPrice(low, currency)} - ${formatPrice(high, currency)}`;
};

export const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat('bg-BG').format(mileage) + ' km';
};

export const formatYear = (year: number): string => {
  return year.toString();
};

export const getPriceColor = (price: number, average: number): string => {
  const deviation = ((price - average) / average) * 100;

  if (deviation < -10) {
    return '#16a34a'; // Green (good price)
  } else if (deviation > 10) {
    return '#dc2626'; // Red (high price)
  }

  return '#f59e0b'; // Orange (fair price)
};

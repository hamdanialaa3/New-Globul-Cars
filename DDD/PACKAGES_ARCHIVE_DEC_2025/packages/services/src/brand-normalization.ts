// Shared Brand Normalization Utilities
// توحيد أسماء الماركات لاستخدام موحّد بين الخدمات (النماذج + الشعارات)

import { ALL_CAR_BRANDS } from './allCarBrands';

// Strip to normalized key: lowercase, remove diacritics, keep a-z0-9 only
export const normalizeKey = (s: string): string =>
  s
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '');

// Build a quick lookup for canonical names (case-insensitive)
const CANONICAL_BY_KEY: Record<string, string> = ALL_CAR_BRANDS.reduce((acc, name) => {
  acc[normalizeKey(name)] = name;
  return acc;
}, {} as Record<string, string>);

// Common aliases and short forms mapped to canonical brand names
const ALIASES: Record<string, string> = {
  // Volkswagen
  'vw': 'Volkswagen',
  'volkswagon': 'Volkswagen',
  // Mercedes-Benz
  'mb': 'Mercedes-Benz',
  'merc': 'Mercedes-Benz',
  'mercedes': 'Mercedes-Benz',
  'mercedesbenz': 'Mercedes-Benz',
  // BMW
  'bmw': 'BMW',
  // Skoda
  'skoda': 'Skoda',
  'skodaauto': 'Skoda',
  'škoda': 'Skoda',
  // Citroën
  'citroen': 'Citroën',
  'citroenc': 'Citroën',
  'citroën': 'Citroën',
  // Other common typos/shortcuts
  'vauxhall': 'Opel',
  'bentley': 'Bentley',
  'rollsroyce': 'Rolls-Royce',
  'alfa': 'Alfa Romeo',
  'landrover': 'Land Rover',
  'rangerover': 'Land Rover',
};

/**
 * Resolve a user-provided brand string to a canonical brand name from ALL_CAR_BRANDS.
 * Falls back to capitalized input when no match is found.
 */
export const resolveCanonicalBrand = (input: string): string => {
  if (!input) return '';
  const key = normalizeKey(input);

  // 1) Exact canonical (case-insensitive)
  const direct = CANONICAL_BY_KEY[key];
  if (direct) return direct;

  // 2) Alias mapping
  const alias = ALIASES[key];
  if (alias) return alias;

  // 3) Heuristic capitalization as last resort
  return input
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Convert brand to filename-safe variant if needed.
 * Currently returns canonical brand; update here if logo files need different mapping.
 */
export const brandToLogoFileKey = (brand: string): string => {
  // If your logo assets use exact canonical names (e.g., Mercedes-Benz.png), keep as-is.
  // If needed, introduce replacements here (e.g., replace spaces or special chars).
  return resolveCanonicalBrand(brand);
};

export default {
  normalizeKey,
  resolveCanonicalBrand,
  brandToLogoFileKey,
};

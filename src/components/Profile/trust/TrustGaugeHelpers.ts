// src/components/Profile/trust/TrustGaugeHelpers.ts
// Trust Gauge Helper Functions
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { TrustLevel } from '../../../services/profile/trust-score-service';

// Get gauge color based on trust level
export const getTrustColor = (level: TrustLevel): string => {
  const colors: Record<TrustLevel, string> = {
    unverified: '#9E9E9E',  // Grey
    basic: '#FF9800',       // Amber
    trusted: '#2196F3',     // Blue
    verified: '#4CAF50',    // Green
    premium: '#FFD700'      // Gold
  };
  return colors[level];
};

// Get level icon component
export const getLevelIcon = (level: TrustLevel) => {
  const icons = {
    unverified: 'XCircle',
    basic: 'AlertTriangle',
    trusted: 'CheckCircle',
    verified: 'ShieldCheck',
    premium: 'Crown'
  };
  return icons[level];
};

// Get level name in both languages
export const getLevelName = (level: TrustLevel, language: 'bg' | 'en'): string => {
  const names: Record<TrustLevel, { bg: string; en: string }> = {
    unverified: { bg: 'Непотвърден', en: 'Unverified' },
    basic: { bg: 'Основен', en: 'Basic' },
    trusted: { bg: 'Доверен', en: 'Trusted' },
    verified: { bg: 'Потвърден', en: 'Verified' },
    premium: { bg: 'Премиум', en: 'Premium' }
  };
  return names[level][language];
};

// Convert polar to cartesian coordinates
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

// Create SVG arc path for trust score (270° range)
// ⚡ RESIZED: Updated for 90% of original gauge (220px → 198px)
export const createTrustArcPath = (score: number) => {
  const startAngle = -225;
  const endAngle = startAngle + (270 * score) / 100;
  const radius = 75;  // Changed from 83 to 75 (83 * 0.9 ≈ 75)
  const centerX = 99;  // Changed from 110 to 99 (110 * 0.9)
  const centerY = 99;  // Changed from 110 to 99 (110 * 0.9)
  
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = score > 50 ? 1 : 0;
  
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};


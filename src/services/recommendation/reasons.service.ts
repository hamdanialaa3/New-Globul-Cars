/**
 * 💬 Recommendation Reasons Service
 * Generates human-readable reasons for recommendations
 * 
 * @description Provides localized explanations for why a car was recommended
 * @languages Bulgarian (bg), English (en)
 * @version 1.0.0
 */

import { RecommendationReason, ScoreBreakdown, CarMetadata } from './types';

// ============================================================================
// REASON TEMPLATES
// ============================================================================

interface ReasonTemplate {
  key: string;
  priority: number;
  text: {
    bg: string;
    en: string;
  };
  condition: (breakdown: ScoreBreakdown, car: CarMetadata) => boolean;
  params?: (breakdown: ScoreBreakdown, car: CarMetadata) => Record<string, string | number>;
}

const REASON_TEMPLATES: ReasonTemplate[] = [
  // Brand Affinity (highest priority)
  {
    key: 'brand_affinity',
    priority: 100,
    text: {
      bg: 'Защото харесвате {brand}',
      en: 'Because you like {brand}'
    },
    condition: (breakdown) => breakdown.brandAffinityBonus >= 60,
    params: (_, car) => ({ brand: car.brand })
  },
  
  // Contacted similar brand
  {
    key: 'contacted_brand',
    priority: 95,
    text: {
      bg: 'Свързахте се за подобен {brand}',
      en: 'You contacted about a similar {brand}'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'contacted_brand'),
    params: (_, car) => ({ brand: car.brand })
  },
  
  // Favorited similar
  {
    key: 'favorited_similar',
    priority: 90,
    text: {
      bg: 'Подобен на любимите ви автомобили',
      en: 'Similar to your favorite cars'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'favorited_brand')
  },
  
  // High interest in brand
  {
    key: 'brand_interest',
    priority: 85,
    text: {
      bg: 'Разглеждахте много {brand} автомобили',
      en: 'You viewed many {brand} cars'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'brand_interest'),
    params: (_, car) => ({ brand: car.brand })
  },
  
  // Brand match from preferences
  {
    key: 'brand_match',
    priority: 80,
    text: {
      bg: 'Съответства на предпочитанията ви за {brand}',
      en: 'Matches your {brand} preference'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'brand_match'),
    params: (_, car) => ({ brand: car.brand })
  },
  
  // Price match
  {
    key: 'price_match',
    priority: 75,
    text: {
      bg: 'В желания от вас ценови диапазон',
      en: 'In your preferred price range'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'price_match')
  },
  
  // Price drop
  {
    key: 'price_drop',
    priority: 72,
    text: {
      bg: 'Цената е намалена с {amount} лв',
      en: 'Price reduced by {amount} BGN'
    },
    condition: (breakdown, car) => car.priceDropped === true && (car.priceDropAmount || 0) > 0,
    params: (_, car) => ({ amount: car.priceDropAmount || 0 })
  },
  
  // Good deal
  {
    key: 'good_deal',
    priority: 70,
    text: {
      bg: 'Добра цена спрямо пазара',
      en: 'Good deal compared to market'
    },
    condition: (_, car) => car.marketPriceComparison === 'below'
  },
  
  // Trending
  {
    key: 'trending',
    priority: 68,
    text: {
      bg: 'Популярен автомобил - {views} прегледа днес',
      en: 'Popular car - {views} views today'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'trending'),
    params: (_, car) => ({ views: car.viewsToday })
  },
  
  // Fast selling
  {
    key: 'fast_selling',
    priority: 65,
    text: {
      bg: 'Бързо продаващ се модел',
      en: 'Fast selling model'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'fast_selling')
  },
  
  // New listing
  {
    key: 'new_listing',
    priority: 62,
    text: {
      bg: 'Ново! Добавено наскоро',
      en: 'New! Recently added'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'new_listing')
  },
  
  // Recent listing
  {
    key: 'recent_listing',
    priority: 58,
    text: {
      bg: 'Добавено преди {hours} часа',
      en: 'Added {hours} hours ago'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'recent_listing'),
    params: (_, car) => ({ hours: Math.round((Date.now() - car.createdAt) / (1000 * 60 * 60)) })
  },
  
  // German brand boost
  {
    key: 'german_quality',
    priority: 55,
    text: {
      bg: 'Немско качество',
      en: 'German quality'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'german_boost')
  },
  
  // Japanese reliability
  {
    key: 'japanese_reliable',
    priority: 53,
    text: {
      bg: 'Японска надеждност',
      en: 'Japanese reliability'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'japanese_boost')
  },
  
  // Similar views
  {
    key: 'similar_views',
    priority: 50,
    text: {
      bg: 'Подобен на автомобили, които разгледахте',
      en: 'Similar to cars you viewed'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'similar_views')
  },
  
  // High quality listing
  {
    key: 'high_quality',
    priority: 45,
    text: {
      bg: 'Качествена обява с много снимки',
      en: 'High quality listing with many photos'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'high_quality')
  },
  
  // Fuel match
  {
    key: 'fuel_match',
    priority: 40,
    text: {
      bg: 'Съответства на предпочитаното гориво',
      en: 'Matches your fuel preference'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'fuel_match')
  },
  
  // Body type match
  {
    key: 'body_match',
    priority: 38,
    text: {
      bg: 'Съответства на предпочитания тип каросерия',
      en: 'Matches your body type preference'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'body_match')
  },
  
  // Popular year range
  {
    key: 'popular_year',
    priority: 35,
    text: {
      bg: 'Популярна година ({year})',
      en: 'Popular year ({year})'
    },
    condition: (breakdown) => breakdown.factors.some(f => f.name === 'popular_year'),
    params: (_, car) => ({ year: car.year })
  },
  
  // Default/Discovery
  {
    key: 'discovery',
    priority: 10,
    text: {
      bg: 'Може да ви хареса',
      en: 'You might like this'
    },
    condition: () => true // Always matches as fallback
  }
];

// ============================================================================
// REASON GENERATION
// ============================================================================

/**
 * Generate primary reason for a recommendation
 */
export const generatePrimaryReason = (
  breakdown: ScoreBreakdown,
  car: CarMetadata
): RecommendationReason => {
  // Find the highest priority matching reason
  for (const template of REASON_TEMPLATES) {
    if (template.condition(breakdown, car)) {
      const text = { ...template.text };
      
      // Replace placeholders with params
      if (template.params) {
        const params = template.params(breakdown, car);
        Object.entries(params).forEach(([key, value]) => {
          text.bg = text.bg.replace(`{${key}}`, String(value));
          text.en = text.en.replace(`{${key}}`, String(value));
        });
      }
      
      return {
        key: template.key,
        params: template.params ? template.params(breakdown, car) : undefined,
        text,
        priority: template.priority
      };
    }
  }
  
  // Fallback (should never reach here due to 'discovery' template)
  return {
    key: 'discovery',
    text: {
      bg: 'Може да ви хареса',
      en: 'You might like this'
    },
    priority: 10
  };
};

/**
 * Generate additional reasons for a recommendation
 */
export const generateAdditionalReasons = (
  breakdown: ScoreBreakdown,
  car: CarMetadata,
  primaryKey: string,
  maxReasons = 2
): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];
  
  for (const template of REASON_TEMPLATES) {
    if (reasons.length >= maxReasons) break;
    if (template.key === primaryKey) continue; // Skip primary
    if (template.key === 'discovery') continue; // Skip fallback
    
    if (template.condition(breakdown, car)) {
      const text = { ...template.text };
      
      if (template.params) {
        const params = template.params(breakdown, car);
        Object.entries(params).forEach(([key, value]) => {
          text.bg = text.bg.replace(`{${key}}`, String(value));
          text.en = text.en.replace(`{${key}}`, String(value));
        });
      }
      
      reasons.push({
        key: template.key,
        params: template.params ? template.params(breakdown, car) : undefined,
        text,
        priority: template.priority
      });
    }
  }
  
  return reasons;
};

/**
 * Get reason text in specific language
 */
export const getReasonText = (
  reason: RecommendationReason,
  language: 'bg' | 'en' = 'bg'
): string => {
  return reason.text[language] || reason.text.en;
};

export default {
  generatePrimaryReason,
  generateAdditionalReasons,
  getReasonText
};

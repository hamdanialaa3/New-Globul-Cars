/**
 * Short Prompt Template System
 * فصل المرجع عن الـ prompt التنفيذي
 * 
 * بدلاً من إرسال 1500+ سطر في كل استدعاء:
 * - المرجع مخزن محلياً
 * - الـ prompt قصير ومحدد
 */

import { AdGenerationInput, AdGenerationOutput } from './schemas/ad-generation.schema';

/**
 * Reference document IDs - stored separately, not in every prompt
 */
export const REFERENCE_DOCS = {
  AD_PUBLISHING: 'ad_publishing_v1',
  CONTENT_POLICY: 'content_policy_v1',
  IMAGE_GUIDELINES: 'image_guidelines_v1',
  SEO_RULES: 'seo_rules_v1'
} as const;

/**
 * Short system prompt - references docs by ID instead of including full content
 */
export const SYSTEM_PROMPTS = {
  /**
   * Vehicle description generation - 90% reduction in prompt size
   */
  VEHICLE_DESCRIPTION: `You are a vehicle listing assistant for a Bulgarian car marketplace.
Language: Bulgarian (BG) or English (EN) as specified.
Region: Bulgaria | Currency: EUR

CRITICAL: Return ONLY valid JSON matching the schema. No markdown, no explanations.

Rules (from doc: ad_publishing_v1):
- Professional, informative tone
- Highlight key features concisely
- No competitor mentions
- No placeholder text
- No personal seller info in description`,

  /**
   * Image analysis prompt
   */
  IMAGE_ANALYSIS: `Analyze vehicle images for a car marketplace listing.
Return JSON with: recommendedMainImage (index), flaggedImages (issues array).

Flag images for: blur, low_resolution, inappropriate, watermark, plate_visible
Confidence: 0.0-1.0`,

  /**
   * SEO optimization prompt
   */
  SEO_OPTIMIZATION: `Generate SEO-optimized content for vehicle listing.
Region: Bulgaria | Language: as specified

Return: metaDescription (max 155 chars), title (max 80 chars), hashtags (max 10)`
};

/**
 * Build the minimal execution prompt
 */
export function buildAdGenerationPrompt(
  input: AdGenerationInput,
  language: 'bg' | 'en' = 'bg'
): string {
  // Minimal, focused prompt - no fluff
  return `Generate vehicle listing content in ${language === 'bg' ? 'Bulgarian' : 'English'}.

Vehicle: ${input.year} ${input.make} ${input.model}
Price: €${input.price.toLocaleString()}
${input.mileage ? `Mileage: ${input.mileage.toLocaleString()} km` : ''}
${input.fuelType ? `Fuel: ${input.fuelType}` : ''}
${input.transmission ? `Transmission: ${input.transmission}` : ''}
${input.power ? `Power: ${input.power} HP` : ''}
${input.equipment?.length ? `Equipment: ${input.equipment.slice(0, 5).join(', ')}${input.equipment.length > 5 ? '...' : ''}` : ''}
Seller: ${input.sellerType}
Images: ${input.images.length}

Return JSON:
{
  "requestId": "<unique_id>",
  "generatedAt": "<ISO_timestamp>",
  "content": {
    "title": "<max 80 chars>",
    "shortDescription": "<max 160 chars>",
    "fullDescription": "<100-2000 chars>",
    "metaDescription": "<max 155 chars>",
    "hashtags": ["#tag1", "#tag2", ...],
    "highlights": ["highlight1", "highlight2", ...]
  },
  "quality": {
    "score": <0-100>,
    "issues": [],
    "requiresReview": <boolean>
  },
  "meta": {
    "provider": "<provider>",
    "model": "<model>",
    "tokensUsed": 0,
    "processingTimeMs": 0,
    "retryCount": 0
  }
}`;
}

/**
 * Build minimal image analysis prompt
 */
export function buildImageAnalysisPrompt(imageUrls: string[]): string {
  return `Analyze ${imageUrls.length} vehicle images.

Return JSON:
{
  "recommendedMainImage": <best_index>,
  "flaggedImages": [
    {"index": <n>, "reason": "<blur|low_resolution|inappropriate|watermark|plate_visible>", "confidence": <0-1>}
  ]
}

Only flag images with actual issues. If all images are good, return empty flaggedImages array.`;
}

/**
 * One-shot example for few-shot learning (single, compact example)
 */
export const EXAMPLE_OUTPUT: Partial<AdGenerationOutput> = {
  content: {
    title: "BMW 320d M-Sport 2020 - Отлично състояние",
    shortDescription: "Спортен седан с пълно сервизно обслужване. М-пакет, кожен салон, LED фарове. Гаранция 6 месеца.",
    fullDescription: "Предлагаме елегантен BMW 320d от 2020 г. с M-Sport пакет. Автомобилът е в отлично състояние с пълна сервизна история. Разполага с кожен салон, навигация, LED фарове и адаптивен круиз контрол. Един собственик, негарантиран пробег. Предлагаме 6 месеца гаранция.",
    metaDescription: "BMW 320d M-Sport 2020 - кожа, навигация, LED, адаптивен круиз. Пълна история, 6 мес. гаранция. Цена €28 500",
    hashtags: ["#BMW", "#320d", "#MSport", "#diesel", "#sedan", "#premium"],
    highlights: [
      "M-Sport пакет",
      "Кожен салон",
      "Пълна сервизна история",
      "6 месеца гаранция"
    ]
  },
  quality: {
    score: 92,
    issues: [],
    requiresReview: false
  }
};

/**
 * Build complete prompt with optional example
 */
export function buildCompletePrompt(
  input: AdGenerationInput,
  options: {
    language?: 'bg' | 'en';
    includeExample?: boolean;
  } = {}
): { system: string; user: string } {
  const { language = 'bg', includeExample = false } = options;
  
  let user = buildAdGenerationPrompt(input, language);
  
  if (includeExample) {
    user += `\n\nExample output format:\n${JSON.stringify(EXAMPLE_OUTPUT, null, 2).slice(0, 500)}...`;
  }
  
  return {
    system: SYSTEM_PROMPTS.VEHICLE_DESCRIPTION,
    user
  };
}

/**
 * Token estimation (rough)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for mixed content
  return Math.ceil(text.length / 4);
}

/**
 * Check if prompt is within limits
 */
export function validatePromptSize(
  system: string, 
  user: string, 
  maxTokens: number = 4000
): { valid: boolean; estimatedTokens: number; warning?: string } {
  const totalTokens = estimateTokens(system) + estimateTokens(user);
  
  if (totalTokens > maxTokens) {
    return {
      valid: false,
      estimatedTokens: totalTokens,
      warning: `Prompt too long: ~${totalTokens} tokens (max: ${maxTokens})`
    };
  }
  
  if (totalTokens > maxTokens * 0.8) {
    return {
      valid: true,
      estimatedTokens: totalTokens,
      warning: `Prompt near limit: ~${totalTokens} tokens (80% of ${maxTokens})`
    };
  }
  
  return { valid: true, estimatedTokens: totalTokens };
}

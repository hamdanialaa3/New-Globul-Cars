/**
 * Multi-Language NLU Service
 * خدمة فهم اللغات الطبيعية متعددة اللغات
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from '@/services/logger-service';

interface LanguageDetectionResult {
  detectedLanguage: string;
  languageCode: string;
  confidence: number;
  isReliable: boolean;
  alternatives?: Array<{
    language: string;
    code: string;
    confidence: number;
  }>;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  action: string;
  parameters: Record<string, any>;
}

interface SentenceSimplification {
  original: string;
  simplified: string;
  complexity: 'simple' | 'medium' | 'complex';
  keyConcepts: string[];
}

type SupportedLanguage = 'bg' | 'en' | 'ar' | 'ru' | 'tr';

interface LanguageConfig {
  [key: string]: {
    name: string;
    nativeName: string;
    searchTermVariations: string[];
    numberFormat: string;
    dateFormat: string;
  };
}

class MultiLanguageNLUService {
  private static instance: MultiLanguageNLUService;
  private genAI: GoogleGenerativeAI;
  private supportedLanguages: Set<SupportedLanguage> = new Set(['bg', 'en', 'ar', 'ru', 'tr']);

  private languageConfigs: LanguageConfig = {
    bg: {
      name: 'Bulgarian',
      nativeName: 'Български',
      searchTermVariations: ['kola', 'mashina', 'avtomobil'],
      numberFormat: '1 234,56',
      dateFormat: 'dd.MM.yyyy'
    },
    en: {
      name: 'English',
      nativeName: 'English',
      searchTermVariations: ['car', 'vehicle', 'automobile'],
      numberFormat: '1,234.56',
      dateFormat: 'MM/dd/yyyy'
    },
    ar: {
      name: 'Arabic',
      nativeName: 'العربية',
      searchTermVariations: ['سيارة', 'auto', 'vehicle'],
      numberFormat: '١٬٢٣٤٫٥٦',
      dateFormat: 'dd/MM/yyyy'
    },
    ru: {
      name: 'Russian',
      nativeName: 'Русский',
      searchTermVariations: ['автомобиль', 'машина', 'авто'],
      numberFormat: '1 234,56',
      dateFormat: 'dd.MM.yyyy'
    },
    tr: {
      name: 'Turkish',
      nativeName: 'Türkçe',
      searchTermVariations: ['araba', 'otomobil', 'araç'],
      numberFormat: '1.234,56',
      dateFormat: 'dd.MM.yyyy'
    }
  };

  private constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY;
    if (!apiKey) {
      logger.warn('Google Generative AI Key not configured for NLU');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  static getInstance(): MultiLanguageNLUService {
    if (!this.instance) {
      this.instance = new MultiLanguageNLUService();
    }
    return this.instance;
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      logger.info('Detecting language', { textLength: text.length });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Detect the language of this text:
        "${text}"
        
        Return JSON with:
        {
          "detectedLanguage": "language name",
          "languageCode": "bg|en|ar|ru|tr|other",
          "confidence": 0-100,
          "isReliable": boolean,
          "alternatives": [
            { "language": "name", "code": "code", "confidence": 0-100 }
          ]
        }
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          detectedLanguage: 'Unknown',
          languageCode: 'unknown',
          confidence: 0,
          isReliable: false
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Language detection failed', error as Error);
      return {
        detectedLanguage: 'Unknown',
        languageCode: 'unknown',
        confidence: 0,
        isReliable: false
      };
    }
  }

  /**
   * Translate text between languages
   */
  async translate(
    text: string,
    targetLanguage: SupportedLanguage,
    sourceLanguage?: SupportedLanguage
  ): Promise<TranslationResult> {
    try {
      logger.info('Translating text', {
        textLength: text.length,
        source: sourceLanguage,
        target: targetLanguage
      });

      // Detect source language if not provided
      let source = sourceLanguage;
      if (!source) {
        const detection = await this.detectLanguage(text);
        source = detection.languageCode as SupportedLanguage;
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const sourceName = this.languageConfigs[source]?.name || source;
      const targetName = this.languageConfigs[targetLanguage]?.name || targetLanguage;

      const prompt = `
        Translate this ${sourceName} text to ${targetName}:
        "${text}"
        
        Provide only the translation, no other text.
      `;

      const response = await model.generateContent(prompt);
      const translatedText = response.response.text().trim();

      return {
        originalText: text,
        translatedText,
        sourceLanguage: source,
        targetLanguage,
        confidence: 85
      };
    } catch (error) {
      logger.error('Translation failed', error as Error);
      throw error;
    }
  }

  /**
   * Analyze intent from user input
   */
  async analyzeIntent(text: string, language?: string): Promise<IntentAnalysis> {
    try {
      logger.info('Analyzing intent', { textLength: text.length });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Analyze the intent of this user input for a car marketplace:
        "${text}"
        
        Determine what action the user wants (search, contact, ask_price, etc.)
        Extract entities like: car make, model, price, year, location, etc.
        
        Return JSON with:
        {
          "intent": "search|contact|ask_price|inquire|save|feedback",
          "confidence": 0-100,
          "entities": [
            { "type": "make|model|price|year|location|condition", "value": "...", "confidence": 0-100 }
          ],
          "action": "what action to take",
          "parameters": { "extracted_data": "..." }
        }
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          intent: 'unknown',
          confidence: 0,
          entities: [],
          action: 'none',
          parameters: {}
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Intent analysis failed', error as Error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: [],
        action: 'none',
        parameters: {}
      };
    }
  }

  /**
   * Simplify complex text
   */
  async simplifyText(text: string, targetLevel: 'simple' | 'medium' | 'complex' = 'simple'): Promise<SentenceSimplification> {
    try {
      logger.info('Simplifying text', { textLength: text.length, level: targetLevel });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Simplify this text to a ${targetLevel} level:
        "${text}"
        
        Extract key concepts.
        Return JSON with:
        {
          "original": "${text}",
          "simplified": "simplified version",
          "complexity": "simple|medium|complex",
          "keyConcepts": ["concept1", "concept2"]
        }
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          original: text,
          simplified: text,
          complexity: 'complex',
          keyConcepts: []
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Text simplification failed', error as Error);
      throw error;
    }
  }

  /**
   * Extract search parameters from natural language
   */
  async extractSearchParameters(query: string, language?: string): Promise<Record<string, any>> {
    try {
      logger.info('Extracting search parameters', { query });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Extract car search parameters from this query:
        "${query}"
        
        Return JSON with structured search parameters:
        {
          "make": "car make if mentioned",
          "model": "car model if mentioned",
          "minPrice": number if price range mentioned,
          "maxPrice": number if price range mentioned,
          "minYear": number if year range mentioned,
          "maxYear": number if year range mentioned,
          "maxMileage": number if mileage mentioned,
          "location": "location if mentioned",
          "bodyType": "sedan|suv|truck|van|etc if mentioned",
          "fuelType": "diesel|petrol|hybrid|electric if mentioned",
          "transmission": "manual|automatic if mentioned",
          "color": "color if mentioned"
        }
      `;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {};
      }

      const params = JSON.parse(jsonMatch[0]);

      // Clean up undefined values
      return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
    } catch (error) {
      logger.error('Parameter extraction failed', error as Error);
      return {};
    }
  }

  /**
   * Format number according to language
   */
  formatNumber(value: number, language: SupportedLanguage): string {
    const config = this.languageConfigs[language];
    if (!config) return value.toString();

    const [intPart, decPart] = value.toString().split('.');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    if (config.numberFormat.includes(',')) {
      return `${formatted},${decPart || '00'}`;
    } else {
      return `${formatted}.${decPart || '00'}`;
    }
  }

  /**
   * Format date according to language
   */
  formatDate(date: Date, language: SupportedLanguage): string {
    const config = this.languageConfigs[language];
    if (!config) return date.toLocaleDateString();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (config.dateFormat) {
      case 'dd.MM.yyyy':
        return `${day}.${month}.${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;

      default:
        return `${day}.${month}.${year}`;
    }
  }

  /**
   * Get language variations for search
   */
  getSearchVariations(searchTerm: string, language: SupportedLanguage): string[] {
    // Basic variations (in real implementation, would use NLP)
    const variations = [searchTerm];

    // Add language-specific variations
    const config = this.languageConfigs[language];
    if (config?.searchTermVariations) {
      variations.push(...config.searchTermVariations);
    }

    // Add common variations
    variations.push(searchTerm.toLowerCase());
    variations.push(searchTerm.toUpperCase());

    return [...new Set(variations)];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }> {
    return Array.from(this.supportedLanguages).map(code => ({
      code,
      name: this.languageConfigs[code]?.name || code,
      nativeName: this.languageConfigs[code]?.nativeName || code
    }));
  }

  /**
   * Normalize text for search
   */
  normalizeForSearch(text: string, language: SupportedLanguage): string {
    // Remove extra spaces
    let normalized = text.trim().replace(/\s+/g, ' ');

    // Convert to lowercase
    normalized = normalized.toLowerCase();

    // Remove special characters (keep alphanumeric and spaces)
    normalized = normalized.replace(/[^a-z0-9а-яα-ωأ-ي\s]/gi, '');

    return normalized;
  }

  /**
   * Check language compatibility
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode as SupportedLanguage);
  }

  /**
   * Get RTL status (right-to-left languages like Arabic)
   */
  isRTLLanguage(languageCode: string): boolean {
    return ['ar'].includes(languageCode);
  }
}

export const multiLanguageNLU = MultiLanguageNLUService.getInstance();

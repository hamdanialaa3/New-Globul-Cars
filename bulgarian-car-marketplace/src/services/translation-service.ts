// Translation Service - Free Alternative to Google Translate
// (Comment removed - was in Arabic)

import { serviceLogger } from './logger-wrapper';

// Mock translation function since google-translate-api-browser is not available
const mockTranslate = async (text: string, options: { from?: string; to: string }) => {
  // Simple mock - just return the original text with a note
  return {
    text: `[Translated to ${options.to}] ${text}`,
    from: options.from || 'auto',
    raw: ''
  };
};

export interface TranslationOptions {
  from?: string;
  to: string;
  text: string;
}

export interface TranslationResult {
  text: string;
  from: {
    language: {
      didYouMean: boolean;
      iso: string;
    };
    text: {
      autoCorrected: boolean;
      value: string;
      didYouMean: boolean;
    };
  };
  raw?: unknown;
}

export class BulgarianTranslationService {
  private supportedLanguages = {
    bg: 'Bulgarian',
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    ru: 'Russian',
    tr: 'Turkish',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean'
  };

  // Translate text
  async translate(options: TranslationOptions): Promise<TranslationResult | null> {
    try {
      const result = await mockTranslate(options.text, {
        from: options.from || 'auto',
        to: options.to
      });

      return {
        text: result.text,
        from: result.from,
        raw: result.raw
      };
    } catch (error) {
      serviceLogger.error('Translation error', error as Error, { from: options.from, to: options.to });
      return null;
    }
  }

  // Translate to Bulgarian
  async translateToBulgarian(text: string, from?: string): Promise<string | null> {
    const result = await this.translate({
      text,
      from,
      to: 'bg'
    });
    return result?.text || null;
  }

  // Translate from Bulgarian
  async translateFromBulgarian(text: string, to: string): Promise<string | null> {
    const result = await this.translate({
      text,
      from: 'bg',
      to
    });
    return result?.text || null;
  }

  // Batch translation
  async translateBatch(texts: string[], to: string, from?: string): Promise<string[]> {
    const results = await Promise.all(
      texts.map(text => this.translate({ text, to, from }))
    );

    return results.map((result, index) => result?.text || texts[index]);
  }

  // Detect language
  async detectLanguage(text: string): Promise<string | null> {
    try {
      const result = await mockTranslate(text, { to: 'en' });
      return result.from.language.iso;
    } catch (error) {
      serviceLogger.error('Language detection error', error as Error, { textLength: text.length });
      return null;
    }
  }

  // Get supported languages
  getSupportedLanguages(): { [key: string]: string } {
    return this.supportedLanguages;
  }

  // Check if language is supported
  isLanguageSupported(languageCode: string): boolean {
    return languageCode in this.supportedLanguages;
  }

  // Get language name
  getLanguageName(languageCode: string): string {
    return (this.supportedLanguages as any)[languageCode] || 'Unknown';
  }

  // Car-specific translations
  async translateCarField(fieldName: string, value: string, targetLang: string): Promise<string | null> {
    // Common car field translations
    const fieldTranslations = {
      make: { bg: 'Марка', en: 'Make' },
      model: { bg: 'Модел', en: 'Model' },
      year: { bg: 'Година', en: 'Year' },
      price: { bg: 'Цена', en: 'Price' },
      mileage: { bg: 'Пробег', en: 'Mileage' },
      fuel: { bg: 'Гориво', en: 'Fuel' },
      transmission: { bg: 'Трансмисия', en: 'Transmission' },
      color: { bg: 'Цвят', en: 'Color' },
      description: { bg: 'Описание', en: 'Description' },
      location: { bg: 'Местоположение', en: 'Location' }
    };

    // If it's a field name, return the translation
    if (fieldName in fieldTranslations) {
      const translations = fieldTranslations as Record<string, Record<string, string>>;
      return translations[fieldName]?.[targetLang] || translations[fieldName]?.['en'] || value;
    }

    // Otherwise, translate the value
    return await this.translate({
      text: value,
      to: targetLang,
      from: 'auto'
    }).then(result => result?.text || value);
  }

  // Translate car specifications
  async translateCarSpecs(specs: Record<string, unknown>, targetLang: string): Promise<Record<string, unknown>> {
    const translatedSpecs: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(specs)) {
      if (typeof value === 'string') {
        translatedSpecs[key] = await this.translateCarField(key, value, targetLang);
      } else {
        translatedSpecs[key] = value;
      }
    }

    return translatedSpecs;
  }

  // Translate messages
  async translateMessage(message: string, targetLang: string, sourceLang?: string): Promise<string | null> {
    return await this.translate({
      text: message,
      to: targetLang,
      from: sourceLang || 'auto'
    }).then(result => result?.text || message);
  }

  // Auto-translate based on user preference
  async autoTranslate(text: string, userLanguage: string = 'bg'): Promise<string> {
    const detectedLang = await this.detectLanguage(text);

    if (detectedLang === userLanguage) {
      return text; // No translation needed
    }

    const result = await this.translate({
      text,
      to: userLanguage,
      from: detectedLang || 'auto'
    });

    return result?.text || text;
  }
}

// Singleton instance
export const bulgarianTranslationService = new BulgarianTranslationService();

// React hook for translation
export const useTranslation = () => {
  return bulgarianTranslationService;
};

// Utility functions
export const translateText = async (text: string, to: string, from?: string): Promise<string | null> => {
  return await bulgarianTranslationService.translate({ text, to, from }).then(result => result?.text || null);
};

export const translateToBulgarian = async (text: string, from?: string): Promise<string | null> => {
  return await bulgarianTranslationService.translateToBulgarian(text, from);
};

export const translateFromBulgarian = async (text: string, to: string): Promise<string | null> => {
  return await bulgarianTranslationService.translateFromBulgarian(text, to);
};

export default bulgarianTranslationService;
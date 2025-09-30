// Translation Service - Free Alternative to Google Translate
// (Comment removed - was in Arabic)

export interface TranslationOptions {
  from?: string;
  to: string;
  text: string;
}

export interface TranslationResult {
  text: string;
  from: string;
  to: string;
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
    ar: 'Arabic'
  };

  // Simple translation dictionary for common terms
  private translationDictionary: { [key: string]: { [key: string]: string } } = {
    // Car-related terms
    make: { bg: 'Марка', en: 'Make', de: 'Marke', fr: 'Marque', es: 'Marca' },
    model: { bg: 'Модел', en: 'Model', de: 'Modell', fr: 'Modèle', es: 'Modelo' },
    year: { bg: 'Година', en: 'Year', de: 'Jahr', fr: 'Année', es: 'Año' },
    price: { bg: 'Цена', en: 'Price', de: 'Preis', fr: 'Prix', es: 'Precio' },
    mileage: { bg: 'Пробег', en: 'Mileage', de: 'Kilometerstand', fr: 'Kilométrage', es: 'Kilometraje' },
    fuel: { bg: 'Гориво', en: 'Fuel', de: 'Kraftstoff', fr: 'Carburant', es: 'Combustible' },
    transmission: { bg: 'Трансмисия', en: 'Transmission', de: 'Getriebe', fr: 'Transmission', es: 'Transmisión' },
    color: { bg: 'Цвят', en: 'Color', de: 'Farbe', fr: 'Couleur', es: 'Color' },
    description: { bg: 'Описание', en: 'Description', de: 'Beschreibung', fr: 'Description', es: 'Descripción' },
    location: { bg: 'Местоположение', en: 'Location', de: 'Standort', fr: 'Emplacement', es: 'Ubicación' },

    // Common phrases
    'for sale': { bg: 'за продан', en: 'for sale', de: 'zu verkaufen', fr: 'à vendre', es: 'en venta' },
    'good condition': { bg: 'добро състояние', en: 'good condition', de: 'guter Zustand', fr: 'bon état', es: 'buen estado' },
    'excellent condition': { bg: 'отлично състояние', en: 'excellent condition', de: 'ausgezeichneter Zustand', fr: 'excellent état', es: 'excelente estado' },
    'new': { bg: 'нов', en: 'new', de: 'neu', fr: 'nouveau', es: 'nuevo' },
    'used': { bg: 'употребяван', en: 'used', de: 'gebraucht', fr: 'occasion', es: 'usado' }
  };

  // Translate text using dictionary or fallback
  async translate(options: TranslationOptions): Promise<TranslationResult | null> {
    try {
      const { text, from = 'auto', to } = options;

      // Check if we have a direct translation
      const lowerText = text.toLowerCase();
      if (this.translationDictionary[lowerText] && this.translationDictionary[lowerText][to]) {
        return {
          text: this.translationDictionary[lowerText][to],
          from: from === 'auto' ? this.detectLanguage(text) : from,
          to
        };
      }

      // For more complex translations, we'll use a simple fallback
      // In production, you might want to integrate with a translation API
// For now, return the original text with a note
      return {
        text: `${text} [Translation needed: ${from} → ${to}]`,
        from: from === 'auto' ? this.detectLanguage(text) : from,
        to
      };
    } catch (error) {
      console.error('[SERVICE] Translation error:', error);
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

  // Simple language detection
  detectLanguage(text: string): string {
    // Bulgarian detection
    const bulgarianChars = /[а-яъью]/i;
    if (bulgarianChars.test(text)) {
      return 'bg';
    }

    // German detection
    const germanWords = /\b(der|die|das|und|ist|mit|für|von|zu|auf)\b/i;
    if (germanWords.test(text)) {
      return 'de';
    }

    // French detection
    const frenchWords = /\b(le|la|les|et|est|avec|pour|de|à|sur)\b/i;
    if (frenchWords.test(text)) {
      return 'fr';
    }

    // Spanish detection
    const spanishWords = /\b(el|la|los|las|y|es|con|para|de|a|en)\b/i;
    if (spanishWords.test(text)) {
      return 'es';
    }

    // Default to English
    return 'en';
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
    return this.supportedLanguages[languageCode as keyof typeof this.supportedLanguages] || 'Unknown';
  }

  // Car-specific translations
  async translateCarField(fieldName: string, value: string, targetLang: string): Promise<string | null> {
    // If it's a field name, return the translation
    if (this.translationDictionary[fieldName] && this.translationDictionary[fieldName][targetLang]) {
      return this.translationDictionary[fieldName][targetLang];
    }

    // Otherwise, translate the value
    return await this.translate({
      text: value,
      to: targetLang,
      from: 'auto'
    }).then(result => result?.text || value);
  }

  // Translate car specifications
  async translateCarSpecs(specs: { [key: string]: any }, targetLang: string): Promise<{ [key: string]: any }> {
    const translatedSpecs: { [key: string]: any } = {};

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
    const detectedLang = this.detectLanguage(text);

    if (detectedLang === userLanguage) {
      return text; // No translation needed
    }

    const result = await this.translate({
      text,
      to: userLanguage,
      from: detectedLang
    });

    return result?.text || text;
  }

  // Add custom translation
  addTranslation(key: string, translations: { [lang: string]: string }) {
    this.translationDictionary[key.toLowerCase()] = translations;
  }

  // Get all translations
  getTranslations(): { [key: string]: { [key: string]: string } } {
    return this.translationDictionary;
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
// Voice Search Service - خدمة البحث الصوتي
// يدعم 3 لغات: البلغارية، الإنجليزية، العربية

import { logger } from '../logger-service';
import { smartSearchService } from '../search/smart-search.service';
import { CarListing } from '../../types/CarListing';

export interface VoiceSearchConfig {
  language: 'bg-BG' | 'en-US' | 'ar-SA';
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface VoiceSearchResult {
  transcript: string;
  confidence: number;
  parsedQuery: {
    make?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    fuelType?: string;
    transmission?: string;
    city?: string;
    keywords: string[];
  };
  cars: CarListing[];
}

export interface VoiceRecognitionEvent {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

class VoiceSearchService {
  private static instance: VoiceSearchService;
  private recognition: Record<string, unknown> = null;
  private isListening = false;
  private currentLanguage: VoiceSearchConfig['language'] = 'bg-BG';

  // Language-specific patterns
  private readonly patterns = {
    'bg-BG': {
      make: /(?:искам|търся|намери)\s+(\w+)/i,
      year: /(?:от|година|годишен)\s+(\d{4})/i,
      price: /(?:под|до|максимум)\s+(\d+)/i,
      fuelType: {
        diesel: /дизел|газьол/i,
        petrol: /бензин/i,
        electric: /електрически/i,
        hybrid: /хибрид/i
      },
      transmission: {
        automatic: /автоматична|автомат/i,
        manual: /ръчна|мануална/i
      },
      city: /(?:в|във|около)\s+(София|Пловдив|Варна|Бургас)/i
    },
    'en-US': {
      make: /(?:find|search|looking for)\s+(\w+)/i,
      year: /(?:from|year)\s+(\d{4})/i,
      price: /(?:under|below|max)\s+(\d+)/i,
      fuelType: {
        diesel: /diesel/i,
        petrol: /petrol|gasoline|gas/i,
        electric: /electric|ev/i,
        hybrid: /hybrid/i
      },
      transmission: {
        automatic: /automatic|auto/i,
        manual: /manual/i
      },
      city: /(?:in|near)\s+(Sofia|Plovdiv|Varna|Burgas)/i
    },
    'ar-SA': {
      make: /(?:ابحث عن|اريد|عايز)\s+(\w+)/i,
      year: /(?:سنة|موديل)\s+(\d{4})/i,
      price: /(?:تحت|أقل من|ميزانية)\s+(\d+)/i,
      fuelType: {
        diesel: /ديزل/i,
        petrol: /بنزين/i,
        electric: /كهرباء|كهربائي/i,
        hybrid: /هايبرد/i
      },
      transmission: {
        automatic: /اوتوماتيك|أوتوماتيك/i,
        manual: /مانيوال|عادي/i
      },
      city: /(?:في|ب)\s+(صوفيا|بلوفديف|فارنا|بورغاس)/i
    }
  };

  private constructor() {
    this.initializeRecognition();
  }

  static getInstance(): VoiceSearchService {
    if (!VoiceSearchService.instance) {
      VoiceSearchService.instance = new VoiceSearchService();
    }
    return VoiceSearchService.instance;
  }

  /**
   * Initialize Web Speech API
   */
  private initializeRecognition(): void {
    if (typeof window === 'undefined') {
      logger.warn('Voice search not available (SSR)');
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      logger.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.configure({
      language: 'bg-BG',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1
    });
  }

  /**
   * Configure recognition settings
   */
  configure(config: Partial<VoiceSearchConfig>): void {
    if (!this.recognition) return;

    if (config.language) {
      this.currentLanguage = config.language;
      this.recognition.lang = config.language;
    }

    if (config.continuous !== undefined) {
      this.recognition.continuous = config.continuous;
    }

    if (config.interimResults !== undefined) {
      this.recognition.interimResults = config.interimResults;
    }

    if (config.maxAlternatives !== undefined) {
      this.recognition.maxAlternatives = config.maxAlternatives;
    }
  }

  /**
   * Start listening
   */
  async startListening(
    onResult: (event: VoiceRecognitionEvent) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.isListening) {
      logger.warn('Already listening');
      return;
    }

    return new Promise((resolve, reject) => {
      this.recognition.onstart = () => {
        this.isListening = true;
        logger.info('Voice recognition started');
        resolve();
      };

      this.recognition.onresult = (event: React.FormEvent) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        logger.debug('Voice recognition result', { 
          transcript, 
          confidence, 
          isFinal: result.isFinal 
        });

        onResult({
          transcript,
          isFinal: result.isFinal,
          confidence
        });
      };

      this.recognition.onerror = (event: React.FormEvent) => {
        this.isListening = false;
        const error = new Error(`Speech recognition error: ${event.error}`);
        logger.error('Voice recognition error', error, { errorType: event.error });
        if (onError) {
          onError(error);
        } else {
          reject(error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        logger.info('Voice recognition ended');
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      logger.info('Voice recognition stopped');
    } catch (error) {
      logger.error('Error stopping voice recognition', error as Error);
    }
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Parse voice transcript into search query
   */
  parseTranscript(transcript: string, language?: VoiceSearchConfig['language']): VoiceSearchResult['parsedQuery'] {
    const lang = language || this.currentLanguage;
    const patterns = this.patterns[lang];

    const query: VoiceSearchResult['parsedQuery'] = {
      keywords: []
    };

    // Extract make
    const makeMatch = transcript.match(patterns.make);
    if (makeMatch) {
      query.make = makeMatch[1];
    }

    // Extract year
    const yearMatch = transcript.match(patterns.year);
    if (yearMatch) {
      query.year = parseInt(yearMatch[1]);
    }

    // Extract price
    const priceMatch = transcript.match(patterns.price);
    if (priceMatch) {
      query.maxPrice = parseInt(priceMatch[1]);
    }

    // Extract fuel type
    Object.entries(patterns.fuelType).forEach(([type, pattern]) => {
      if (pattern.test(transcript)) {
        query.fuelType = type;
      }
    });

    // Extract transmission
    Object.entries(patterns.transmission).forEach(([type, pattern]) => {
      if (pattern.test(transcript)) {
        query.transmission = type;
      }
    });

    // Extract city
    const cityMatch = transcript.match(patterns.locationData?.cityName);
    if (cityMatch) {
      query.locationData?.cityName = cityMatch[1];
    }

    // Store full transcript as keywords
    query.keywords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    logger.info('Parsed voice query', { transcript, query });
    return query;
  }

  /**
   * Search cars using voice input
   */
  async search(transcript: string, userId?: string): Promise<VoiceSearchResult> {
    try {
      logger.info('Voice search initiated', { transcript, userId });

      // Parse transcript
      const parsedQuery = this.parseTranscript(transcript);

      // Build search query for smart search
      const searchQuery = this.buildSearchQuery(parsedQuery);

      // Execute search using smart search service
      const result = await smartSearchService.search(searchQuery, userId, 1, 50);

      return {
        transcript,
        confidence: 1, // We assume high confidence if search completes
        parsedQuery,
        cars: result.cars
      };

    } catch (error) {
      logger.error('Voice search failed', error as Error, { transcript });
      throw error;
    }
  }

  /**
   * Build search query string from parsed voice input
   */
  private buildSearchQuery(parsed: VoiceSearchResult['parsedQuery']): string {
    const parts: string[] = [];

    if (parsed.make) parts.push(parsed.make);
    if (parsed.model) parts.push(parsed.model);
    if (parsed.year) parts.push(parsed.year.toString());
    if (parsed.fuelType) parts.push(parsed.fuelType);
    if (parsed.transmission) parts.push(parsed.transmission);
    if (parsed.locationData?.cityName) parts.push(parsed.locationData?.cityName);
    if (parsed.maxPrice) parts.push(`under ${parsed.maxPrice}`);

    return parts.join(' ');
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{ code: VoiceSearchConfig['language']; name: string; nativeName: string }> {
    return [
      { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български' },
      { code: 'en-US', name: 'English', nativeName: 'English' },
      { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' }
    ];
  }

  /**
   * Check if voice search is supported
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    return !!SpeechRecognition;
  }

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop all tracks (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      return true;

    } catch (error) {
      logger.error('Microphone permission denied', error as Error);
      return false;
    }
  }
}

export const voiceSearchService = VoiceSearchService.getInstance();

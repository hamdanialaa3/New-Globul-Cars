// Voice Search Service
// خدمة البحث الصوتي - دعم 3 لغات (البلغارية، الإنجليزية، العربية)
// Uses: Web Speech API (free, built-in browser)

import { logger } from './logger-service';
import { smartSearchService } from './search/smart-search.service';

/**
 * اللغات المدعومة
 */
export type SupportedLanguage = 'bg-BG' | 'en-US' | 'ar-SA';

/**
 * نتيجة التعرف الصوتي
 */
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  language: SupportedLanguage;
  parsedQuery?: any;
}

/**
 * إعدادات التعرف الصوتي
 */
export interface VoiceSearchConfig {
  language: SupportedLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

class VoiceSearchService {
  private static instance: VoiceSearchService;
  private recognition: any; // SpeechRecognition
  private isListening: boolean = false;
  private config: VoiceSearchConfig;

  private constructor() {
    this.config = {
      language: 'bg-BG',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1
    };

    this.initRecognition();
  }

  static getInstance(): VoiceSearchService {
    if (!VoiceSearchService.instance) {
      VoiceSearchService.instance = new VoiceSearchService();
    }
    return VoiceSearchService.instance;
  }

  /**
   * تهيئة Web Speech API
   */
  private initRecognition(): void {
    // التحقق من دعم المتصفح
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      logger.warn('⚠️ Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    logger.info('✅ Voice Search initialized', { language: this.config.language });
  }

  /**
   * التحقق من دعم المتصفح
   */
  isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * بدء الاستماع
   */
  async startListening(
    language?: SupportedLanguage,
    onResult?: (result: VoiceRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.isSupported()) {
      const errorMsg = 'المتصفح لا يدعم البحث الصوتي';
      logger.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (this.isListening) {
      logger.warn('⚠️ Already listening');
      return;
    }

    // تغيير اللغة إذا طُلب ذلك
    if (language) {
      this.setLanguage(language);
    }

    this.isListening = true;
    logger.info('🎤 Start listening', { language: this.config.language });

    // معالج النتائج
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence;

      logger.info('🗣️ Voice recognized', { transcript, confidence });

      const voiceResult: VoiceRecognitionResult = {
        transcript,
        confidence,
        language: this.config.language,
        parsedQuery: this.parseVoiceQuery(transcript)
      };

      onResult?.(voiceResult);
    };

    // معالج الأخطاء
    this.recognition.onerror = (event: any) => {
      logger.error('❌ Voice recognition error', new Error(event.error));
      this.isListening = false;

      const errorMessage = this.getErrorMessage(event.error);
      onError?.(errorMessage);
    };

    // معالج الانتهاء
    this.recognition.onend = () => {
      logger.info('🎤 Voice recognition ended');
      this.isListening = false;
    };

    // بدء التعرف
    try {
      this.recognition.start();
    } catch (error) {
      logger.error('Error starting voice recognition', error as Error);
      this.isListening = false;
      onError?.('فشل بدء التعرف الصوتي');
    }
  }

  /**
   * إيقاف الاستماع
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    logger.info('🛑 Stop listening');
    this.recognition.stop();
    this.isListening = false;
  }

  /**
   * تغيير اللغة
   */
  setLanguage(language: SupportedLanguage): void {
    if (this.config.language === language) {
      return;
    }

    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }

    logger.info('🌐 Language changed', { language });
  }

  /**
   * تحليل الأمر الصوتي
   */
  private parseVoiceQuery(transcript: string): any {
    const lang = this.config.language;

    logger.info('📝 Parsing voice query', { transcript, lang });

    // تنظيف النص
    const cleanText = transcript.toLowerCase().trim();

    // تحليل حسب اللغة
    if (lang === 'bg-BG') {
      return this.parseBulgarian(cleanText);
    } else if (lang === 'en-US') {
      return this.parseEnglish(cleanText);
    } else if (lang === 'ar-SA') {
      return this.parseArabic(cleanText);
    }

    return { query: cleanText };
  }

  /**
   * تحليل اللغة البلغارية
   */
  private parseBulgarian(text: string): any {
    const query: any = { rawQuery: text };

    // استخراج الماركة
    const brands = ['bmw', 'mercedes', 'audi', 'toyota', 'ford', 'vw', 'volkswagen', 'opel', 'peugeot', 'renault'];
    for (const brand of brands) {
      if (text.includes(brand)) {
        query.make = brand.toUpperCase();
        break;
      }
    }

    // استخراج السنة
    const yearMatch = text.match(/(\d{4})/);
    if (yearMatch) {
      query.year = parseInt(yearMatch[1]);
    }

    // نوع الوقود
    if (text.includes('дизел') || text.includes('дизелов')) {
      query.fuelType = 'diesel';
    } else if (text.includes('бензин')) {
      query.fuelType = 'petrol';
    } else if (text.includes('електрически')) {
      query.fuelType = 'electric';
    } else if (text.includes('хибрид')) {
      query.fuelType = 'hybrid';
    }

    // ناقل الحركة
    if (text.includes('автоматик') || text.includes('автоматична')) {
      query.transmission = 'automatic';
    } else if (text.includes('ръчна')) {
      query.transmission = 'manual';
    }

    // المدينة
    const cities = ['софия', 'пловдив', 'варна', 'бургас', 'русе', 'стара загора'];
    for (const city of cities) {
      if (text.includes(city)) {
        query.city = city;
        break;
      }
    }

    // السعر
    const priceMatch = text.match(/под (\d+)/);
    if (priceMatch) {
      query.priceTo = parseInt(priceMatch[1]);
    }

    const priceMatch2 = text.match(/до (\d+)/);
    if (priceMatch2) {
      query.priceTo = parseInt(priceMatch2[1]);
    }

    const priceMatch3 = text.match(/над (\d+)/);
    if (priceMatch3) {
      query.priceFrom = parseInt(priceMatch3[1]);
    }

    // نوع السيارة
    if (text.includes('джип') || text.includes('suv')) {
      query.vehicleType = 'suv';
    } else if (text.includes('седан')) {
      query.vehicleType = 'sedan';
    } else if (text.includes('комби')) {
      query.vehicleType = 'wagon';
    }

    return query;
  }

  /**
   * تحليل اللغة الإنجليزية
   */
  private parseEnglish(text: string): any {
    const query: any = { rawQuery: text };

    // استخراج الماركة
    const brands = ['bmw', 'mercedes', 'audi', 'toyota', 'ford', 'volkswagen', 'opel', 'peugeot', 'renault'];
    for (const brand of brands) {
      if (text.includes(brand)) {
        query.make = brand.toUpperCase();
        break;
      }
    }

    // استخراج السنة
    const yearMatch = text.match(/(\d{4})/);
    if (yearMatch) {
      query.year = parseInt(yearMatch[1]);
    }

    // نوع الوقود
    if (text.includes('diesel')) {
      query.fuelType = 'diesel';
    } else if (text.includes('petrol') || text.includes('gasoline')) {
      query.fuelType = 'petrol';
    } else if (text.includes('electric') || text.includes('ev')) {
      query.fuelType = 'electric';
    } else if (text.includes('hybrid')) {
      query.fuelType = 'hybrid';
    }

    // ناقل الحركة
    if (text.includes('automatic')) {
      query.transmission = 'automatic';
    } else if (text.includes('manual')) {
      query.transmission = 'manual';
    }

    // المدينة
    const cities = ['sofia', 'plovdiv', 'varna', 'burgas', 'ruse'];
    for (const city of cities) {
      if (text.includes(city)) {
        query.city = city;
        break;
      }
    }

    // السعر
    const priceMatch = text.match(/under (\d+)/i);
    if (priceMatch) {
      query.priceTo = parseInt(priceMatch[1]);
    }

    const priceMatch2 = text.match(/below (\d+)/i);
    if (priceMatch2) {
      query.priceTo = parseInt(priceMatch2[1]);
    }

    const priceMatch3 = text.match(/above (\d+)/i);
    if (priceMatch3) {
      query.priceFrom = parseInt(priceMatch3[1]);
    }

    const priceMatch4 = text.match(/between (\d+) and (\d+)/i);
    if (priceMatch4) {
      query.priceFrom = parseInt(priceMatch4[1]);
      query.priceTo = parseInt(priceMatch4[2]);
    }

    // نوع السيارة
    if (text.includes('suv')) {
      query.vehicleType = 'suv';
    } else if (text.includes('sedan')) {
      query.vehicleType = 'sedan';
    } else if (text.includes('wagon')) {
      query.vehicleType = 'wagon';
    } else if (text.includes('hatchback')) {
      query.vehicleType = 'hatchback';
    }

    return query;
  }

  /**
   * تحليل اللغة العربية
   */
  private parseArabic(text: string): any {
    const query: any = { rawQuery: text };

    // استخراج الماركة
    const brands = {
      'بي ام دبليو': 'BMW',
      'بي ام': 'BMW',
      'مرسيدس': 'Mercedes',
      'اودي': 'Audi',
      'تويوتا': 'Toyota',
      'فورد': 'Ford',
      'فولكس': 'Volkswagen',
      'اوبل': 'Opel',
      'بيجو': 'Peugeot',
      'رينو': 'Renault'
    };

    for (const [arabic, english] of Object.entries(brands)) {
      if (text.includes(arabic)) {
        query.make = english;
        break;
      }
    }

    // استخراج السنة (بالأرقام العربية والإنجليزية)
    const yearMatch = text.match(/(\d{4}|[٠-٩]{4})/);
    if (yearMatch) {
      const year = yearMatch[1].replace(/[٠-٩]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      query.year = parseInt(year);
    }

    // موديل
    const modelMatch = text.match(/موديل (\d{4}|[٠-٩]{4})/);
    if (modelMatch) {
      const year = modelMatch[1].replace(/[٠-٩]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      query.year = parseInt(year);
    }

    // نوع الوقود
    if (text.includes('ديزل')) {
      query.fuelType = 'diesel';
    } else if (text.includes('بنزين')) {
      query.fuelType = 'petrol';
    } else if (text.includes('كهربا')) {
      query.fuelType = 'electric';
    } else if (text.includes('هايبرد') || text.includes('هجين')) {
      query.fuelType = 'hybrid';
    }

    // ناقل الحركة
    if (text.includes('اوتوماتيك') || text.includes('اتوماتيك')) {
      query.transmission = 'automatic';
    } else if (text.includes('عادي') || text.includes('مانيوال')) {
      query.transmission = 'manual';
    }

    // المدينة
    const cities = {
      'صوفيا': 'sofia',
      'بلوفديف': 'plovdiv',
      'فارنا': 'varna',
      'بورجاس': 'burgas'
    };

    for (const [arabic, english] of Object.entries(cities)) {
      if (text.includes(arabic)) {
        query.city = english;
        break;
      }
    }

    // السعر
    const priceMatch = text.match(/تحت (\d+)/);
    if (priceMatch) {
      query.priceTo = parseInt(priceMatch[1]);
    }

    const priceMatch2 = text.match(/اقل من (\d+)/);
    if (priceMatch2) {
      query.priceTo = parseInt(priceMatch2[1]);
    }

    const priceMatch3 = text.match(/فوق (\d+)/);
    if (priceMatch3) {
      query.priceFrom = parseInt(priceMatch3[1]);
    }

    const priceMatch4 = text.match(/اكثر من (\d+)/);
    if (priceMatch4) {
      query.priceFrom = parseInt(priceMatch4[1]);
    }

    // نوع السيارة
    if (text.includes('دفع رباعي') || text.includes('جيب')) {
      query.vehicleType = 'suv';
    } else if (text.includes('سيدان')) {
      query.vehicleType = 'sedan';
    } else if (text.includes('فان')) {
      query.vehicleType = 'van';
    }

    return query;
  }

  /**
   * تحويل الخطأ إلى رسالة مفهومة
   */
  private getErrorMessage(errorCode: string): string {
    const messages: { [key: string]: { [key in SupportedLanguage]: string } } = {
      'no-speech': {
        'bg-BG': 'Не беше разпознат глас',
        'en-US': 'No speech detected',
        'ar-SA': 'لم يتم التعرف على صوت'
      },
      'audio-capture': {
        'bg-BG': 'Микрофонът не е достъпен',
        'en-US': 'Microphone not accessible',
        'ar-SA': 'الميكروفون غير متاح'
      },
      'not-allowed': {
        'bg-BG': 'Разрешението за микрофон е отказано',
        'en-US': 'Microphone permission denied',
        'ar-SA': 'تم رفض إذن الميكروفون'
      },
      'network': {
        'bg-BG': 'Грешка в мрежата',
        'en-US': 'Network error',
        'ar-SA': 'خطأ في الشبكة'
      }
    };

    return messages[errorCode]?.[this.config.language] || errorCode;
  }

  /**
   * البحث باستخدام الصوت
   */
  async searchByVoice(
    language?: SupportedLanguage,
    onProgress?: (transcript: string) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.startListening(
        language,
        async (result) => {
          onProgress?.(result.transcript);

          // البحث باستخدام Smart Search Service
          try {
            const searchResults = await smartSearchService.search(
              result.transcript,
              undefined, // userId
              1,
              20
            );

            resolve({
              voiceResult: result,
              searchResults
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(error));
        }
      );
    });
  }

  /**
   * اكتشاف اللغة تلقائياً من النص
   */
  detectLanguage(text: string): SupportedLanguage {
    // كلمات بلغارية شائعة
    const bulgarianWords = ['искам', 'от', 'до', 'в', 'под', 'над', 'лева', 'дизел', 'бензин'];
    // كلمات عربية شائعة
    const arabicWords = ['عايز', 'اريد', 'من', 'الى', 'في', 'تحت', 'فوق'];

    const lowerText = text.toLowerCase();

    // تحقق من البلغارية
    if (bulgarianWords.some(word => lowerText.includes(word))) {
      return 'bg-BG';
    }

    // تحقق من العربية
    if (arabicWords.some(word => lowerText.includes(word)) || /[\u0600-\u06FF]/.test(text)) {
      return 'ar-SA';
    }

    // افتراضي: إنجليزية
    return 'en-US';
  }

  /**
   * التحقق من حالة الاستماع
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceSearchService = VoiceSearchService.getInstance();
export default voiceSearchService;

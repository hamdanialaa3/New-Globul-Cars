/**
 * Voice AI Service using OpenAI Whisper
 * خدمة الذكاء الاصطناعي الصوتي
 * 
 * SECURITY: Client-side Whisper/OpenAI SDK disabled to avoid exposing API keys in browser bundles.
 * TODO: Route voice AI through Cloud Functions/server-side proxy.
 */

import { logger } from '@/services/logger-service';

interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  confidence: number;
  words: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}

interface VoiceCommandResult {
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  interpretation: string;
}

class WhisperVoiceService {
  private static instance: WhisperVoiceService;
  private model = 'whisper-1';
  private isConfigured: boolean = false;

  private constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      logger.warn('VITE_OPENAI_API_KEY is set but client-side Whisper is disabled. Use Cloud Functions proxy.');
    } else {
      logger.warn('Whisper client disabled - voice AI requires server-side proxy.');
    }
    this.isConfigured = false;
  }

  static getInstance(): WhisperVoiceService {
    if (!this.instance) {
      this.instance = new WhisperVoiceService();
    }
    return this.instance;
  }

  /**
   * Transcribe audio file to text
   */
  async transcribeAudio(audioBlob: Blob, language?: string): Promise<TranscriptionResult> {
    logger.warn('transcribeAudio requested from client while Whisper is disabled', {
      size: audioBlob.size,
      language: language || 'auto',
      model: this.model
    });
    throw new Error('Whisper client is disabled. Route this call through Cloud Functions.');
  }

  /**
   * Transcribe audio with timestamps
   */
  async transcribeWithTimestamps(audioBlob: Blob): Promise<TranscriptionResult> {
    logger.warn('transcribeWithTimestamps requested from client while Whisper is disabled', {
      size: audioBlob.size
    });
    throw new Error('Whisper client is disabled. Route this call through Cloud Functions.');
  }

  /**
   * Convert text to speech (using TTS)
   */
  async textToSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'): Promise<Blob> {
    logger.warn('textToSpeech requested from client while Whisper is disabled', {
      textLength: text.length,
      voice
    });
    throw new Error('Whisper client is disabled. Route this call through Cloud Functions.');
  }

  /**
   * Process voice command for car search
   */
  async processCarSearchCommand(audioBlob: Blob): Promise<VoiceCommandResult> {
    try {
      const transcription = await this.transcribeAudio(audioBlob);

      // Parse voice command
      const text = transcription.text.toLowerCase();
      
      let action = 'search';
      const parameters: Record<string, any> = {};
      let confidence = 85;

      // Simple command parsing
      if (text.includes('tesla')) parameters.make = 'Tesla';
      if (text.includes('bmw')) parameters.make = 'BMW';
      if (text.includes('mercedes')) parameters.make = 'Mercedes-Benz';
      if (text.includes('audi')) parameters.make = 'Audi';
      if (text.includes('vw') || text.includes('volkswagen')) parameters.make = 'Volkswagen';

      // Price parsing
      const priceMatch = text.match(/under (\d+)/i);
      if (priceMatch) {
        parameters.maxPrice = parseInt(priceMatch[1]) * 1000; // Convert to cents
      }

      // Year parsing
      const yearMatch = text.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year > 1980 && year <= new Date().getFullYear() + 1) {
          parameters.minYear = year;
        }
      }

      // Mileage
      if (text.includes('low mileage') || text.includes('few miles')) {
        parameters.maxMileage = 100000;
      }

      if (text.includes('high mileage')) {
        parameters.minMileage = 200000;
      }

      return {
        action,
        parameters,
        confidence,
        interpretation: `Searching for ${parameters.make || 'cars'} ${
          parameters.maxPrice ? `under €${parameters.maxPrice / 1000}` : ''
        }`.trim()
      };
    } catch (error) {
      logger.error('Voice command processing failed', error as Error);
      throw error;
    }
  }

  /**
   * Record and transcribe user message
   */
  async recordAndTranscribe(): Promise<TranscriptionResult> {
    try {
      logger.info('Starting voice recording');

      // Check browser support
      const mediaRecorder = await this.startRecording();
      
      // This would be called after recording is done
      return {
        text: '',
        language: 'auto',
        duration: 0,
        confidence: 0,
        words: []
      };
    } catch (error) {
      logger.error('Recording failed', error as Error);
      throw error;
    }
  }

  /**
   * Start audio recording
   */
  private async startRecording(): Promise<MediaRecorder> {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });

    return mediaRecorder;
  }

  /**
   * Analyze voice emotion
   */
  async analyzeVoiceEmotion(audioBlob: Blob): Promise<{
    emotion: string;
    confidence: number;
    analysis: string;
  }> {
    try {
      const transcription = await this.transcribeAudio(audioBlob);

      // For emotion analysis, we'd use sentiment analysis on the transcribed text
      // This is a placeholder - real implementation would use audio features
      
      const hasPositiveWords = /happy|good|great|excellent|love|amazing/i.test(transcription.text);
      const hasNegativeWords = /bad|terrible|hate|disappointed|angry|frustrated/i.test(transcription.text);

      let emotion = 'neutral';
      let confidence = 60;

      if (hasPositiveWords) {
        emotion = 'positive';
        confidence = 75;
      } else if (hasNegativeWords) {
        emotion = 'negative';
        confidence = 75;
      }

      return {
        emotion,
        confidence,
        analysis: `Voice sentiment: ${emotion}. Text: "${transcription.text.substring(0, 100)}..."`
      };
    } catch (error) {
      logger.error('Voice emotion analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Detect language from audio
   */
  async detectLanguage(audioBlob: Blob): Promise<{
    language: string;
    languageCode: string;
    confidence: number;
  }> {
    try {
      // First transcribe with language detection
      const transcription = await this.transcribeAudio(audioBlob);

      const languageMap: { [key: string]: string } = {
        'bg': 'Bulgarian',
        'en': 'English',
        'ar': 'Arabic',
        'ru': 'Russian',
        'tr': 'Turkish'
      };

      return {
        language: languageMap[transcription.language] || transcription.language,
        languageCode: transcription.language,
        confidence: 90
      };
    } catch (error) {
      logger.error('Language detection failed', error as Error);
      throw error;
    }
  }

  /**
   * Create audio summary of listing
   */
  async createListingAudioSummary(carData: any): Promise<Blob> {
    try {
      logger.info('Creating audio summary', { make: carData.make });

      const summary = `
        Now showing: ${carData.make} ${carData.model} from ${carData.year}.
        Mileage: ${carData.mileage} kilometers.
        Price: ${carData.price} euros.
        Condition: ${carData.condition}.
        Location: ${carData.location}.
        ${carData.equipment?.length ? `Includes: ${carData.equipment.join(', ')}` : ''}
      `;

      return await this.textToSpeech(summary);
    } catch (error) {
      logger.error('Audio summary creation failed', error as Error);
      throw error;
    }
  }

  /**
   * Support multiple voice profiles
   */
  getAvailableVoices(): Array<{ id: string; name: string; language: string }> {
    return [
      { id: 'alloy', name: 'Alloy', language: 'en' },
      { id: 'echo', name: 'Echo', language: 'en' },
      { id: 'fable', name: 'Fable', language: 'en' },
      { id: 'onyx', name: 'Onyx', language: 'en' },
      { id: 'nova', name: 'Nova', language: 'en' },
      { id: 'shimmer', name: 'Shimmer', language: 'en' }
    ];
  }
}

export const whisperService = WhisperVoiceService.getInstance();

/**
 * Voice AI Service using OpenAI Whisper
 * خدمة الذكاء الاصطناعي الصوتي
 */

import OpenAI from 'openai';
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
  private openai: OpenAI;
  private model = 'whisper-1';

  private constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn('OpenAI API Key not configured for Whisper');
    }
    this.openai = new OpenAI({ apiKey });
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
    try {
      logger.info('Transcribing audio', {
        size: audioBlob.size,
        language: language || 'auto'
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', this.model);
      if (language) {
        formData.append('language', language);
      }

      const response = await this.openai.audio.transcriptions.create({
        file: audioBlob,
        model: this.model,
        language: language,
        response_format: 'json'
      } as any);

      logger.info('Audio transcribed successfully', {
        textLength: response.text?.length || 0,
        language
      });

      return {
        text: response.text || '',
        language: language || 'detected',
        duration: 0, // Would need to calculate from audio
        confidence: 95, // Whisper doesn't provide confidence, assume high
        words: [] // Parse text into words
      };
    } catch (error) {
      logger.error('Audio transcription failed', error as Error);
      throw error;
    }
  }

  /**
   * Transcribe audio with timestamps
   */
  async transcribeWithTimestamps(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      logger.info('Transcribing with timestamps', { size: audioBlob.size });

      const response = await this.openai.audio.transcriptions.create({
        file: audioBlob,
        model: this.model,
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      } as any);

      return {
        text: response.text || '',
        language: 'auto',
        duration: response.duration || 0,
        confidence: 95,
        words: response.words || []
      };
    } catch (error) {
      logger.error('Timestamped transcription failed', error as Error);
      throw error;
    }
  }

  /**
   * Convert text to speech (using TTS)
   */
  async textToSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'): Promise<Blob> {
    try {
      logger.info('Converting text to speech', { textLength: text.length });

      const response = await this.openai.audio.speech.create({
        input: text,
        model: 'tts-1',
        voice: voice,
        response_format: 'opus'
      });

      // Convert to blob
      const arrayBuffer = await response.arrayBuffer();
      return new Blob([arrayBuffer], { type: 'audio/opus' });
    } catch (error) {
      logger.error('Text to speech failed', error as Error);
      throw error;
    }
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

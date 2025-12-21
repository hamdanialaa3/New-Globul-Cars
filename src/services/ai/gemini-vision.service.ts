// Gemini Vision Service - FREE + PAID Image Analysis
// مجاني + مدفوع مع نظام الحصص

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CarAnalysisResult, ImageQualityAnalysis } from '../../types/ai.types';
import { logger } from '../logger-service';
import { aiQuotaService } from './ai-quota.service';

class GeminiVisionService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isInitialized = false;

  constructor() {
    const apiKey = process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY || process.env.REACT_APP_GEMINI_KEY;
    if (!apiKey) {
      logger.warn('Google Generative AI key not found. AI features will be disabled.');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    this.isInitialized = true;
  }

  async analyzeCarImage(imageFile: File, userId?: string): Promise<CarAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized. Check API key.');
    }

    // Check quota if userId provided
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'image_analysis');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Quota exceeded');
      }
    }

    try {
      logger.debug('Analyzing car image with Gemini Vision', { userId });
      
      const base64 = await this.fileToBase64(imageFile);
      
      const prompt = `
        Analyze this car image for the Bulgarian car marketplace.
        
        Provide accurate information in JSON format:
        {
          "make": "car brand (BMW, Mercedes, Toyota, etc.)",
          "model": "car model (320i, C-Class, Corolla, etc.)",
          "year": "approximate year or range (2018-2020)",
          "color": "primary color in English",
          "condition": "excellent/good/fair/poor",
          "confidence": 85,
          "suggestions": ["list of suggestions"]
        }
        
        Be specific and accurate. If unsure, indicate lower confidence.
      `;
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64.split(',')[1],
            mimeType: imageFile.type
          }
        }
      ]);
      
      const text = result.response.text();
      const parsed = this.extractJSON(text);
      
      if (!parsed) {
        throw new Error('Failed to parse AI response');
      }
      
      logger.info('Car image analyzed successfully', { 
        make: parsed.make, 
        confidence: parsed.confidence 
      });
      
      // Track usage
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'image_analysis', true, {
          make: parsed.make,
          confidence: parsed.confidence
        });
      }
      
      return parsed;
      
    } catch (error) {
      logger.error('Gemini Vision error', error as Error);
      
      // Track failed usage
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'image_analysis', false);
      }
      
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  async analyzeImageQuality(imageFile: File, userId?: string): Promise<ImageQualityAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    // Check quota
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'image_analysis');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Quota exceeded');
      }
    }

    try {
      const base64 = await this.fileToBase64(imageFile);
      
      const prompt = `
        Analyze the quality of this car photo.
        
        Rate each aspect from 0-100 and provide JSON:
        {
          "clarity": 85,
          "lighting": 90,
          "angle": 75,
          "overallScore": 83,
          "suggestions": ["specific improvements"]
        }
      `;
      
      const result = await this.model.generateContent([
        prompt,
        { inlineData: { data: base64.split(',')[1], mimeType: imageFile.type } }
      ]);
      
      const text = result.response.text();
      return this.extractJSON(text);
      
    } catch (error) {
      logger.error('Image quality analysis error', error as Error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      
      throw new Error('No valid JSON found in response');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const geminiVisionService = new GeminiVisionService();
export default geminiVisionService;

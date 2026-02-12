/**
 * Advanced Computer Vision Service
 * خدمة الرؤية الآلية المتقدمة
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from '@/services/logger-service';

interface ObjectDetectionResult {
  objects: Array<{
    name: string;
    confidence: number;
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    description: string;
  }>;
  carParts: {
    detected: string[];
    missing: string[];
  };
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CarDamageAssessment {
  damageFound: boolean;
  damages: Array<{
    type: 'dent' | 'scratch' | 'rust' | 'glass' | 'bodywork' | 'interior';
    severity: 'minor' | 'moderate' | 'severe';
    location: string;
    estimatedRepairCost: number;
    description: string;
  }>;
  totalRepairCost: number;
  recommendations: string[];
}

interface PlateNumberDetection {
  plateDetected: boolean;
  plateNumber: string | null;
  confidence: number;
  plateType: string;
  countryCode: string;
}

interface CarModelDetection {
  make: string;
  model: string;
  year: string;
  confidence: number;
  bodyType: string;
  color: string;
}

interface ImageQualityAssessment {
  overallQuality: number; // 0-100
  brightness: number;
  clarity: number;
  composition: number;
  angle: string; // front, side, rear, interior
  suggestions: string[];
}

class AdvancedComputerVisionService {
  private static instance: AdvancedComputerVisionService;
  private genAI: GoogleGenerativeAI;
  private visionModel: any;

  private constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY;
    if (!apiKey) {
      logger.warn('Google Generative AI Key not configured for vision');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  }

  static getInstance(): AdvancedComputerVisionService {
    if (!this.instance) {
      this.instance = new AdvancedComputerVisionService();
    }
    return this.instance;
  }

  /**
   * Detect objects in car image
   */
  async detectObjects(imageUrl: string): Promise<ObjectDetectionResult> {
    try {
      logger.info('Detecting objects in image', { imageUrl });

      const prompt = `
        Analyze this car image and detect all visible objects and car parts.
        
        Return JSON with:
        {
          "objects": [
            {
              "name": "object name",
              "confidence": 0-100,
              "location": {"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
              "description": "details"
            }
          ],
          "carParts": {
            "detected": ["list of visible car parts"],
            "missing": ["car parts not visible in image"]
          },
          "overallQuality": "excellent|good|fair|poor"
        }
      `;

      const result = await this.visionModel.generateContent([
        {
          inlineData: {
            data: await this.fetchImageAsBase64(imageUrl),
            mimeType: 'image/jpeg'
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return this.getDefaultObjectDetection();
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Object detection failed', error as Error);
      return this.getDefaultObjectDetection();
    }
  }

  /**
   * Assess car damage from image
   */
  async assessCarDamage(imageUrl: string): Promise<CarDamageAssessment> {
    try {
      logger.info('Assessing car damage', { imageUrl });

      const prompt = `
        Carefully examine this car image for any damage, dents, scratches, rust, or other issues.
        
        Return JSON with:
        {
          "damageFound": boolean,
          "damages": [
            {
              "type": "dent|scratch|rust|glass|bodywork|interior",
              "severity": "minor|moderate|severe",
              "location": "specific location on car",
              "estimatedRepairCost": cost in EUR,
              "description": "details about the damage"
            }
          ],
          "totalRepairCost": total in EUR,
          "recommendations": ["repair recommendations"]
        }
      `;

      const result = await this.visionModel.generateContent([
        {
          inlineData: {
            data: await this.fetchImageAsBase64(imageUrl),
            mimeType: 'image/jpeg'
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          damageFound: false,
          damages: [],
          totalRepairCost: 0,
          recommendations: []
        };
      }

      const assessment = JSON.parse(jsonMatch[0]);
      
      // Calculate total repair cost if not provided
      if (!assessment.totalRepairCost && assessment.damages?.length > 0) {
        assessment.totalRepairCost = assessment.damages.reduce(
          (sum: number, d: any) => sum + (d.estimatedRepairCost || 0),
          0
        );
      }

      return assessment;
    } catch (error) {
      logger.error('Damage assessment failed', error as Error);
      return {
        damageFound: false,
        damages: [],
        totalRepairCost: 0,
        recommendations: []
      };
    }
  }

  /**
   * Detect license plate number
   */
  async detectPlateNumber(imageUrl: string): Promise<PlateNumberDetection> {
    try {
      logger.info('Detecting license plate', { imageUrl });

      const prompt = `
        Detect the license plate number in this car image.
        
        Return JSON with:
        {
          "plateDetected": boolean,
          "plateNumber": "detected number or null",
          "confidence": 0-100,
          "plateType": "EU|Bulgaria|other",
          "countryCode": "BG|etc"
        }
        
        Note: For privacy, you may generalize the plate if it contains personal data.
      `;

      const result = await this.visionModel.generateContent([
        {
          inlineData: {
            data: await this.fetchImageAsBase64(imageUrl),
            mimeType: 'image/jpeg'
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          plateDetected: false,
          plateNumber: null,
          confidence: 0,
          plateType: 'unknown',
          countryCode: 'unknown'
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Plate detection failed', error as Error);
      return {
        plateDetected: false,
        plateNumber: null,
        confidence: 0,
        plateType: 'unknown',
        countryCode: 'unknown'
      };
    }
  }

  /**
   * Detect car make, model, year
   */
  async detectCarModel(imageUrl: string): Promise<CarModelDetection> {
    try {
      logger.info('Detecting car model', { imageUrl });

      const prompt = `
        Identify the car in this image.
        
        Return JSON with:
        {
          "make": "car manufacturer",
          "model": "car model",
          "year": "estimated year or range",
          "confidence": 0-100,
          "bodyType": "sedan|suv|truck|van|coupe|hatchback|convertible",
          "color": "car color"
        }
      `;

      const result = await this.visionModel.generateContent([
        {
          inlineData: {
            data: await this.fetchImageAsBase64(imageUrl),
            mimeType: 'image/jpeg'
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          make: 'Unknown',
          model: 'Unknown',
          year: 'Unknown',
          confidence: 0,
          bodyType: 'unknown',
          color: 'unknown'
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Car model detection failed', error as Error);
      return {
        make: 'Unknown',
        model: 'Unknown',
        year: 'Unknown',
        confidence: 0,
        bodyType: 'unknown',
        color: 'unknown'
      };
    }
  }

  /**
   * Assess image quality for listing
   */
  async assessImageQuality(imageUrl: string): Promise<ImageQualityAssessment> {
    try {
      logger.info('Assessing image quality', { imageUrl });

      const prompt = `
        Evaluate the quality of this car listing photo.
        
        Return JSON with:
        {
          "overallQuality": 0-100,
          "brightness": 0-100,
          "clarity": 0-100,
          "composition": 0-100,
          "angle": "front|side|rear|interior|other",
          "suggestions": ["improvement suggestions"]
        }
      `;

      const result = await this.visionModel.generateContent([
        {
          inlineData: {
            data: await this.fetchImageAsBase64(imageUrl),
            mimeType: 'image/jpeg'
          }
        },
        prompt
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          overallQuality: 50,
          brightness: 50,
          clarity: 50,
          composition: 50,
          angle: 'unknown',
          suggestions: []
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Image quality assessment failed', error as Error);
      return {
        overallQuality: 0,
        brightness: 0,
        clarity: 0,
        composition: 0,
        angle: 'unknown',
        suggestions: ['Unable to assess image quality']
      };
    }
  }

  /**
   * Comprehensive car image analysis
   */
  async analyzeCarImage(imageUrl: string): Promise<{
    model: CarModelDetection;
    quality: ImageQualityAssessment;
    damage: CarDamageAssessment;
    objects: ObjectDetectionResult;
    plate: PlateNumberDetection;
    overallAssessment: string;
  }> {
    try {
      logger.info('Starting comprehensive car image analysis', { imageUrl });

      // Run all analyses in parallel
      const [model, quality, damage, objects, plate] = await Promise.all([
        this.detectCarModel(imageUrl),
        this.assessImageQuality(imageUrl),
        this.assessCarDamage(imageUrl),
        this.detectObjects(imageUrl),
        this.detectPlateNumber(imageUrl)
      ]);

      const overallAssessment = this.generateOverallAssessment(
        model,
        quality,
        damage,
        objects
      );

      return {
        model,
        quality,
        damage,
        objects,
        plate,
        overallAssessment
      };
    } catch (error) {
      logger.error('Comprehensive analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Fetch image as base64
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      logger.error('Failed to fetch image as base64', error as Error);
      throw error;
    }
  }

  /**
   * Generate overall assessment
   */
  private generateOverallAssessment(
    model: CarModelDetection,
    quality: ImageQualityAssessment,
    damage: CarDamageAssessment,
    objects: ObjectDetectionResult
  ): string {
    let assessment = `Car identified as ${model.make} ${model.model} (${model.year}). `;

    assessment += `Image quality: ${quality.overallQuality}% - `;
    if (quality.overallQuality > 80) {
      assessment += 'Excellent for listing. ';
    } else if (quality.overallQuality > 60) {
      assessment += 'Good, but could be improved. ';
    } else {
      assessment += 'Poor, recommend retaking photos. ';
    }

    if (damage.damageFound) {
      assessment += `Damage detected: ${damage.damages.length} issue(s) found. `;
      assessment += `Estimated repair cost: €${damage.totalRepairCost}. `;
    } else {
      assessment += 'No significant damage detected. ';
    }

    assessment += `Overall car condition: ${objects.overallQuality}.`;

    return assessment;
  }

  /**
   * Get default object detection
   */
  private getDefaultObjectDetection(): ObjectDetectionResult {
    return {
      objects: [],
      carParts: {
        detected: ['wheels', 'windows', 'doors', 'trunk'],
        missing: []
      },
      overallQuality: 'good'
    };
  }
}

export const computerVisionService = AdvancedComputerVisionService.getInstance();

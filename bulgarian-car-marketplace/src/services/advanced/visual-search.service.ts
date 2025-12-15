// Visual Search Service - خدمة البحث المرئي
// البحث عن سيارات مشابهة باستخدام الصور

import { logger } from '../logger-service';
import { CarListing } from '../../types/CarListing';
import { queryAllCollections } from '../multi-collection-helper';
import { where } from 'firebase/firestore';

export interface VisualSearchResult {
  detectedFeatures: {
    make?: string;
    model?: string;
    bodyType?: string;
    color?: string;
    year?: number;
    confidence: number;
  };
  similarCars: Array<{
    car: CarListing;
    similarityScore: number;
    matchedFeatures: string[];
  }>;
  processingTime: number;
}

export interface ImageAnalysisResult {
  labels: Array<{ description: string; score: number }>;
  objects: Array<{ name: string; score: number; boundingBox: { x: number; y: number; width: number; height: number } }>;
  colors: Array<{ color: string; score: number; pixelFraction: number }>;
  text?: string[];
}

class VisualSearchService {
  private static instance: VisualSearchService;
  private readonly GOOGLE_VISION_API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
  private readonly MAX_RESULTS = 20;

  // Car makes database for recognition
  private readonly CAR_MAKES = [
    'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 
    'Nissan', 'Mazda', 'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Skoda',
    'Seat', 'Opel', 'Volvo', 'Porsche', 'Lexus', 'Infiniti', 'Acura'
  ];

  // Body types
  private readonly BODY_TYPES = [
    'sedan', 'hatchback', 'suv', 'wagon', 'coupe', 'convertible',
    'van', 'minivan', 'truck', 'pickup'
  ];

  // Colors
  private readonly COLORS = [
    'black', 'white', 'silver', 'gray', 'red', 'blue', 
    'green', 'yellow', 'orange', 'brown', 'beige'
  ];

  private constructor() {}

  static getInstance(): VisualSearchService {
    if (!VisualSearchService.instance) {
      VisualSearchService.instance = new VisualSearchService();
    }
    return VisualSearchService.instance;
  }

  /**
   * Analyze image using Google Cloud Vision API
   */
  async analyzeImage(imageFile: File | string): Promise<ImageAnalysisResult> {
    try {
      const startTime = performance.now();

      // Convert image to base64
      const base64Image = typeof imageFile === 'string' 
        ? await this.urlToBase64(imageFile)
        : await this.fileToBase64(imageFile);

      // Call Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Image },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'IMAGE_PROPERTIES' },
                { type: 'TEXT_DETECTION' }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Vision API request failed');
      }

      const data = await response.json();
      const annotations = data.responses[0];

      const result: ImageAnalysisResult = {
        labels: (annotations.labelAnnotations || []).map((label: { description?: string; score?: number }) => ({
          description: label.description || '',
          score: label.score || 0
        })),
        objects: (annotations.localizedObjectAnnotations || []).map((obj: { name?: string; score?: number; boundingPoly?: { normalizedVertices?: Array<{ x?: number; y?: number }> } }) => {
          const vertices = obj.boundingPoly?.normalizedVertices || [];
          const x = vertices[0]?.x || 0;
          const y = vertices[0]?.y || 0;
          const width = vertices[2]?.x ? (vertices[2].x - x) : 0;
          const height = vertices[2]?.y ? (vertices[2].y - y) : 0;
          
          return {
            name: obj.name || '',
            score: obj.score || 0,
            boundingBox: { x, y, width, height }
          };
        }),
        colors: this.extractDominantColors(annotations.imagePropertiesAnnotation),
        text: annotations.textAnnotations 
          ? [annotations.textAnnotations[0]?.description]
          : []
      };

      const processingTime = performance.now() - startTime;
      logger.info('Image analyzed', { processingTime, labelsCount: result.labels.length });

      return result;

    } catch (error) {
      logger.error('Image analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Search for similar cars using image
   */
  async searchByImage(imageFile: File | string): Promise<VisualSearchResult> {
    try {
      const startTime = performance.now();

      // Analyze image
      const analysis = await this.analyzeImage(imageFile);

      // Detect car features
      const detectedFeatures = this.detectCarFeatures(analysis);

      // Find similar cars
      const similarCars = await this.findSimilarCars(detectedFeatures, analysis);

      const processingTime = performance.now() - startTime;

      return {
        detectedFeatures,
        similarCars,
        processingTime
      };

    } catch (error) {
      logger.error('Visual search failed', error as Error);
      throw error;
    }
  }

  /**
   * Detect car features from image analysis
   */
  private detectCarFeatures(analysis: ImageAnalysisResult): VisualSearchResult['detectedFeatures'] {
    const features: VisualSearchResult['detectedFeatures'] = {
      confidence: 0
    };

    let confidenceSum = 0;
    let confidenceCount = 0;

    // Detect make from labels
    for (const label of analysis.labels) {
      const labelLower = label.description.toLowerCase();
      
      for (const make of this.CAR_MAKES) {
        if (labelLower.includes(make.toLowerCase())) {
          features.make = make;
          confidenceSum += label.score;
          confidenceCount++;
          break;
        }
      }
    }

    // Detect body type
    for (const label of analysis.labels) {
      const labelLower = label.description.toLowerCase();
      
      for (const bodyType of this.BODY_TYPES) {
        if (labelLower.includes(bodyType)) {
          features.bodyType = bodyType;
          confidenceSum += label.score;
          confidenceCount++;
          break;
        }
      }
    }

    // Detect color
    if (analysis.colors.length > 0) {
      const dominantColor = this.mapToColorName(analysis.colors[0].color);
      features.color = dominantColor;
      confidenceSum += analysis.colors[0].score;
      confidenceCount++;
    }

    // Try to detect year from text
    if (analysis.text && analysis.text.length > 0) {
      const yearMatch = analysis.text[0].match(/20\d{2}/);
      if (yearMatch) {
        features.year = parseInt(yearMatch[0]);
        confidenceSum += 0.8;
        confidenceCount++;
      }
    }

    // Calculate overall confidence
    features.confidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;

    logger.info('Detected car features', features);
    return features;
  }

  /**
   * Find similar cars based on detected features
   */
  private async findSimilarCars(
    features: VisualSearchResult['detectedFeatures'],
    analysis: ImageAnalysisResult
  ): Promise<VisualSearchResult['similarCars']> {
    try {
      // Build query constraints
      const constraints: unknown[] = [
        where('status', '==', 'active')
      ];

      if (features.make) {
        constraints.push(where('make', '==', features.make));
      }

      if (features.bodyType) {
        constraints.push(where('vehicleType', '==', features.bodyType));
      }

      // Query cars
      const cars = await queryAllCollections<CarListing>(...constraints);

      // Calculate similarity scores
      const carsWithScores = cars.map(car => {
        const { score, matchedFeatures } = this.calculateSimilarityScore(car, features, analysis);
        return {
          car,
          similarityScore: score,
          matchedFeatures
        };
      });

      // Sort by similarity (highest first)
      carsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      // Return top results
      return carsWithScores.slice(0, this.MAX_RESULTS);

    } catch (error) {
      logger.error('Failed to find similar cars', error as Error);
      return [];
    }
  }

  /**
   * Calculate similarity score between car and detected features
   */
  private calculateSimilarityScore(
    car: CarListing,
    features: VisualSearchResult['detectedFeatures'],
    analysis: ImageAnalysisResult
  ): { score: number; matchedFeatures: string[] } {
    let score = 0;
    const matchedFeatures: string[] = [];

    // Make match (40 points)
    if (features.make && car.make === features.make) {
      score += 40;
      matchedFeatures.push('make');
    }

    // Body type match (25 points)
    if (features.bodyType && car.vehicleType === features.bodyType) {
      score += 25;
      matchedFeatures.push('bodyType');
    }

    // Color match (20 points)
    if (features.color && car.color?.toLowerCase().includes(features.color)) {
      score += 20;
      matchedFeatures.push('color');
    }

    // Year match (15 points - exact year or ±2 years)
    if (features.year && car.year) {
      const yearDiff = Math.abs(car.year - features.year);
      if (yearDiff === 0) {
        score += 15;
        matchedFeatures.push('year');
      } else if (yearDiff <= 2) {
        score += 10;
        matchedFeatures.push('year-close');
      }
    }

    return { score, matchedFeatures };
  }

  /**
   * Extract dominant colors from Vision API response
   */
  private extractDominantColors(imageProperties: { dominantColors?: { colors?: Array<{ color?: { red?: number; green?: number; blue?: number }; score?: number; pixelFraction?: number }> } } }): ImageAnalysisResult['colors'] {
    if (!imageProperties || !imageProperties.dominantColors) {
      return [];
    }

    if (!imageProperties.dominantColors?.colors) return [];
    return imageProperties.dominantColors.colors.map((color: { color?: { red?: number; green?: number; blue?: number }; score?: number; pixelFraction?: number }) => {
      const red = color.color?.red || 0;
      const green = color.color?.green || 0;
      const blue = color.color?.blue || 0;
      
      return {
        color: this.rgbToHex(red, green, blue),
        score: color.score || 0,
        pixelFraction: color.pixelFraction || 0
      };
    });
  }

  /**
   * Convert RGB to Hex color
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Map hex color to color name
   */
  private mapToColorName(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 'unknown';

    const { r, g, b } = rgb;

    // Simple color mapping based on RGB values
    if (r < 50 && g < 50 && b < 50) return 'black';
    if (r > 200 && g > 200 && b > 200) return 'white';
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return r > 150 ? 'silver' : 'gray';
    if (r > g + 50 && r > b + 50) return 'red';
    if (b > r + 50 && b > g + 50) return 'blue';
    if (g > r + 50 && g > b + 50) return 'green';
    if (r > 150 && g > 100 && b < 50) return 'orange';
    if (r > 150 && g > 150 && b < 50) return 'yellow';

    return 'other';
  }

  /**
   * Convert hex to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert URL to base64
   */
  private async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg');
    return this.fileToBase64(file);
  }

  /**
   * Check if Visual Search is available
   */
  isAvailable(): boolean {
    return !!this.GOOGLE_VISION_API_KEY;
  }
}

export const visualSearchService = VisualSearchService.getInstance();

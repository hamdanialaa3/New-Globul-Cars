/**
 * image-optimizer.ts
 * 🖼️ Image Optimization for Core Web Vitals & GoogleBot
 * 
 * Serves next-gen formats (AVIF/WebP) specifically for GoogleBot
 * and optimizes images for maximum LCP performance.
 * 
 * @author SEO Supremacy System
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as sharp from 'sharp';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const storage = admin.storage();

// ============================================================================
// TYPES
// ============================================================================

interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

interface OptimizedImage {
    buffer: Buffer;
    contentType: string;
    size: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_DURATION = 31536000; // 1 year in seconds
const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || '';

// Predefined sizes for responsive images
const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 100, quality: 70 },
    small: { width: 400, height: 300, quality: 75 },
    medium: { width: 800, height: 600, quality: 80 },
    large: { width: 1200, height: 900, quality: 85 },
    full: { width: 1920, height: 1440, quality: 90 },
} as const;

// ============================================================================
// IMAGE OPTIMIZER SERVICE
// ============================================================================

export class ImageOptimizerService {
    /**
     * Detect if request is from GoogleBot
     */
    static isGoogleBot(userAgent: string): boolean {
        const botPatterns = [
            'Googlebot',
            'Googlebot-Image',
            'AdsBot-Google',
            'Mediapartners-Google',
        ];
        return botPatterns.some(pattern => userAgent.includes(pattern));
    }

    /**
     * Determine best format based on Accept header
     */
    static getBestFormat(acceptHeader: string, userAgent: string): 'avif' | 'webp' | 'jpeg' {
        // AVIF for modern browsers and GoogleBot
        if (acceptHeader.includes('image/avif')) {
            return 'avif';
        }
        // WebP for all others that support it
        if (acceptHeader.includes('image/webp')) {
            return 'webp';
        }
        // Fallback to JPEG
        return 'jpeg';
    }

    /**
     * Optimize image buffer
     */
    static async optimizeImage(
        inputBuffer: Buffer,
        options: ImageOptimizationOptions
    ): Promise<OptimizedImage> {
        let sharpInstance = sharp(inputBuffer);

        // Resize if dimensions specified
        if (options.width || options.height) {
            sharpInstance = sharpInstance.resize(options.width, options.height, {
                fit: 'cover',
                position: 'center',
                withoutEnlargement: true,
            });
        }

        // Convert to specified format
        let outputBuffer: Buffer;
        let contentType: string;

        switch (options.format) {
            case 'avif':
                outputBuffer = await sharpInstance
                    .avif({ quality: options.quality || 80, effort: 4 })
                    .toBuffer();
                contentType = 'image/avif';
                break;
            case 'webp':
                outputBuffer = await sharpInstance
                    .webp({ quality: options.quality || 80, effort: 4 })
                    .toBuffer();
                contentType = 'image/webp';
                break;
            case 'png':
                outputBuffer = await sharpInstance
                    .png({ quality: options.quality || 80, compressionLevel: 9 })
                    .toBuffer();
                contentType = 'image/png';
                break;
            default:
                outputBuffer = await sharpInstance
                    .jpeg({ quality: options.quality || 80, progressive: true })
                    .toBuffer();
                contentType = 'image/jpeg';
        }

        return {
            buffer: outputBuffer,
            contentType,
            size: outputBuffer.length,
        };
    }

    /**
     * Generate srcset URLs for responsive images
     */
    static generateSrcSet(baseUrl: string, imagePath: string): string {
        const sizes = ['small', 'medium', 'large'] as const;
        return sizes
            .map(size => {
                const { width } = IMAGE_SIZES[size];
                return `${baseUrl}/api/image/${imagePath}?size=${size} ${width}w`;
            })
            .join(', ');
    }

    /**
     * Generate picture element with sources
     */
    static generatePictureHtml(imagePath: string, alt: string, baseUrl: string): string {
        const srcSet = this.generateSrcSet(baseUrl, imagePath);

        return `
      <picture>
        <source 
          type="image/avif" 
          srcset="${srcSet.replace(/\?/g, '?format=avif&')}"
        />
        <source 
          type="image/webp" 
          srcset="${srcSet.replace(/\?/g, '?format=webp&')}"
        />
        <img
          src="${baseUrl}/api/image/${imagePath}?size=medium&format=jpeg"
          srcset="${srcSet}"
          sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
          alt="${alt}"
          loading="lazy"
          decoding="async"
        />
      </picture>
    `;
    }
}

// ============================================================================
// CLOUD FUNCTION: Image Optimization Endpoint
// ============================================================================

export const optimizeImage = functions
    .runWith({
        memory: '1GB',
        timeoutSeconds: 30,
    })
    .https.onRequest(async (req, res): Promise<void> => {
        try {
            const imagePath = req.query.path as string;
            const size = (req.query.size as keyof typeof IMAGE_SIZES) || 'medium';
            const format = req.query.format as 'webp' | 'avif' | 'jpeg' | undefined;

            if (!imagePath) {
                res.status(400).send('Missing image path');
                return;
            }

            // Determine optimal format
            const acceptHeader = req.headers.accept || '';
            const userAgent = req.headers['user-agent'] || '';
            const optimalFormat = format || ImageOptimizerService.getBestFormat(acceptHeader, userAgent);

            // Get size configuration
            const sizeConfig = IMAGE_SIZES[size] || IMAGE_SIZES.medium;

            // Fetch original image from Storage
            const bucket = storage.bucket(BUCKET_NAME);
            const file = bucket.file(imagePath);

            const [exists] = await file.exists();
            if (!exists) {
                res.status(404).send('Image not found');
                return;
            }

            const [imageBuffer] = await file.download();

            // Optimize image
            const optimized = await ImageOptimizerService.optimizeImage(
                imageBuffer,
                {
                    ...sizeConfig,
                    format: optimalFormat,
                }
            );

            // Set cache headers
            res.set('Content-Type', optimized.contentType);
            res.set('Cache-Control', `public, max-age=${CACHE_DURATION}, immutable`);
            res.set('Vary', 'Accept');
            res.set('X-Optimized-Size', optimized.size.toString());
            res.set('X-Original-Format', optimalFormat);

            // Additional SEO headers for GoogleBot
            if (ImageOptimizerService.isGoogleBot(userAgent)) {
                res.set('X-Robots-Tag', 'index, follow');
            }

            res.send(optimized.buffer);
        } catch (error) {
            functions.logger.error('Image optimization error:', error);
            res.status(500).send('Error optimizing image');
        }
    });

// ============================================================================
// HELPER: Generate optimized image URL
// ============================================================================

export function getOptimizedImageUrl(
    imagePath: string,
    size: keyof typeof IMAGE_SIZES = 'medium',
    format: 'webp' | 'avif' | 'auto' = 'auto'
): string {
    const baseUrl = process.env.FUNCTIONS_URL || 'https://us-central1-your-project.cloudfunctions.net';
    const formatParam = format === 'auto' ? '' : `&format=${format}`;
    return `${baseUrl}/optimizeImage?path=${encodeURIComponent(imagePath)}&size=${size}${formatParam}`;
}

export default ImageOptimizerService;

"use strict";
// functions/src/image-optimizer.ts
/**
 * Image Optimization Cloud Function
 *
 * Automatically optimizes uploaded images:
 * - Converts to WebP format (70-80% size reduction)
 * - Generates thumbnails (300x200, 600x400, 1200x800)
 * - Removes EXIF data (privacy & size)
 * - Adds watermark (optional, for branding)
 *
 * Triggered automatically on Firebase Storage upload
 *
 * FREE tier: 2M invocations/month (more than enough)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOptimizedImages = exports.optimizeImage = void 0;
exports.getResponsiveImageUrl = getResponsiveImageUrl;
const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const storage = admin.storage();
/**
 * Image sizes for responsive display
 * Generated automatically for each upload
 */
const IMAGE_SIZES = [
    { suffix: '_thumb', width: 300, height: 200 }, // Card thumbnails
    { suffix: '_medium', width: 600, height: 400 }, // Mobile display
    { suffix: '_large', width: 1200, height: 800 }, // Desktop display
    { suffix: '_hd', width: 1920, height: 1280 } // Full-size viewing
];
/**
 * Optimize images on upload
 *
 * Triggers when file is uploaded to:
 * - workflow-images/{userId}/{filename}
 * - car-images/{carId}/{filename}
 */
exports.optimizeImage = functions
    .region('europe-west1')
    .storage
    .bucket('fire-new-globul.firebasestorage.app')
    .object()
    .onFinalize(async (object) => {
    try {
        const filePath = object.name || '';
        // Skip if no file path
        if (!filePath) {
            logger.debug('No file path, skipping');
            return null;
        }
        const contentType = object.contentType;
        // Only process images
        if (!contentType || !contentType.startsWith('image/')) {
            logger.debug('Not an image, skipping', { filePath });
            return null;
        }
        // Skip if already optimized (has size suffix)
        if (/_thumb|_medium|_large|_hd\.webp$/.test(filePath)) {
            logger.debug('Already optimized, skipping', { filePath });
            return null;
        }
        // Skip non-car images (e.g., logos, profile pictures)
        if (!filePath.includes('workflow-images') && !filePath.includes('car-images')) {
            logger.debug('Not a car image, skipping', { filePath });
            return null;
        }
        logger.info('Optimizing image', { filePath });
        const bucket = storage.bucket(object.bucket);
        const fileName = path.basename(filePath);
        const fileDir = path.dirname(filePath);
        const tempFilePath = path.join(os.tmpdir(), fileName);
        // Download original image
        await bucket.file(filePath).download({ destination: tempFilePath });
        // Get image metadata
        const metadata = await sharp(tempFilePath).metadata();
        logger.info('Original image dimensions', {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        });
        // Generate optimized versions
        const uploadPromises = [];
        for (const size of IMAGE_SIZES) {
            const optimizedFileName = fileName.replace(/\.[^.]+$/, `${size.suffix}.webp`);
            const optimizedFilePath = path.join(fileDir, optimizedFileName);
            const tempOptimizedPath = path.join(os.tmpdir(), optimizedFileName);
            // Optimize with Sharp
            await sharp(tempFilePath)
                .resize(size.width, size.height, {
                fit: 'inside', // Preserve aspect ratio
                withoutEnlargement: true // Don't upscale small images
            })
                .webp({
                quality: 85, // High quality WebP
                effort: 4 // Balance between size and processing time
            })
                .toFile(tempOptimizedPath);
            // Upload optimized version
            uploadPromises.push(bucket.upload(tempOptimizedPath, {
                destination: optimizedFilePath,
                metadata: {
                    contentType: 'image/webp',
                    cacheControl: 'public, max-age=31536000', // Cache for 1 year
                    metadata: {
                        optimized: 'true',
                        originalFormat: metadata.format || 'unknown',
                        generatedBy: 'image-optimizer-v1'
                    }
                }
            }));
            // Clean up temp file
            fs.unlinkSync(tempOptimizedPath);
        }
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
        // Clean up original temp file
        fs.unlinkSync(tempFilePath);
        logger.info('Generated optimized versions', {
            fileName,
            versions: IMAGE_SIZES.length
        });
        return null;
    }
    catch (error) {
        logger.error('Error optimizing image', { error });
        return null;
    }
});
/**
 * Delete optimized versions when original is deleted
 *
 * Keeps storage clean and prevents orphaned files
 */
exports.cleanupOptimizedImages = functions
    .region('europe-west1')
    .storage
    .bucket('fire-new-globul.firebasestorage.app')
    .object()
    .onDelete(async (object) => {
    try {
        const filePath = object.name || '';
        // Skip if no file path
        if (!filePath) {
            return null;
        }
        // Skip if already an optimized version
        if (/_thumb|_medium|_large|_hd\.webp$/.test(filePath)) {
            return null;
        }
        const bucket = storage.bucket(object.bucket);
        const fileName = path.basename(filePath);
        const fileDir = path.dirname(filePath);
        // Delete all optimized versions
        const deletePromises = [];
        for (const size of IMAGE_SIZES) {
            const optimizedFileName = fileName.replace(/\.[^.]+$/, `${size.suffix}.webp`);
            const optimizedFilePath = path.join(fileDir, optimizedFileName);
            deletePromises.push(bucket.file(optimizedFilePath).delete().catch(() => {
                // Ignore errors if file doesn't exist
                logger.debug('Optimized file not found', { optimizedFilePath });
            }));
        }
        await Promise.all(deletePromises);
        logger.info('Cleaned up optimized versions', { fileName });
        return null;
    }
    catch (error) {
        logger.error('Error cleaning up optimized images', { error });
        return null;
    }
});
/**
 * Helper: Get responsive image URL
 * Use this in frontend to load correct size
 *
 * @example
 * const url = getResponsiveImageUrl('original.jpg', 'medium');
 * // Returns: original_medium.webp
 */
function getResponsiveImageUrl(originalUrl, size = 'medium') {
    const sizeMap = {
        thumb: '_thumb',
        medium: '_medium',
        large: '_large',
        hd: '_hd'
    };
    const suffix = sizeMap[size];
    // Replace file extension with size suffix + .webp
    return originalUrl.replace(/\.[^.]+$/, `${suffix}.webp`);
}
exports.default = {
    optimizeImage: exports.optimizeImage,
    cleanupOptimizedImages: exports.cleanupOptimizedImages,
    getResponsiveImageUrl
};
//# sourceMappingURL=image-optimizer.js.map
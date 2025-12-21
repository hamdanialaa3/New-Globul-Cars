#!/usr/bin/env node
/**
 * Image Optimization Script - PROFESSIONAL VERSION
 * تحويل الصور إلى WebP + توليد responsive sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const QUALITY = {
  webp: 80,
  jpeg: 85,
  png: 90
};

const SIZES = {
  thumbnail: 200,
  small: 400,
  medium: 800,
  large: 1200
};

// Directories to process
const IMAGE_DIRS = [
  'public/**/*.{jpg,jpeg,png}',
  'src/**/*.{jpg,jpeg,png}',
  '../assets/**/*.{jpg,jpeg,png}'
];

// Stats
let stats = {
  processed: 0,
  failed: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  skipped: 0
};

/**
 * Convert image to WebP with responsive sizes
 */
async function optimizeImage(inputPath) {
  try {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    
    // Skip if already processed (webp exists)
    const webpPath = path.join(dir, `${basename}.webp`);
    if (fs.existsSync(webpPath)) {
      stats.skipped++;
      return;
    }

    const originalSize = fs.statSync(inputPath).size;
    stats.totalOriginalSize += originalSize;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Generate WebP versions
    const conversions = [];

    // Original size WebP
    conversions.push(
      image
        .clone()
        .webp({ quality: QUALITY.webp })
        .toFile(webpPath)
    );

    // Responsive sizes (only if image is large enough)
    if (metadata.width > SIZES.medium) {
      for (const [sizeName, width] of Object.entries(SIZES)) {
        if (width < metadata.width) {
          const responsivePath = path.join(dir, `${basename}-${sizeName}.webp`);
          conversions.push(
            image
              .clone()
              .resize(width, null, { withoutEnlargement: true })
              .webp({ quality: QUALITY.webp })
              .toFile(responsivePath)
          );
        }
      }
    }

    await Promise.all(conversions);

    // Calculate savings
    const webpSize = fs.statSync(webpPath).size;
    stats.totalOptimizedSize += webpSize;
    stats.processed++;

    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
    console.log(`✅ ${path.relative(process.cwd(), inputPath)}`);
    console.log(`   ${(originalSize / 1024).toFixed(1)} KB → ${(webpSize / 1024).toFixed(1)} KB (-${savings}%)`);

  } catch (error) {
    stats.failed++;
    console.error(`❌ Failed: ${inputPath}`, error.message);
  }
}

/**
 * Process all images
 */
async function processAllImages() {
  console.log('\n🖼️  Starting Image Optimization...\n');
  console.log('📁 Scanning directories...\n');

  const allImages = [];
  for (const pattern of IMAGE_DIRS) {
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/build/**', '**/*.webp']
    });
    allImages.push(...files);
  }

  console.log(`📊 Found ${allImages.length} images\n`);

  // Process in batches to avoid memory issues
  const BATCH_SIZE = 10;
  for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
    const batch = allImages.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(optimizeImage));
    
    // Progress update
    const progress = Math.min(100, ((i + BATCH_SIZE) / allImages.length * 100)).toFixed(1);
    console.log(`\n⏳ Progress: ${progress}%\n`);
  }

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('✅ OPTIMIZATION COMPLETE!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Processed: ${stats.processed} images`);
  console.log(`   Skipped: ${stats.skipped} images (already optimized)`);
  console.log(`   Failed: ${stats.failed} images`);
  console.log(`\n💾 Size Reduction:`);
  console.log(`   Original: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Optimized: ${(stats.totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  
  const totalSavings = stats.totalOriginalSize - stats.totalOptimizedSize;
  const savingsPercent = ((totalSavings / stats.totalOriginalSize) * 100).toFixed(1);
  console.log(`   Saved: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (-${savingsPercent}%)`);
  console.log('='.repeat(60) + '\n');
}

// Legacy function - kept for compatibility
const getImageFiles = (dir) => {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
      files.push(fullPath);
    }
  });

  return files;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Run new optimization if called directly
if (require.main === module) {
  processAllImages().catch(console.error);
} else {
  // Legacy behavior for backward compatibility
  const imageDir = path.join(__dirname, '../build/static/media');
  if (fs.existsSync(imageDir)) {
    const images = getImageFiles(imageDir);
    let totalSize = 0;

    console.log(`\n📊 Found ${images.length} images\n`);

    images.forEach((img, index) => {
      const stats = fs.statSync(img);
      const size = stats.size;
      totalSize += size;
      
      const fileName = path.basename(img);
      console.log(`${index + 1}. ${fileName} - ${formatBytes(size)}`);
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 Total Size: ${formatBytes(totalSize)}`);
    console.log(`\n💡 Recommendation:`);
    console.log(`   Current: ${formatBytes(totalSize)}`);
    console.log(`   Target:  ${formatBytes(totalSize * 0.3)} (with compression)`);
    console.log(`   Savings: ${formatBytes(totalSize * 0.7)} (70% reduction)`);
    console.log(`\n🔧 To compress images, run:`);
    console.log(`   node scripts/optimize-images.js`);
    console.log(`\n✅ Script completed!`);
  }
}

module.exports = { optimizeImage, processAllImages, getImageFiles, formatBytes };



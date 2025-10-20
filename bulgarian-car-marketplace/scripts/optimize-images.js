// scripts/optimize-images.js
// ⚡ Image Optimization Script - Compress images for better performance

const fs = require('fs');
const path = require('path');

console.log('🖼️  Image Optimization Script');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const imageDir = path.join(__dirname, '../build/static/media');

if (!fs.existsSync(imageDir)) {
  console.log('⚠️  Build folder not found. Run "npm run build" first.');
  process.exit(0);
}

// Get all image files
const getImageFiles = (dir) => {
  const files = [];
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
console.log(`\n🔧 To compress images, consider using:`);
console.log(`   • TinyPNG API`);
console.log(`   • imagemin`);
console.log(`   • sharp`);
console.log(`   • WebP format conversion`);
console.log(`\n✅ Script completed!`);


const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// تحليل الصور في المشروع
class ImageAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.images = [];
    this.duplicates = [];
    this.hashMap = new Map();
  }

  // حساب hash للملف
  getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // فحص جميع الصور
  async scanImages(dir = this.rootDir, exclude = ['node_modules', 'build', '.git']) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!exclude.includes(entry.name)) {
          await this.scanImages(fullPath, exclude);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          const stats = fs.statSync(fullPath);
          const hash = this.getFileHash(fullPath);
          
          const imageInfo = {
            name: entry.name,
            path: fullPath,
            relativePath: path.relative(this.rootDir, fullPath),
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
            hash: hash,
            ext: ext
          };

          this.images.push(imageInfo);

          // تتبع التكرار بناءً على hash
          if (this.hashMap.has(hash)) {
            this.hashMap.get(hash).push(imageInfo);
          } else {
            this.hashMap.set(hash, [imageInfo]);
          }
        }
      }
    }
  }

  // العثور على الصور المكررة
  findDuplicates() {
    this.duplicates = [];
    for (const [hash, files] of this.hashMap.entries()) {
      if (files.length > 1) {
        this.duplicates.push({
          hash: hash,
          count: files.length,
          files: files,
          totalSize: files.reduce((sum, f) => sum + f.size, 0),
          wastedSpace: (files.length - 1) * files[0].size
        });
      }
    }
    // ترتيب حسب المساحة المهدرة
    this.duplicates.sort((a, b) => b.wastedSpace - a.wastedSpace);
    return this.duplicates;
  }

  // إنشاء تقرير
  generateReport() {
    const totalSize = this.images.reduce((sum, img) => sum + img.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    const duplicates = this.findDuplicates();
    const wastedSpace = duplicates.reduce((sum, d) => sum + d.wastedSpace, 0);
    const wastedSpaceMB = (wastedSpace / (1024 * 1024)).toFixed(2);

    // أكبر الصور
    const largestImages = [...this.images]
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);

    return {
      summary: {
        totalImages: this.images.length,
        totalSizeMB: totalSizeMB,
        duplicateGroups: duplicates.length,
        duplicateFiles: duplicates.reduce((sum, d) => sum + d.count - 1, 0),
        wastedSpaceMB: wastedSpaceMB,
        potentialSavings: `${wastedSpaceMB} MB (${((wastedSpace / totalSize) * 100).toFixed(1)}%)`
      },
      largestImages: largestImages.map(img => ({
        name: img.name,
        path: img.relativePath,
        size: `${img.sizeMB} MB`
      })),
      duplicates: duplicates.slice(0, 10).map(d => ({
        fileName: d.files[0].name,
        copies: d.count,
        wastedMB: (d.wastedSpace / (1024 * 1024)).toFixed(2),
        locations: d.files.map(f => f.relativePath)
      })),
      recommendations: this.generateRecommendations(duplicates, largestImages)
    };
  }

  // توصيات التحسين
  generateRecommendations(duplicates, largestImages) {
    const recommendations = [];

    // توصية 1: حذف التكرار
    if (duplicates.length > 0) {
      const wastedMB = duplicates.reduce((sum, d) => sum + d.wastedSpace, 0) / (1024 * 1024);
      recommendations.push({
        priority: 'HIGH',
        type: 'Remove Duplicates',
        impact: `${wastedMB.toFixed(2)} MB`,
        description: `Found ${duplicates.length} groups of duplicate images. Remove duplicates to save space.`,
        action: 'Keep only one copy of each image (prefer public/ folder)'
      });
    }

    // توصية 2: تحويل إلى WebP
    const largeJPGs = largestImages.filter(img => ['.jpg', '.jpeg'].includes(img.ext));
    if (largeJPGs.length > 0) {
      const jpgSize = largeJPGs.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024);
      const estimatedSavings = jpgSize * 0.7; // WebP ~70% أصغر
      recommendations.push({
        priority: 'HIGH',
        type: 'Convert to WebP',
        impact: `~${estimatedSavings.toFixed(2)} MB`,
        description: `Convert ${largeJPGs.length} large JPG images to WebP format`,
        action: 'Use sharp/imagemin to convert JPG → WebP with 80-85% quality'
      });
    }

    // توصية 3: صور responsive
    const veryLargeImages = largestImages.filter(img => img.size > 1024 * 1024); // > 1 MB
    if (veryLargeImages.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'Responsive Images',
        impact: `Faster loading on mobile`,
        description: `Generate multiple sizes for ${veryLargeImages.length} large images`,
        action: 'Create small (400w), medium (800w), large (1200w) versions'
      });
    }

    return recommendations;
  }

  // حفظ التقرير
  saveReport(outputPath) {
    const report = this.generateReport();
    const reportContent = `# 📊 Image Optimization Analysis Report
Generated: ${new Date().toLocaleString('ar-BG')}

## 📈 Summary
- **Total Images:** ${report.summary.totalImages}
- **Total Size:** ${report.summary.totalSizeMB} MB
- **Duplicate Groups:** ${report.summary.duplicateGroups}
- **Duplicate Files:** ${report.summary.duplicateFiles}
- **Wasted Space:** ${report.summary.wastedSpaceMB} MB
- **Potential Savings:** ${report.summary.potentialSavings}

## 🔝 Top 20 Largest Images
${report.largestImages.map((img, i) => `${i + 1}. **${img.name}** - ${img.size}\n   \`${img.path}\``).join('\n')}

## 🔄 Top 10 Duplicate Groups
${report.duplicates.map((dup, i) => `${i + 1}. **${dup.fileName}** (${dup.copies} copies) - Wasted: ${dup.wastedMB} MB\n${dup.locations.map(loc => `   - \`${loc}\``).join('\n')}`).join('\n\n')}

## 💡 Recommendations
${report.recommendations.map((rec, i) => `### ${i + 1}. [${rec.priority}] ${rec.type}
**Impact:** ${rec.impact}
**Description:** ${rec.description}
**Action:** ${rec.action}`).join('\n\n')}

---
*Generated by Image Analyzer for Bulgarian Car Marketplace*
`;

    fs.writeFileSync(outputPath, reportContent);
    fs.writeFileSync(outputPath.replace('.md', '.json'), JSON.stringify(report, null, 2));
    
    console.log(`✅ Report saved to: ${outputPath}`);
    return report;
  }
}

// تشغيل التحليل
async function main() {
  const rootDir = path.join(__dirname, '..');
  const analyzer = new ImageAnalyzer(rootDir);

  console.log('🔍 Scanning images...');
  await analyzer.scanImages();

  console.log(`📊 Found ${analyzer.images.length} images`);
  
  const reportPath = path.join(__dirname, '../WEEK2_DAY3_IMAGE_ANALYSIS.md');
  const report = analyzer.saveReport(reportPath);

  console.log('\n✅ Analysis complete!');
  console.log(`📄 Report: ${reportPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${report.summary.totalSizeMB} MB`);
  console.log(`   Duplicates: ${report.summary.duplicateFiles} files`);
  console.log(`   Wasted: ${report.summary.wastedSpaceMB} MB`);
  console.log(`   Savings: ${report.summary.potentialSavings}`);
}

main().catch(console.error);

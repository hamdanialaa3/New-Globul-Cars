import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// تحليل جودة الصور وكشف التشوهات
class ImageQualityAnalyzer {
    constructor() {
        this.brandDirectories = [];
        this.analysisResults = {
            totalImages: 0,
            qualityAnalysis: {
                excellent: [],
                good: [],
                distorted: [],
                corrupted: []
            },
            colorAnalysis: {
                naturalColors: [],
                distortedColors: [],
                barcodeImages: []
            },
            sizeAnalysis: {}
        };
    }

    // قراءة header الصورة للكشف عن النوع والجودة
    async analyzeImageHeader(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const header = buffer.slice(0, 16);

            // كشف نوع الصورة
            let imageType = 'unknown';
            if (header[0] === 0xFF && header[1] === 0xD8) {
                imageType = 'jpeg';
            } else if (header[0] === 0x89 && header[1] === 0x50) {
                imageType = 'png';
            } else if (header[0] === 0x47 && header[1] === 0x49) {
                imageType = 'gif';
            }

            // كشف الصور المشوهة (placeholders)
            const isPlaceholder = this.detectPlaceholder(buffer);

            // كشف الباركود (البحث عن أنماط سوداء وبيضاء منتظمة)
            const hasBarcode = this.detectBarcodePattern(buffer);

            return {
                type: imageType,
                size: buffer.length,
                isPlaceholder,
                hasBarcode,
                quality: this.assessQuality(buffer)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    // كشف الصور المشوهة (placeholders)
    detectPlaceholder(buffer) {
        // كشف الأحجام المعروفة للplaceholders
        const knownPlaceholderSizes = [6428, 204125, 199300];

        if (knownPlaceholderSizes.includes(buffer.length)) {
            return true;
        }

        // كشف الأنماط المتكررة (صفحات 404 محولة لصور)
        const sample = buffer.slice(0, 1000);
        const repeatedPattern = this.hasRepeatedPattern(sample);

        return repeatedPattern;
    }

    // كشف الأنماط المتكررة
    hasRepeatedPattern(buffer) {
        const chunkSize = 100;
        const chunks = [];

        for (let i = 0; i < buffer.length - chunkSize; i += chunkSize) {
            chunks.push(buffer.slice(i, i + chunkSize));
        }

        // عد تكرار كل chunk
        const patternCount = {};
        chunks.forEach(chunk => {
            const key = chunk.toString('hex');
            patternCount[key] = (patternCount[key] || 0) + 1;
        });

        // إذا كان هناك نمط متكرر جداً، فهي صورة مشوهة
        const maxRepeats = Math.max(...Object.values(patternCount));
        return maxRepeats > chunks.length * 0.8; // 80% تكرار
    }

    // كشف الباركود
    detectBarcodePattern(buffer) {
        // البحث عن أنماط سوداء وبيضاء منتظمة
        // هذا كشف بسيط - في الواقع نحتاج مكتبة متخصصة
        const blackWhiteRatio = this.calculateBlackWhiteRatio(buffer);
        return blackWhiteRatio > 0.3 && blackWhiteRatio < 0.7; // توازن مناسب للباركود
    }

    // حساب نسبة الأسود والأبيض
    calculateBlackWhiteRatio(buffer) {
        let blackPixels = 0;
        let whitePixels = 0;
        let totalPixels = 0;

        // للـ JPEG، نحلل البيانات الأولية
        for (let i = 0; i < Math.min(buffer.length, 10000); i++) {
            const byte = buffer[i];
            if (byte < 64) blackPixels++; // أسود
            else if (byte > 192) whitePixels++; // أبيض
            totalPixels++;
        }

        return totalPixels > 0 ? (blackPixels + whitePixels) / totalPixels : 0;
    }

    // تقييم الجودة العامة
    assessQuality(buffer) {
        const size = buffer.length;

        // جودة بناءً على الحجم والمحتوى
        if (size < 5000) return 'corrupted'; // صغيرة جداً
        if (size > 2000000) return 'excellent'; // كبيرة وجودة عالية
        if (this.detectPlaceholder(buffer)) return 'corrupted';
        if (this.detectBarcodePattern(buffer)) return 'excellent';

        // تحليل إضافي للتشوهات
        const distortionLevel = this.calculateDistortionLevel(buffer);
        if (distortionLevel > 0.7) return 'distorted';
        if (distortionLevel > 0.4) return 'good';

        return 'excellent';
    }

    // حساب مستوى التشوه
    calculateDistortionLevel(buffer) {
        // تحليل بسيط للتشوهات
        let distortionScore = 0;

        // كشف الأنماط غير الطبيعية
        const entropy = this.calculateEntropy(buffer);
        if (entropy < 0.1) distortionScore += 0.5; // انخفاض الإنتروبيا = تشوه

        // كشف الألوان المتكررة جداً
        const colorVariance = this.calculateColorVariance(buffer);
        if (colorVariance < 10) distortionScore += 0.3; // تباين منخفض = تشوه

        return Math.min(distortionScore, 1.0);
    }

    // حساب الإنتروبيا
    calculateEntropy(buffer) {
        const freq = {};
        buffer.forEach(byte => {
            freq[byte] = (freq[byte] || 0) + 1;
        });

        let entropy = 0;
        const len = buffer.length;
        Object.values(freq).forEach(count => {
            const p = count / len;
            entropy -= p * Math.log2(p);
        });

        return entropy / 8; // normalize to 0-1
    }

    // حساب تباين الألوان
    calculateColorVariance(buffer) {
        const values = Array.from(buffer.slice(0, 1000));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    // تحليل مجلد كامل مع البحث المتكرر
    async analyzeDirectory(dirPath) {
        console.log(`🔍 تحليل مجلد: ${path.basename(dirPath)}`);

        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    // بحث متكرر في المجلدات الفرعية
                    await this.analyzeDirectory(itemPath);
                } else if (item.isFile() && this.isImageFile(item.name)) {
                    // تحليل ملف الصورة
                    const analysis = await this.analyzeImageHeader(itemPath);
                    this.categorizeImage(itemPath, analysis);
                }
            }
        } catch (error) {
            console.error(`خطأ في تحليل مجلد ${dirPath}:`, error.message);
        }
    }

    // فحص ما إذا كان الملف صورة
    isImageFile(filename) {
        const ext = filename.toLowerCase();
        return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
    }

    // تصنيف الصورة بناءً على التحليل
    categorizeImage(filePath, analysis) {
        this.analysisResults.totalImages++;

        // تصنيف الصورة
        if (analysis.hasBarcode) {
            this.analysisResults.colorAnalysis.barcodeImages.push(filePath);
            this.analysisResults.qualityAnalysis.excellent.push(filePath);
        } else if (analysis.quality === 'corrupted') {
            this.analysisResults.qualityAnalysis.corrupted.push(filePath);
        } else if (analysis.quality === 'distorted') {
            this.analysisResults.qualityAnalysis.distorted.push(filePath);
            this.analysisResults.colorAnalysis.distortedColors.push(filePath);
        } else if (analysis.quality === 'good') {
            this.analysisResults.qualityAnalysis.good.push(filePath);
            this.analysisResults.colorAnalysis.naturalColors.push(filePath);
        } else {
            this.analysisResults.qualityAnalysis.excellent.push(filePath);
            this.analysisResults.colorAnalysis.naturalColors.push(filePath);
        }

        // تحليل الحجم
        const sizeCategory = this.getSizeCategory(analysis.size);
        this.analysisResults.sizeAnalysis[sizeCategory] =
            (this.analysisResults.sizeAnalysis[sizeCategory] || 0) + 1;
    }

    // تصنيف الحجم
    getSizeCategory(size) {
        if (size < 10000) return 'very_small';
        if (size < 50000) return 'small';
        if (size < 200000) return 'medium';
        if (size < 1000000) return 'large';
        return 'very_large';
    }

    // تحليل جميع المجلدات
    async analyzeAllBrands() {
        console.log('🚀 بدء التحليل المتقدم لجودة الصور...\n');

        const brandDir = path.join(process.cwd(), 'brand_directories');

        try {
            const brands = await fs.readdir(brandDir);
            this.brandDirectories = brands.filter(item =>
                !item.includes('.') // مجلدات فقط
            );

            console.log(`📊 تحليل ${this.brandDirectories.length} علامة تجارية...`);

            for (const brand of this.brandDirectories) {
                const brandPath = path.join(brandDir, brand);
                await this.analyzeDirectory(brandPath);
            }

            this.printAdvancedReport();

        } catch (error) {
            console.error('خطأ في التحليل:', error.message);
        }
    }

    // طباعة التقرير المتقدم
    printAdvancedReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 التحليل المتقدم لجودة الصور');
        console.log('='.repeat(60));

        console.log(`\n📊 إجمالي الصور المُحلّلة: ${this.analysisResults.totalImages}`);

        console.log('\n🎨 تحليل الجودة:');
        console.log(`   ✅ ممتازة (مع باركود): ${this.analysisResults.qualityAnalysis.excellent.length}`);
        console.log(`   🟢 جيدة: ${this.analysisResults.qualityAnalysis.good.length}`);
        console.log(`   🟡 مشوهة: ${this.analysisResults.qualityAnalysis.distorted.length}`);
        console.log(`   ❌ تالفة: ${this.analysisResults.qualityAnalysis.corrupted.length}`);

        console.log('\n🔍 تحليل الألوان والباركود:');
        console.log(`   📱 صور مع باركود: ${this.analysisResults.colorAnalysis.barcodeImages.length}`);
        console.log(`   🎨 ألوان طبيعية: ${this.analysisResults.colorAnalysis.naturalColors.length}`);
        console.log(`   🌈 ألوان مشوهة: ${this.analysisResults.colorAnalysis.distortedColors.length}`);

        console.log('\n📏 توزيع الأحجام:');
        Object.entries(this.analysisResults.sizeAnalysis).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} صور`);
        });

        console.log('\n🏆 الصور الممتازة (مع باركود):');
        this.analysisResults.colorAnalysis.barcodeImages.slice(0, 10).forEach(img => {
            console.log(`   ✅ ${path.basename(img)}`);
        });

        if (this.analysisResults.colorAnalysis.barcodeImages.length > 10) {
            console.log(`   ... و ${this.analysisResults.colorAnalysis.barcodeImages.length - 10} صور أخرى`);
        }

        console.log('\n⚠️  الصور المشوهة (عينة):');
        this.analysisResults.qualityAnalysis.distorted.slice(0, 5).forEach(img => {
            console.log(`   🟡 ${path.basename(img)}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('💡 توصيات:');
        console.log('• الاحتفاظ بالصور ذات الباركود فقط');
        console.log('• حذف جميع الصور المشوهة');
        console.log('• إعادة تصميم نظام التحميل');
        console.log('='.repeat(60));
    }
}

// تشغيل التحليل
async function main() {
    const analyzer = new ImageQualityAnalyzer();
    await analyzer.analyzeAllBrands();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ImageQualityAnalyzer;
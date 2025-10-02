import fs from 'fs/promises';
import path from 'path';

async function analyzeDistortionCauses() {
    console.log('🔍 تحليل أسباب تشوه الصور...\n');

    const brandDir = path.join(process.cwd(), 'brand_directories');
    const analysis = {
        totalImages: 0,
        sizePatterns: {},
        distortionPatterns: [],
        potentialCauses: []
    };

    async function analyzeDirectory(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    await analyzeDirectory(itemPath);
                } else if (item.isFile() && isImageFile(item.name)) {
                    analysis.totalImages++;
                    const stats = await analyzeImageFile(itemPath);
                    updateAnalysis(stats);
                }
            }
        } catch (error) {
            // تجاهل الأخطاء
        }
    }

    function isImageFile(filename) {
        const ext = filename.toLowerCase();
        return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
    }

    async function analyzeImageFile(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const size = buffer.length;
            const fileName = path.basename(filePath);

            // تحليل الأنماط
            const patterns = {
                size,
                fileName,
                isPlaceholder: [6428, 204125, 199300].includes(size),
                entropy: calculateEntropy(buffer),
                colorVariance: calculateColorVariance(buffer),
                hasBarcodePattern: detectBarcodePattern(buffer),
                compressionRatio: calculateCompressionRatio(buffer),
                path: filePath
            };

            return patterns;
        } catch (error) {
            return { error: error.message };
        }
    }

    function calculateEntropy(buffer) {
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

        return entropy / 8;
    }

    function calculateColorVariance(buffer) {
        const sample = buffer.slice(0, 1000);
        const values = Array.from(sample);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    function detectBarcodePattern(buffer) {
        let blackCount = 0;
        let whiteCount = 0;

        for (let i = 0; i < Math.min(buffer.length, 5000); i++) {
            const byte = buffer[i];
            if (byte < 50) blackCount++;
            else if (byte > 200) whiteCount++;
        }

        const ratio = (blackCount + whiteCount) / Math.min(buffer.length, 5000);
        return ratio > 0.4;
    }

    function calculateCompressionRatio(buffer) {
        // تقدير نسبة الضغط بناءً على التكرار
        const sample = buffer.slice(0, 1000);
        const uniqueBytes = new Set(sample).size;
        return uniqueBytes / sample.length;
    }

    function updateAnalysis(stats) {
        if (stats.error) return;

        // تحليل الأحجام
        const sizeCategory = getSizeCategory(stats.size);
        analysis.sizePatterns[sizeCategory] = (analysis.sizePatterns[sizeCategory] || 0) + 1;

        // كشف أنماط التشوه
        if (stats.entropy < 0.1) {
            analysis.distortionPatterns.push({
                type: 'low_entropy',
                reason: 'إنتروبيا منخفضة جداً - صورة متكررة أو مشوهة',
                file: stats.path
            });
        }

        if (stats.colorVariance < 15) {
            analysis.distortionPatterns.push({
                type: 'low_variance',
                reason: 'تباين ألوان منخفض - ألوان مشوهة أو غير طبيعية',
                file: stats.path
            });
        }

        if (stats.compressionRatio < 0.3) {
            analysis.distortionPatterns.push({
                type: 'over_compressed',
                reason: 'ضغط مفرط - فقدان جودة',
                file: stats.path
            });
        }
    }

    function getSizeCategory(size) {
        if (size < 10000) return 'very_small';
        if (size < 50000) return 'small';
        if (size < 200000) return 'medium';
        if (size < 1000000) return 'large';
        return 'very_large';
    }

    // تشغيل التحليل
    await analyzeDirectory(brandDir);

    // تحليل الأسباب المحتملة
    analysis.potentialCauses = identifyPotentialCauses(analysis);

    // طباعة النتائج
    printAnalysisResults(analysis);

    return analysis;
}

function identifyPotentialCauses(analysis) {
    const causes = [];

    // تحليل توزيع الأحجام
    const sizeDistribution = analysis.sizePatterns;
    if (sizeDistribution.very_small > analysis.totalImages * 0.1) {
        causes.push({
            cause: 'تحميل صور مصغرة أو thumbnails',
            solution: 'تعديل محددات الجودة في الطلبات',
            impact: 'high'
        });
    }

    // تحليل أنماط التشوه
    const distortionTypes = {};
    analysis.distortionPatterns.forEach(pattern => {
        distortionTypes[pattern.type] = (distortionTypes[pattern.type] || 0) + 1;
    });

    if (distortionTypes.low_entropy > analysis.totalImages * 0.5) {
        causes.push({
            cause: 'تحميل صفحات خطأ محولة لصور',
            solution: 'إضافة فحص نوع المحتوى قبل التحميل',
            impact: 'critical'
        });
    }

    if (distortionTypes.low_variance > analysis.totalImages * 0.3) {
        causes.push({
            cause: 'مشاكل في معالجة الألوان',
            solution: 'فحص إعدادات التحويل والضغط',
            impact: 'high'
        });
    }

    if (distortionTypes.over_compressed > analysis.totalImages * 0.2) {
        causes.push({
            cause: 'ضغط مفرط من الموقع',
            solution: 'طلب صور أصلية غير مضغوطة',
            impact: 'medium'
        });
    }

    // أسباب عامة
    causes.push({
        cause: 'عدم وجود صور أصلية واضحة على الموقع',
        solution: 'البحث عن مصادر بديلة أو تحسين معايير البحث',
        impact: 'critical'
    });

    causes.push({
        cause: 'مشاكل في كشف عناوين URL الصحيحة',
        solution: 'تحسين خوارزميات استخراج الروابط',
        impact: 'high'
    });

    return causes;
}

function printAnalysisResults(analysis) {
    console.log('📊 تحليل أسباب تشوه الصور:');
    console.log(`   إجمالي الصور: ${analysis.totalImages}`);

    console.log('\n📏 توزيع الأحجام:');
    Object.entries(analysis.sizePatterns).forEach(([category, count]) => {
        const percentage = ((count / analysis.totalImages) * 100).toFixed(1);
        console.log(`   ${category}: ${count} صورة (${percentage}%)`);
    });

    console.log('\n🚨 أنماط التشوه المكتشفة:');
    const distortionTypes = {};
    analysis.distortionPatterns.forEach(pattern => {
        distortionTypes[pattern.type] = (distortionTypes[pattern.type] || 0) + 1;
    });

    Object.entries(distortionTypes).forEach(([type, count]) => {
        const percentage = ((count / analysis.totalImages) * 100).toFixed(1);
        console.log(`   ${type}: ${count} صورة (${percentage}%)`);
    });

    console.log('\n🔍 الأسباب المحتملة للتشوهات:');
    analysis.potentialCauses.forEach((cause, index) => {
        console.log(`\n${index + 1}. ${cause.cause}`);
        console.log(`   الحل: ${cause.solution}`);
        console.log(`   التأثير: ${cause.impact}`);
    });

    console.log('\n💡 التوصيات لتحسين التحميل:');
    console.log('1. إضافة فحص جودة الصور قبل الحفظ');
    console.log('2. تجربة مصادر مختلفة للصور');
    console.log('3. تحسين معايير استخراج الروابط');
    console.log('4. إضافة فلاتر للكشف عن الصور المشوهة');
    console.log('5. استخدام API بديلة إذا أمكن');
}

analyzeDistortionCauses().catch(console.error);
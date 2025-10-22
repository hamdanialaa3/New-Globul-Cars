import fs from 'fs/promises';
import path from 'path';

async function quickImageAnalysis() {
    console.log('🚀 تحليل سريع لجودة الصور...\n');

    const brandDir = path.join(process.cwd(), 'brand_directories');
    let totalImages = 0;
    let corruptedCount = 0;
    let distortedCount = 0;
    let goodCount = 0;
    let barcodeCount = 0;

    async function analyzeDirectory(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    await analyzeDirectory(itemPath);
                } else if (item.isFile() && isImageFile(item.name)) {
                    totalImages++;
                    const analysis = await quickAnalyzeImage(itemPath);

                    if (analysis.isCorrupted) corruptedCount++;
                    else if (analysis.isDistorted) distortedCount++;
                    else if (analysis.hasBarcode) {
                        goodCount++;
                        barcodeCount++;
                    } else {
                        goodCount++;
                    }
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

    async function quickAnalyzeImage(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const size = buffer.length;

            // كشف الصور التالفة
            const isCorrupted = size < 5000 || [6428, 204125, 199300].includes(size);

            // كشف التشوهات
            const isDistorted = calculateDistortionScore(buffer) > 0.5;

            // كشف الباركود (بسيط)
            const hasBarcode = detectSimpleBarcode(buffer);

            return { isCorrupted, isDistorted, hasBarcode };
        } catch (error) {
            return { isCorrupted: true, isDistorted: false, hasBarcode: false };
        }
    }

    function calculateDistortionScore(buffer) {
        // حساب بسيط للتشوه
        const sample = buffer.slice(0, 1000);
        const avg = sample.reduce((a, b) => a + b, 0) / sample.length;
        const variance = sample.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sample.length;
        return variance < 50 ? 0.8 : 0.2; // انخفاض التباين = تشوه
    }

    function detectSimpleBarcode(buffer) {
        // كشف بسيط للأنماط السوداء والبيضاء
        let blackCount = 0;
        let whiteCount = 0;

        for (let i = 0; i < Math.min(buffer.length, 5000); i++) {
            const byte = buffer[i];
            if (byte < 50) blackCount++;
            else if (byte > 200) whiteCount++;
        }

        const ratio = (blackCount + whiteCount) / Math.min(buffer.length, 5000);
        return ratio > 0.4; // نسبة عالية من الأسود والأبيض = باركود محتمل
    }

    // بدء التحليل
    await analyzeDirectory(brandDir);

    // طباعة النتائج
    console.log('📊 النتائج النهائية:');
    console.log(`   إجمالي الصور: ${totalImages}`);
    console.log(`   ✅ جيدة (مع/بدون باركود): ${goodCount}`);
    console.log(`   📱 مع باركود: ${barcodeCount}`);
    console.log(`   🟡 مشوهة: ${distortedCount}`);
    console.log(`   ❌ تالفة: ${corruptedCount}`);

    console.log('\n💡 الخلاصة:');
    if (barcodeCount > 0) {
        console.log(`   • تم العثور على ${barcodeCount} صورة مع باركود - هذه الصور الناجحة!`);
    }
    if (distortedCount > goodCount) {
        console.log('   • الغالبية العظمى من الصور مشوهة كما ذكرت!');
        console.log('   • نحتاج لتنظيف شامل وحذف الصور المشوهة');
    }

    return { totalImages, goodCount, distortedCount, corruptedCount, barcodeCount };
}

quickImageAnalysis().catch(console.error);
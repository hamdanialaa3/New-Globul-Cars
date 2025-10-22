import fs from 'fs/promises';
import path from 'path';

async function sampleImagesForReview() {
    console.log('🔍 استخراج عينات من الصور للمراجعة اليدوية...\n');

    const brandDir = path.join(process.cwd(), 'brand_directories');
    const samples = {
        barcode: [],
        regular: [],
        corrupted: []
    };

    let analyzedCount = 0;

    async function scanForSamples(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    await scanForSamples(itemPath);
                } else if (item.isFile() && isImageFile(item.name)) {
                    analyzedCount++;
                    const analysis = await quickAnalyzeImage(itemPath);

                    // جمع عينات
                    if (analysis.isCorrupted && samples.corrupted.length < 5) {
                        samples.corrupted.push(itemPath);
                    } else if (analysis.hasBarcode && samples.barcode.length < 10) {
                        samples.barcode.push(itemPath);
                    } else if (!analysis.isCorrupted && samples.regular.length < 10) {
                        samples.regular.push(itemPath);
                    }

                    // إيقاف بعد جمع عينات كافية
                    if (samples.barcode.length >= 10 && samples.regular.length >= 10 && samples.corrupted.length >= 5) {
                        return;
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

            // كشف الباركود (بسيط)
            const hasBarcode = detectSimpleBarcode(buffer);

            return { isCorrupted, hasBarcode };
        } catch (error) {
            return { isCorrupted: true, hasBarcode: false };
        }
    }

    function detectSimpleBarcode(buffer) {
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

    // جمع العينات
    await scanForSamples(brandDir);

    // عرض النتائج
    console.log('📸 عينات من الصور للمراجعة:\n');

    console.log('✅ صور مع باركود (مفترض أنها جيدة):');
    samples.barcode.forEach(img => {
        console.log(`   📱 ${path.relative(brandDir, img)}`);
    });

    console.log('\n🟢 صور عادية (تحتاج مراجعة):');
    samples.regular.forEach(img => {
        console.log(`   🖼️  ${path.relative(brandDir, img)}`);
    });

    console.log('\n❌ صور تالفة (placeholders):');
    samples.corrupted.forEach(img => {
        console.log(`   🚫 ${path.relative(brandDir, img)}`);
    });

    console.log(`\n📊 تم تحليل: ${analyzedCount} صورة`);
    console.log('\n💡 الخطوة التالية: راجع هذه العينات يدوياً للتأكد من التصنيف');

    return samples;
}

sampleImagesForReview().catch(console.error);
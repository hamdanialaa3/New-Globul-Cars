import fs from 'fs/promises';
import path from 'path';

async function testDirectories() {
    console.log('🧪 اختبار قراءة المجلدات...\n');

    try {
        const brandDir = path.join(process.cwd(), 'brand_directories');
        console.log(`📁 البحث في: ${brandDir}`);

        const brands = await fs.readdir(brandDir);
        console.log(`📊 تم العثور على ${brands.length} عنصر`);

        const directories = brands.filter(item => {
            return !item.includes('.');
        });

        console.log(`🏭 عدد العلامات التجارية: ${directories.length}`);

        for (const brand of directories.slice(0, 3)) { // أول 3 فقط للاختبار
            console.log(`🔍 تحليل ${brand}...`);
            const brandPath = path.join(brandDir, brand);

            try {
                const files = await fs.readdir(brandPath);
                const imageFiles = files.filter(file =>
                    file.toLowerCase().endsWith('.jpg') ||
                    file.toLowerCase().endsWith('.jpeg') ||
                    file.toLowerCase().endsWith('.png')
                );
                console.log(`   📸 ${imageFiles.length} صورة`);
            } catch (error) {
                console.log(`   ❌ خطأ: ${error.message}`);
            }
        }

        console.log('\n✅ الاختبار مكتمل');

    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
    }
}

testDirectories();
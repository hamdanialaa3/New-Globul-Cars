import fs from 'fs/promises';
import path from 'path';

async function countImagesRecursively(dirPath) {
    let totalImages = 0;

    async function scanDirectory(currentPath) {
        try {
            const items = await fs.readdir(currentPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(currentPath, item.name);

                if (item.isDirectory()) {
                    await scanDirectory(itemPath);
                } else if (item.isFile() && isImageFile(item.name)) {
                    totalImages++;
                    if (totalImages <= 5) { // عرض أول 5 صور فقط
                        console.log(`📸 ${path.relative(dirPath, itemPath)}`);
                    }
                }
            }
        } catch (error) {
            // تجاهل الأخطاء في المجلدات التي لا يمكن الوصول إليها
        }
    }

    function isImageFile(filename) {
        const ext = filename.toLowerCase();
        return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
    }

    console.log('🔍 بدء البحث عن الصور...');
    await scanDirectory(dirPath);

    console.log(`\n📊 إجمالي الصور الموجودة: ${totalImages}`);
    return totalImages;
}

async function main() {
    const brandDir = path.join(process.cwd(), 'brand_directories');
    console.log(`📁 البحث في: ${brandDir}\n`);

    const totalImages = await countImagesRecursively(brandDir);

    if (totalImages === 0) {
        console.log('❌ لم يتم العثور على أي صور!');
    } else {
        console.log('✅ تم العثور على الصور بنجاح!');
    }
}

main().catch(console.error);
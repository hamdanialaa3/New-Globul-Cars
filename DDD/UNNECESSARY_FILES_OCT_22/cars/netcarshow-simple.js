import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowSimple {
    constructor() {
        this.baseURL = 'https://www.netcarshow.com';
        this.downloadedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }

    // تأخير عشوائي
    async delay(ms = 1500) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    // إنشاء اسم ملف بسيط
    createFilename(modelName, year, imageIndex) {
        const cleanModel = modelName
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20);
        
        return `${cleanModel}_${year}_${String(imageIndex).padStart(2, '0')}.jpg`;
    }

    // تنزيل صورة واحدة
    async downloadImage(imageUrl, filename, outputDir) {
        try {
            // إنشاء المجلد
            await fs.mkdir(outputDir, { recursive: true });
            const filePath = path.join(outputDir, filename);

            // تحقق من وجود الملف
            try {
                await fs.access(filePath);
                console.log(`    ⏭️  موجود: ${filename}`);
                return true;
            } catch {
                // المتابعة
            }

            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': this.baseURL
                }
            });

            const writer = (await import('fs')).createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // فحص الحجم
            const stats = await fs.stat(filePath);
            if (stats.size < 2000) {
                await fs.unlink(filePath);
                throw new Error('ملف صغير جداً');
            }

            this.downloadedCount++;
            console.log(`    ✅ تم: ${filename} (${Math.round(stats.size / 1024)} KB)`);
            return true;

        } catch (error) {
            this.errorCount++;
            console.log(`    ❌ فشل: ${filename} - ${error.message}`);
            return false;
        }
    }

    // تنزيل من رابط موديل مباشر
    async downloadFromDirectUrls() {
        try {
            console.log('🚀 تنزيل صور مباشرة من NetCarShow');
            console.log('='.repeat(40));

            // روابط مباشرة لموديلات مشهورة
            const directModels = [
                {
                    name: 'S-Class',
                    year: '2021',
                    baseUrl: 'https://www.netcarshow.com/Mercedes-Benz-S-Class-2021-'
                },
                {
                    name: 'E-Class',
                    year: '2024',
                    baseUrl: 'https://www.netcarshow.com/Mercedes-Benz-E-Class-2024-'
                },
                {
                    name: 'C-Class',
                    year: '2022',
                    baseUrl: 'https://www.netcarshow.com/Mercedes-Benz-C-Class-2022-'
                },
                {
                    name: 'GLC',
                    year: '2023',
                    baseUrl: 'https://www.netcarshow.com/Mercedes-Benz-GLC-2023-'
                },
                {
                    name: 'AMG-GT',
                    year: '2024',
                    baseUrl: 'https://www.netcarshow.com/Mercedes-Benz-AMG_GT_Coupe-2024-'
                }
            ];

            const outputDir = path.join(__dirname, 'mercedes_direct');

            for (const model of directModels) {
                console.log(`\n🚗 معالجة: ${model.name} ${model.year}`);
                
                let successCount = 0;
                
                // محاولة تنزيل صور بأسماء مختلفة
                const imageTypes = [
                    'Front_Three-Quarter',
                    'Side_Profile', 
                    'Rear_Three-Quarter',
                    'Front',
                    'Rear',
                    'Interior',
                    'Cockpit',
                    'Engine',
                    'Trunk',
                    'Wheel'
                ];

                for (let i = 0; i < imageTypes.length; i++) {
                    const imageUrl = `${model.baseUrl}${imageTypes[i]}.jpg`;
                    const filename = this.createFilename(`${model.name}_${imageTypes[i]}`, model.year, i + 1);
                    
                    const success = await this.downloadImage(imageUrl, filename, outputDir);
                    if (success) successCount++;
                    
                    // تأخير بين التنزيلات
                    await this.delay(800);
                }

                console.log(`  ✅ ${model.name}: تم تنزيل ${successCount}/${imageTypes.length} صور`);
                
                // تأخير بين الموديلات
                await this.delay(2000);
            }

            this.showStats();

        } catch (error) {
            console.error('❌ خطأ عام:', error.message);
        }
    }

    // محاولة البحث عن أنماط صور مختلفة
    async downloadWithPatterns() {
        try {
            console.log('\n🔍 البحث عن أنماط الصور...');
            
            const baseUrl = 'https://www.netcarshow.com/Mercedes-Benz-S-Class-2021-';
            const outputDir = path.join(__dirname, 'mercedes_patterns');
            
            // أنماط مختلفة للبحث
            const patterns = [
                '1280-',
                '800-',
                'wallpaper',
                'hd',
                '1920-',
                '1600-'
            ];

            const suffixes = [
                '.jpg',
                'a1.jpg',
                'b1.jpg',
                'c1.jpg',
                '01.jpg',
                '02.jpg',
                '03.jpg'
            ];

            let downloadCount = 0;

            for (const pattern of patterns) {
                for (const suffix of suffixes) {
                    const imageUrl = baseUrl + pattern + suffix;
                    const filename = `SClass_2021_${pattern}${suffix}`.replace(/[^\w.]/g, '_');
                    
                    try {
                        console.log(`  🔗 محاولة: ${imageUrl}`);
                        const success = await this.downloadImage(imageUrl, filename, outputDir);
                        if (success) downloadCount++;
                        
                    } catch (error) {
                        // تجاهل الأخطاء والمتابعة
                    }
                    
                    await this.delay(500);
                }
            }

            console.log(`✅ تم العثور على ${downloadCount} صورة من الأنماط`);

        } catch (error) {
            console.error('❌ خطأ في البحث:', error.message);
        }
    }

    // تحميل من موقع آخر كبديل
    async downloadFromAlternative() {
        try {
            console.log('\n🌐 البحث في مصادر بديلة...');
            
            // استخدام Lorem Picsum كمصدر آمن للصور
            const outputDir = path.join(__dirname, 'car_images_safe');
            
            const carImageSizes = [
                '1920/1080',
                '1600/900', 
                '1280/720',
                '1024/768'
            ];

            for (let i = 0; i < 20; i++) {
                const size = carImageSizes[i % carImageSizes.length];
                const imageUrl = `https://picsum.photos/${size}?random=${i}`;
                const filename = `Car_Image_${String(i + 1).padStart(2, '0')}.jpg`;
                
                console.log(`  📸 تنزيل صورة ${i + 1}/20...`);
                await this.downloadImage(imageUrl, filename, outputDir);
                await this.delay(300);
            }

        } catch (error) {
            console.error('❌ خطأ في البديل:', error.message);
        }
    }

    // عرض الإحصائيات
    showStats() {
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        console.log('\n' + '='.repeat(40));
        console.log('📊 إحصائيات النهائية:');
        console.log('='.repeat(40));
        console.log(`⏱️  الوقت: ${minutes}m ${seconds}s`);
        console.log(`📸 صور منزلة: ${this.downloadedCount}`);
        console.log(`❌ أخطاء: ${this.errorCount}`);
        console.log('='.repeat(40));
    }

    // تشغيل جميع الطرق
    async runAll() {
        console.log('🚀 NetCarShow Simple Downloader');
        console.log('='.repeat(40));
        
        // الطريقة الأولى: روابط مباشرة
        await this.downloadFromDirectUrls();
        
        // الطريقة الثانية: البحث بالأنماط
        await this.downloadWithPatterns();
        
        // الطريقة الثالثة: مصدر بديل آمن
        await this.downloadFromAlternative();
        
        console.log('\n🎉 انتهى التشغيل!');
        console.log('📁 تحقق من المجلدات:');
        console.log('   - mercedes_direct');
        console.log('   - mercedes_patterns');
        console.log('   - car_images_safe');
    }
}

// تشغيل السكريبت
const scraper = new NetCarShowSimple();
scraper.runAll().catch(console.error);
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowTester {
    constructor() {
        this.baseURL = 'https://www.netcarshow.com';
        this.downloadedCount = 0;
    }

    // اختبار صفحة موديل واحد
    async testSingleModel() {
        try {
            console.log('🧪 اختبار NetCarShow - Mercedes S-Class 2021');
            
            const modelUrl = 'https://www.netcarshow.com/mercedes-benz/2021-s-class/';
            
            console.log('📡 جاري الحصول على صفحة الموديل...');
            const response = await axios.get(modelUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            console.log('✅ تم الحصول على الصفحة بنجاح');
            console.log(`📄 حجم المحتوى: ${response.data.length} حرف`);

            // البحث عن الصور
            const images = [];
            const imagePatterns = [
                /https:\/\/www\.netcarshow\.com\/[^"']+\.jpg/gi
            ];

            for (const pattern of imagePatterns) {
                let match;
                while ((match = pattern.exec(response.data)) !== null) {
                    const imageUrl = match[0];
                    if (!images.includes(imageUrl) && this.isValidCarImage(imageUrl)) {
                        images.push(imageUrl);
                    }
                }
            }

            console.log(`🖼️  تم العثور على ${images.length} صورة محتملة`);
            
            // عرض أول 5 صور
            console.log('\n📸 أول 5 صور:');
            images.slice(0, 5).forEach((img, index) => {
                console.log(`  ${index + 1}. ${img}`);
            });

            // اختبار تنزيل صورة واحدة
            if (images.length > 0) {
                console.log('\n🔽 اختبار تنزيل صورة واحدة...');
                await this.testDownloadImage(images[0]);
            }

            return images;

        } catch (error) {
            console.error('❌ خطأ في الاختبار:', error.message);
            return [];
        }
    }

    // التحقق من صحة الصورة
    isValidCarImage(imageUrl) {
        const excludePatterns = [
            /logo/i, /icon/i, /banner/i, /ad/i,
            /thumb/i, /small/i, /mini/i
        ];

        return !excludePatterns.some(pattern => pattern.test(imageUrl));
    }

    // اختبار تنزيل صورة
    async testDownloadImage(imageUrl) {
        try {
            console.log(`📥 جاري تنزيل: ${imageUrl}`);

            // إنشاء مجلد الاختبار
            const testDir = path.join(__dirname, 'test_downloads');
            await fs.mkdir(testDir, { recursive: true });

            const filename = `test_image_${Date.now()}.jpg`;
            const filePath = path.join(testDir, filename);

            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': this.baseURL
                }
            });

            const writer = (await import('fs')).createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ تم تنزيل الصورة: ${filename}`);
                    resolve();
                });
                writer.on('error', reject);
            });

            // فحص حجم الملف
            const stats = await fs.stat(filePath);
            console.log(`📊 حجم الملف: ${Math.round(stats.size / 1024)} KB`);

            return true;

        } catch (error) {
            console.error('❌ فشل في تنزيل الصورة:', error.message);
            return false;
        }
    }

    // اختبار جمع موديلات Mercedes
    async testBrandModels() {
        try {
            console.log('\n🏭 اختبار جمع موديلات Mercedes-Benz...');
            
            const response = await axios.get(`${this.baseURL}/mercedes-benz/`, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const models = [];
            
            // البحث عن روابط الموديلات
            const modelLinkPattern = /href="\/mercedes-benz\/(\d{4}-[^"]+)"/gi;
            let match;
            
            while ((match = modelLinkPattern.exec(response.data)) !== null) {
                const modelPath = match[1];
                const modelUrl = `${this.baseURL}/mercedes-benz/${modelPath}`;
                
                const modelName = modelPath
                    .replace(/^\d{4}-/, '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());

                models.push({
                    name: modelName,
                    url: modelUrl,
                    path: modelPath
                });
            }

            console.log(`✅ تم العثور على ${models.length} موديل`);
            
            // عرض أول 10 موديلات
            console.log('\n🚗 أول 10 موديلات:');
            models.slice(0, 10).forEach((model, index) => {
                console.log(`  ${index + 1}. ${model.name}`);
            });

            return models;

        } catch (error) {
            console.error('❌ خطأ في جمع الموديلات:', error.message);
            return [];
        }
    }

    // تشغيل جميع الاختبارات
    async runTests() {
        console.log('🧪 بدء اختبارات NetCarShow Scraper');
        console.log('='.repeat(50));

        // اختبار 1: صفحة موديل واحد
        const images = await this.testSingleModel();
        
        // اختبار 2: جمع موديلات العلامة التجارية
        await this.testBrandModels();

        console.log('\n' + '='.repeat(50));
        console.log('✅ انتهت جميع الاختبارات');
        
        if (images.length > 0) {
            console.log('🎉 النتيجة: NetCarShow يعمل بشكل صحيح!');
            console.log('💡 يمكنك الآن تشغيل السكريبت الكامل');
        } else {
            console.log('⚠️  قد تحتاج إلى تعديل طريقة استخراج الصور');
        }
    }
}

// تشغيل الاختبار
const tester = new NetCarShowTester();
tester.runTests().catch(console.error);
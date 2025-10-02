import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 Scraper مخصص لـ Cars.com
class CarsComScraper {
    constructor() {
        this.baseUrl = 'https://www.cars.com';
        this.session = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        });
    }

    // استخراج صور السيارات من صفحة البحث
    async scrapeCarImages(make, model = '', maxImages = 10) {
        console.log(`🚗 البحث عن صور ${make} ${model} على Cars.com...`);

        try {
            // بناء رابط البحث
            const searchUrl = this.buildSearchUrl(make, model);
            console.log(`🔗 الرابط: ${searchUrl}`);

            // جلب الصفحة
            const response = await this.session.get(searchUrl);
            const html = response.data;

            // استخراج روابط الصور
            const imageUrls = this.extractCarImages(html);

            console.log(`📸 تم العثور على ${imageUrls.length} صورة محتملة`);

            if (imageUrls.length === 0) {
                console.log('❌ لم يتم العثور على صور');
                return [];
            }

            // تحميل الصور
            const downloadedImages = await this.downloadImages(imageUrls, make, maxImages);

            console.log(`✅ تم تحميل ${downloadedImages.length} صورة بنجاح`);

            return downloadedImages;

        } catch (error) {
            console.error(`❌ خطأ في البحث: ${error.message}`);
            return [];
        }
    }

    // بناء رابط البحث
    buildSearchUrl(make, model) {
        const makeParam = make.toLowerCase().replace(/\s+/g, '-');
        const modelParam = model ? `-${model.toLowerCase().replace(/\s+/g, '-')}` : '';

        return `${this.baseUrl}/shopping/results/?makes[]=${makeParam}${modelParam}&maximum_distance=100&zip=10001`;
    }

    // استخراج روابط صور السيارات
    extractCarImages(html) {
        const imageUrls = [];

        // أنماط مختلفة لاستخراج الصور
        const patterns = [
            // صور السيارات في قائمة النتائج
            /data-src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
            // صور من lazy loading
            /src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
            // صور من data attributes
            /data-lazy-src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const url = match[1];

                // فلترة للتأكد من أنها صور سيارات
                if (this.isCarImage(url)) {
                    // تحويل الروابط النسبية إلى مطلقة
                    const absoluteUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
                    imageUrls.push(absoluteUrl);
                }
            }
        });

        // إزالة التكرارات
        return [...new Set(imageUrls)];
    }

    // فحص ما إذا كانت الصورة لسيارة
    isCarImage(url) {
        // استبعاد الصور غير المرغوبة
        const excludePatterns = [
            /logo/i,
            /icon/i,
            /button/i,
            /banner/i,
            /avatar/i,
            /thumbnail/i,
            /sprite/i,
            /pixel/i,
            /tracking/i
        ];

        // التحقق من الأنماط المستبعدة
        for (const pattern of excludePatterns) {
            if (pattern.test(url)) {
                return false;
            }
        }

        // التحقق من أنها تحتوي على كلمات متعلقة بالسيارات
        const carKeywords = [
            /car/i,
            /auto/i,
            /vehicle/i,
            /sedan/i,
            /suv/i,
            /truck/i,
            /coupe/i,
            /convertible/i
        ];

        // قبول الصورة إذا كانت تحتوي على امتداد صورة صحيح
        return /\.(jpg|jpeg|png|webp)$/i.test(url);
    }

    // تحميل الصور
    async downloadImages(imageUrls, make, maxImages) {
        const downloaded = [];
        const outputDir = path.join(__dirname, 'brand_directories', make);

        // إنشاء المجلد إذا لم يكن موجوداً
        await fs.mkdir(outputDir, { recursive: true });

        for (let i = 0; i < Math.min(imageUrls.length, maxImages); i++) {
            const url = imageUrls[i];

            try {
                console.log(`📥 تحميل ${i + 1}/${Math.min(imageUrls.length, maxImages)}: ${path.basename(url)}`);

                const response = await this.session.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 15000
                });

                const buffer = Buffer.from(response.data);

                // فحص جودة الصورة
                if (this.isGoodQuality(buffer)) {
                    const filename = `${make}_${Date.now()}_${i + 1}.jpg`;
                    const outputPath = path.join(outputDir, filename);

                    await fs.writeFile(outputPath, buffer);
                    downloaded.push(outputPath);

                    console.log(`✅ تم الحفظ: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
                } else {
                    console.log(`⚠️  تم رفض الصورة: جودة منخفضة`);
                }

            } catch (error) {
                console.log(`❌ فشل في تحميل الصورة: ${error.message}`);
            }

            // انتظار بين التحميلات
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        return downloaded;
    }

    // فحص جودة الصورة
    isGoodQuality(buffer) {
        const size = buffer.length;

        // شروط الجودة الأساسية
        if (size < 20000) return false; // أصغر من 20KB
        if (size > 5000000) return false; // أكبر من 5MB

        // فحص الإنتروبيا (للكشف عن الصور المشوهة)
        const entropy = this.calculateEntropy(buffer);
        if (entropy < 0.2) return false; // إنتروبيا منخفضة جداً

        return true;
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

        return entropy / 8;
    }

    // اختبار سريع للموقع
    async quickTest() {
        console.log('🧪 اختبار سريع لـ Cars.com...\n');

        try {
            const testResults = await this.scrapeCarImages('Honda', 'Civic', 3);

            console.log('\n📊 نتائج الاختبار:');
            console.log(`   الصور المحملة: ${testResults.length}`);

            if (testResults.length > 0) {
                console.log('✅ نجح الاختبار! الموقع مناسب للتحميل');
                console.log('\n🎯 التوصية: يمكن البدء في التحميل الكامل');
            } else {
                console.log('⚠️  لم يتم تحميل أي صور - قد يحتاج تعديل');
            }

        } catch (error) {
            console.log(`❌ فشل الاختبار: ${error.message}`);
        }
    }
}

// استخدام الأداة
async function main() {
    const scraper = new CarsComScraper();

    const command = process.argv[2];
    const make = process.argv[3] || 'Honda';
    const model = process.argv[4] || '';
    const maxImages = parseInt(process.argv[5]) || 5;

    if (command === 'test') {
        await scraper.quickTest();
    } else {
        // تحميل صور
        const results = await scraper.scrapeCarImages(make, model, maxImages);
        console.log(`\n✅ تم تحميل ${results.length} صورة`);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default CarsComScraper;
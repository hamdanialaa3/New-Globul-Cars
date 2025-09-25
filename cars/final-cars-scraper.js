import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚡ Scraper سريع ومستمر لـ Cars.com - النسخة النهائية
class FinalCarsComScraper {
    constructor() {
        this.baseUrl = 'https://www.cars.com';
        this.session = axios.create({
            timeout: 45000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'max-age=0',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1'
            },
            // إضافة إعدادات إضافية لتجنب الكشف
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        this.brands = [
            'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
            'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
            'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche',
            'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
        ];
    }

    // استخراج الصور من HTML (مبني على التحليل الناجح)
    extractImages(html) {
        const images = [];

        // النمط الرئيسي الناجح: src="..."
        const srcPattern = /src="([^"]*\.jpg[^"]*)"/gi;
        let match;

        while ((match = srcPattern.exec(html)) !== null) {
            const url = match[1];

            // فلترة للتأكد من أنها صور سيارات
            if (this.isValidCarImage(url)) {
                // التأكد من أن الرابط كامل
                const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
                images.push(fullUrl);
            }
        }

        // إزالة التكرارات والفلترة النهائية
        return [...new Set(images)].filter(url =>
            url.includes('cstatic-images.com') || // صور Cars.com الرئيسية
            url.includes('cars.com') ||
            (url.includes('.jpg') && url.length > 40)
        );
    }

    // فحص صحة رابط الصورة
    isValidCarImage(url) {
        // استبعاد الصور غير المرغوبة
        const excludePatterns = [
            /logo/i, /icon/i, /badge/i, /sprite/i, /pixel/i,
            /button/i, /arrow/i, /placeholder/i, /thumb/i,
            /avatar/i, /profile/i, /banner/i, /ad/i
        ];

        for (const pattern of excludePatterns) {
            if (pattern.test(url)) return false;
        }

        // يجب أن يكون JPG وطول مناسب
        return url.includes('.jpg') && url.length > 30;
    }

    // تحميل صورة واحدة مع فحص الجودة
    async downloadImage(url, outputPath) {
        try {
            const response = await this.session.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'identity' // عدم ضغط الصورة
                }
            });

            const buffer = Buffer.from(response.data);
            const sizeKB = (buffer.length / 1024).toFixed(1);

            // فحص الجودة
            if (!this.isGoodQuality(buffer)) {
                return false;
            }

            await fs.writeFile(outputPath, buffer);
            return { success: true, size: sizeKB };

        } catch (error) {
            return false;
        }
    }

    // فحص جودة الصورة
    isGoodQuality(buffer) {
        const size = buffer.length;

        // حجم مناسب (أقل صرامة)
        if (size < 10000) return false; // أصغر من 10KB بدلاً من 20KB
        if (size > 10000000) return false; // أكبر من 10MB بدلاً من 8MB

        // ليس صورة تالفة معروفة
        const badSizes = [6428, 204125, 199300, 6429, 204126];
        if (badSizes.includes(size)) return false;

        // إنتروبيا مناسبة (أقل صرامة)
        const entropy = this.calculateEntropy(buffer);
        if (entropy < 0.05) return false; // أقل من 0.15 إلى 0.05

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

    // جمع الصور من صفحة واحدة
    async scrapePage(brand, page = 1) {
        const searchUrl = `https://www.cars.com/shopping/results/?makes[]=${brand.toLowerCase().replace(/\s+/g, '-')}&page=${page}&maximum_distance=100&zip=10001`;

        try {
            const response = await this.session.get(searchUrl);
            const images = this.extractImages(response.data);
            return images;
        } catch (error) {
            console.log(`❌ خطأ في صفحة ${page}: ${error.message}`);
            return [];
        }
    }

    // تحميل صور علامة تجارية كاملة
    async downloadBrand(brand, maxImages = 100, maxPages = 5) {
        console.log(`\n🚗 بدء تحميل ${brand} من Cars.com...`);

        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        let allImages = [];
        let downloaded = 0;

        // جمع الصور من عدة صفحات
        for (let page = 1; page <= maxPages; page++) {
            console.log(`📄 جمع الصور من الصفحة ${page}...`);
            const pageImages = await this.scrapePage(brand, page);
            allImages.push(...pageImages);

            if (pageImages.length === 0) {
                console.log(`⚠️ توقفت في الصفحة ${page} (لا صور)`);
                break;
            }

            // انتظار بين الصفحات
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // إزالة التكرارات
        allImages = [...new Set(allImages)];
        console.log(`📊 تم جمع ${allImages.length} صورة فريدة`);

        // تحميل الصور
        console.log(`\n⚡ بدء التحميل (${Math.min(allImages.length, maxImages)} صورة)...`);

        for (let i = 0; i < Math.min(allImages.length, maxImages); i++) {
            const url = allImages[i];
            const filename = `${brand}_${String(i + 1).padStart(3, '0')}.jpg`;
            const outputPath = path.join(brandDir, filename);

            process.stdout.write(`📥 ${i + 1}/${Math.min(allImages.length, maxImages)} `);

            const result = await this.downloadImage(url, outputPath);

            if (result && result.success) {
                downloaded++;
                console.log(`✅ ${filename} (${result.size}KB)`);
            } else {
                console.log(`❌ فشل`);
            }

            // انتظار قصير بين التحميلات
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        console.log(`\n🎉 تم تحميل ${downloaded} صورة لـ ${brand}`);
        return { brand, collected: allImages.length, downloaded };
    }

    // التحميل الكامل والمستمر
    async runFullScrape(maxImagesPerBrand = 50) {
        console.log('🚀 بدء التحميل الكامل والمستمر من Cars.com');
        console.log('=' .repeat(70));
        console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
        console.log(`🎯 الهدف: ${maxImagesPerBrand} صورة لكل علامة تجارية`);
        console.log('='.repeat(70));

        const results = [];
        let totalDownloaded = 0;
        let totalCollected = 0;

        for (let i = 0; i < this.brands.length; i++) {
            const brand = this.brands[i];

            try {
                console.log(`\n🏭 [${i + 1}/${this.brands.length}] معالجة ${brand}...`);

                const result = await this.downloadBrand(brand, maxImagesPerBrand, 3);
                results.push(result);

                totalDownloaded += result.downloaded;
                totalCollected += result.collected;

                console.log(`📊 ${brand}: ${result.downloaded}/${result.collected} صورة`);

                // انتظار بين العلامات التجارية
                if (i < this.brands.length - 1) {
                    console.log('⏳ انتظار 5 ثوانٍ...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }

            } catch (error) {
                console.log(`❌ فشل في ${brand}: ${error.message}`);
                results.push({ brand, collected: 0, downloaded: 0 });
            }
        }

        // التقرير النهائي
        console.log('\n' + '='.repeat(70));
        console.log('🎊 التقرير النهائي - التحميل الكامل مكتمل!');
        console.log('='.repeat(70));
        console.log(`📊 إجمالي الصور المجمعة: ${totalCollected}`);
        console.log(`✅ إجمالي الصور المحملة: ${totalDownloaded}`);
        console.log(`🏭 العلامات التجارية المعالجة: ${results.length}`);
        console.log(`📈 معدل النجاح: ${((totalDownloaded / totalCollected) * 100).toFixed(1)}%`);
        console.log('='.repeat(70));

        // تفصيل النتائج
        console.log('\n📋 تفصيل النتائج:');
        results.forEach(result => {
            const status = result.downloaded > 0 ? '✅' : '❌';
            console.log(`   ${status} ${result.brand}: ${result.downloaded} صورة`);
        });

        console.log('\n🎯 المهمة مكتملة! الصور الجديدة في مجلد brand_directories');

        return {
            totalCollected,
            totalDownloaded,
            results,
            successRate: (totalDownloaded / totalCollected) * 100
        };
    }
}

// تشغيل التحميل
async function main() {
    const scraper = new FinalCarsComScraper();

    const command = process.argv[2];

    if (command === 'full') {
        // التحميل الكامل
        const maxImages = parseInt(process.argv[3]) || 50;
        console.log(`🎯 سيتم تحميل ${maxImages} صورة كحد أقصى لكل علامة تجارية`);
        await scraper.runFullScrape(maxImages);

    } else if (command === 'brand') {
        // تحميل علامة تجارية محددة
        const brand = process.argv[3] || 'Honda';
        const maxImages = parseInt(process.argv[4]) || 20;
        await scraper.downloadBrand(brand, maxImages);

    } else {
        // اختبار سريع
        console.log('🧪 اختبار سريع للهوندا...');
        const result = await scraper.downloadBrand('Honda', 5, 1);
        console.log(`\n📊 نتيجة الاختبار: ${result.downloaded} صورة`);

        if (result.downloaded > 0) {
            console.log('\n🚀 التحميل الكامل جاهز!');
            console.log('💡 للتحميل الكامل: node final-cars-scraper.js full');
            console.log('💡 لتحميل علامة محددة: node final-cars-scraper.js brand Toyota 30');
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default FinalCarsComScraper;
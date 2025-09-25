import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Scraper سريع ومستمر لـ Cars.com
class FastCarsComScraper {
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
                'Referer': 'https://www.cars.com/'
            }
        });

        this.brands = [
            'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
            'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
            'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche',
            'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
        ];
    }

    // تحليل HTML لاستخراج الصور
    async analyzeHtml(html) {
        const images = [];

        // أنماط مختلفة لاستخراج الصور من Cars.com
        const patterns = [
            // صور السيارات في البطاقات
            /data-src="([^"]*\.jpg[^"]*)"/gi,
            /data-lazy-src="([^"]*\.jpg[^"]*)"/gi,
            /src="([^"]*\.jpg[^"]*)"/gi,
            // صور من JSON data
            /"photo_url":"([^"]*\.jpg[^"]*)"/gi,
            /"image_url":"([^"]*\.jpg[^"]*)"/gi,
            // صور من srcset
            /srcset="[^"]*([^"\s]+\.jpg[^"\s]*)/gi
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const url = match[1];
                if (this.isValidCarImage(url)) {
                    const fullUrl = url.startsWith('http') ? url : `https://www.cars.com${url}`;
                    images.push(fullUrl);
                }
            }
        });

        // إزالة التكرارات والفلترة
        return [...new Set(images)].filter(url =>
            !url.includes('logo') &&
            !url.includes('icon') &&
            !url.includes('badge') &&
            !url.includes('placeholder') &&
            url.length > 20
        );
    }

    // فحص صحة رابط الصورة
    isValidCarImage(url) {
        return url.includes('.jpg') &&
               !url.includes('logo') &&
               !url.includes('icon') &&
               !url.includes('sprite') &&
               !url.includes('pixel') &&
               url.length > 30;
    }

    // تحميل صورة واحدة مع فحص الجودة
    async downloadImage(url, outputPath) {
        try {
            const response = await this.session.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'identity'
                }
            });

            const buffer = Buffer.from(response.data);

            // فحص الجودة الأساسي
            if (buffer.length < 15000) return false; // صغيرة جداً
            if (buffer.length > 8000000) return false; // كبيرة جداً

            // فحص عدم التشوه
            if (this.isCorruptedImage(buffer)) return false;

            await fs.writeFile(outputPath, buffer);
            return true;

        } catch (error) {
            return false;
        }
    }

    // كشف الصور التالفة
    isCorruptedImage(buffer) {
        // فحص الأحجام المعروفة للصور التالفة
        const badSizes = [6428, 204125, 199300, 6429, 204126];
        if (badSizes.includes(buffer.length)) return true;

        // فحص الإنتروبيا المنخفضة
        const entropy = this.calculateEntropy(buffer);
        if (entropy < 0.1) return true;

        return false;
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

    // جمع جميع الصور من علامة تجارية
    async scrapeBrandImages(brand, maxPages = 5) {
        console.log(`🚗 جمع صور ${brand} من Cars.com...`);

        const allImages = [];
        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        for (let page = 1; page <= maxPages; page++) {
            try {
                const searchUrl = `https://www.cars.com/shopping/results/?makes[]=${brand.toLowerCase().replace(/\s+/g, '-')}&page=${page}&maximum_distance=100&zip=10001`;

                console.log(`📄 صفحة ${page}: ${searchUrl}`);

                const response = await this.session.get(searchUrl);
                const images = await this.analyzeHtml(response.data);

                console.log(`   📸 تم العثور على ${images.length} صورة`);

                allImages.push(...images);

                // انتظار بين الصفحات
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.log(`   ❌ خطأ في الصفحة ${page}: ${error.message}`);
                break;
            }
        }

        // إزالة التكرارات
        const uniqueImages = [...new Set(allImages)];
        console.log(`\n📊 إجمالي الصور المجمعة: ${uniqueImages.length}`);

        return { brand, images: uniqueImages, directory: brandDir };
    }

    // تحميل الصور بسرعة
    async downloadBrandImages(brandData, maxImages = 100) {
        const { brand, images, directory } = brandData;
        let downloaded = 0;

        console.log(`\n⚡ بدء تحميل صور ${brand} (${Math.min(images.length, maxImages)} صورة)...`);

        for (let i = 0; i < Math.min(images.length, maxImages); i++) {
            const url = images[i];
            const filename = `${brand}_${Date.now()}_${i + 1}.jpg`;
            const outputPath = path.join(directory, filename);

            process.stdout.write(`📥 ${i + 1}/${Math.min(images.length, maxImages)} `);

            const success = await this.downloadImage(url, outputPath);

            if (success) {
                downloaded++;
                console.log(`✅ ${filename}`);
            } else {
                console.log(`❌ فشل`);
            }

            // انتظار قصير بين التحميلات
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\n🎉 تم تحميل ${downloaded} صورة لـ ${brand}`);
        return downloaded;
    }

    // تشغيل التحميل الكامل
    async runFullScrape(maxImagesPerBrand = 50) {
        console.log('🚀 بدء التحميل الكامل من Cars.com\n');
        console.log('=' .repeat(60));

        const results = [];
        let totalDownloaded = 0;

        for (const brand of this.brands) {
            try {
                console.log(`\n🏭 معالجة ${brand}...`);

                // جمع الصور
                const brandData = await this.scrapeBrandImages(brand, 3);

                if (brandData.images.length > 0) {
                    // تحميل الصور
                    const downloaded = await this.downloadBrandImages(brandData, maxImagesPerBrand);
                    totalDownloaded += downloaded;

                    results.push({
                        brand,
                        collected: brandData.images.length,
                        downloaded
                    });
                }

                // انتظار بين العلامات التجارية
                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error) {
                console.log(`❌ خطأ في ${brand}: ${error.message}`);
            }
        }

        // تقرير نهائي
        console.log('\n' + '='.repeat(60));
        console.log('📊 التقرير النهائي:');
        console.log(`   إجمالي الصور المحملة: ${totalDownloaded}`);
        console.log(`   العلامات التجارية المعالجة: ${results.length}`);
        console.log('='.repeat(60));

        results.forEach(result => {
            console.log(`   ${result.brand}: ${result.downloaded} صورة`);
        });

        return results;
    }
}

// تشغيل التحميل
async function main() {
    const scraper = new FastCarsComScraper();

    const command = process.argv[2];

    if (command === 'full') {
        // تحميل كامل
        await scraper.runFullScrape();
    } else if (command === 'brand') {
        // تحميل علامة تجارية محددة
        const brand = process.argv[3] || 'Honda';
        const maxImages = parseInt(process.argv[4]) || 20;

        const brandData = await scraper.scrapeBrandImages(brand, 2);
        await scraper.downloadBrandImages(brandData, maxImages);
    } else {
        // اختبار سريع
        console.log('🧪 اختبار سريع...');
        const brandData = await scraper.scrapeBrandImages('Honda', 1);
        console.log(`📊 تم العثور على ${brandData.images.length} صورة للهوندا`);

        if (brandData.images.length > 0) {
            console.log('🎯 جاهز للتحميل الكامل!');
            console.log('\n💡 للتحميل الكامل استخدم: node fast-cars-scraper.js full');
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default FastCarsComScraper;
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 سكريبت تحميل شامل لجميع العلامات التجارية
class ComprehensiveScraper {
    constructor() {
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
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        // قائمة شاملة بالعلامات التجارية
        this.brands = [
            'Acura', 'Alfa_Romeo', 'Aston_Martin', 'Audi', 'Bentley', 'BMW', 'Buick',
            'Cadillac', 'Chevrolet', 'Chrysler', 'Citroen', 'Dodge', 'Ferrari',
            'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
            'Jeep', 'Kia', 'Lamborghini', 'Land_Rover', 'Lexus', 'Lincoln',
            'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini',
            'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Rolls-Royce', 'Subaru',
            'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
        ];
    }

    // استخراج الصور من HTML
    extractImages(html) {
        const images = [];
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = imgRegex.exec(html)) !== null) {
            const src = match[1];

            // تنظيف الـ URL
            let url = src;
            if (url.startsWith('//')) url = 'https:' + url;
            if (url.startsWith('/')) url = 'https://www.cars.com' + url;

            // فلترة الصور المناسبة
            if (this.isValidCarImage(url)) {
                images.push(url);
            }
        }

        return [...new Set(images)]; // إزالة التكرارات
    }

    // فحص إذا كانت الصورة صالحة
    isValidCarImage(url) {
        // استبعاد الصور غير المرغوبة
        const excludePatterns = [
            /logo/i, /icon/i, /button/i, /arrow/i, /placeholder/i,
            /thumb/i, /avatar/i, /profile/i, /banner/i, /ad/i
        ];

        for (const pattern of excludePatterns) {
            if (pattern.test(url)) return false;
        }

        return url.includes('.jpg') && url.length > 30;
    }

    // تحميل صورة واحدة
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

        if (size < 10000) return false; // أصغر من 10KB
        if (size > 10000000) return false; // أكبر من 10MB

        const badSizes = [6428, 204125, 199300, 6429, 204126];
        if (badSizes.includes(size)) return false;

        const entropy = this.calculateEntropy(buffer);
        if (entropy < 0.05) return false;

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

    // جمع الصور من صفحة
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

    // تحميل علامة تجارية كاملة
    async downloadBrand(brand, maxImages = 50, maxPages = 3) {
        console.log(`\n🚗 بدء تحميل ${brand} من Cars.com...`);

        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        let allImages = [];

        // جمع الصور من عدة صفحات
        for (let page = 1; page <= maxPages; page++) {
            console.log(`📄 جمع الصور من الصفحة ${page}...`);
            const pageImages = await this.scrapePage(brand, page);
            allImages.push(...pageImages);

            if (pageImages.length === 0) break;

            // انتظار بين الصفحات
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // إزالة التكرارات
        allImages = [...new Set(allImages)];
        console.log(`📊 تم جمع ${allImages.length} صورة فريدة`);

        // عد الصور الموجودة بالفعل
        let existingCount = 0;
        for (let i = 1; i <= 999; i++) {
            const filename = `${brand}_${String(i).padStart(3, '0')}.jpg`;
            const filePath = path.join(brandDir, filename);
            try {
                await fs.access(filePath);
                existingCount++;
            } catch {
                break;
            }
        }

        const imagesToDownload = Math.min(allImages.length, maxImages) - existingCount;
        if (imagesToDownload <= 0) {
            console.log(`✅ ${brand} مكتمل (${existingCount} صورة موجودة)`);
            return { brand, collected: allImages.length, downloaded: 0, existing: existingCount };
        }

        // تحميل الصور الجديدة
        console.log(`\n⚡ بدء التحميل (${imagesToDownload} صورة جديدة)...`);

        let downloaded = 0;
        for (let i = existingCount; i < Math.min(allImages.length, maxImages); i++) {
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

        console.log(`\n🎉 تم تحميل ${downloaded} صورة إضافية لـ ${brand}`);
        return { brand, collected: allImages.length, downloaded, existing: existingCount };
    }

    // التحميل الشامل
    async runComprehensiveScrape(maxImagesPerBrand = 50) {
        console.log('🚀 بدء التحميل الشامل والمستمر من Cars.com');
        console.log('=' .repeat(70));
        console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
        console.log(`🎯 الهدف: ${maxImagesPerBrand} صورة لكل علامة تجارية`);
        console.log('='.repeat(70));

        const results = [];
        let totalDownloaded = 0;
        let totalCollected = 0;
        let totalExisting = 0;

        for (let i = 0; i < this.brands.length; i++) {
            const brand = this.brands[i];

            try {
                console.log(`\n🏭 [${i + 1}/${this.brands.length}] معالجة ${brand}...`);

                const result = await this.downloadBrand(brand, maxImagesPerBrand, 3);
                results.push(result);

                totalDownloaded += result.downloaded;
                totalCollected += result.collected;
                totalExisting += (result.existing || 0);

                console.log(`📊 ${brand}: ${result.downloaded} جديدة, ${result.existing || 0} موجودة (${result.collected} متاحة)`);

                // انتظار بين العلامات التجارية
                if (i < this.brands.length - 1) {
                    console.log('⏳ انتظار 3 ثوانٍ...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.log(`❌ خطأ في ${brand}: ${error.message}`);
                results.push({ brand, error: error.message });
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎉 التحميل الشامل مكتمل!');
        console.log(`📊 إجمالي الصور المتاحة: ${totalCollected}`);
        console.log(`📊 الصور المحملة الجديدة: ${totalDownloaded}`);
        console.log(`📊 الصور الموجودة مسبقاً: ${totalExisting}`);
        console.log(`📊 إجمالي الصور في المجموعة: ${totalDownloaded + totalExisting}`);
        console.log('='.repeat(70));

        return {
            totalCollected,
            totalDownloaded,
            totalExisting,
            results,
            successRate: totalDownloaded > 0 ? ((totalDownloaded + totalExisting) / totalCollected) * 100 : 0
        };
    }
}

// تشغيل التحميل الشامل
async function main() {
    const scraper = new ComprehensiveScraper();

    const command = process.argv[2];
    const maxImages = parseInt(process.argv[3]) || 50;

    if (command === 'comprehensive') {
        await scraper.runComprehensiveScrape(maxImages);
    } else if (command === 'brand') {
        const brand = process.argv[3] || 'Honda';
        const result = await scraper.downloadBrand(brand, maxImages);
        console.log('Result:', result);
    } else {
        console.log('🧪 اختبار سريع...');
        const result = await scraper.downloadBrand('Honda', 5, 1);
        console.log(`\n📊 نتيجة الاختبار: ${result.downloaded} صورة`);

        if (result.downloaded > 0) {
            console.log('\n🚀 التحميل الشامل جاهز!');
            console.log('💡 للتحميل الشامل: node comprehensive-scraper.js comprehensive 50');
            console.log('💡 لتحميل علامة محددة: node comprehensive-scraper.js brand Toyota 30');
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ComprehensiveScraper;
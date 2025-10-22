import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowScraper {
    constructor() {
        this.downloadedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }

    // تنزيل صورة
    async downloadImage(imageUrl, filename, outputDir, retries = 3) {
        try {
            await fs.mkdir(outputDir, { recursive: true });
            const filePath = path.join(outputDir, filename);

            // تحقق من وجود الملف
            try {
                await fs.access(filePath);
                console.log(`    ⏭️  ${filename} موجود بالفعل`);
                return true;
            } catch {}

            console.log(`    📥 تنزيل: ${filename}...`);

            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            });

            const writer = response.data.pipe(require('fs').createWriteStream(filePath));

            return new Promise((resolve, reject) => {
                writer.on('finish', async () => {
                    const stats = await fs.stat(filePath);
                    this.downloadedCount++;
                    console.log(`    ✅ تم: ${filename} (${Math.round(stats.size / 1024)} KB)`);
                    resolve(true);
                });
                writer.on('error', reject);
            });

        } catch (error) {
            if (retries > 0) {
                console.log(`    🔄 إعادة المحاولة: ${filename}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.downloadImage(imageUrl, filename, outputDir, retries - 1);
            }

            this.errorCount++;
            console.log(`    ❌ فشل: ${filename} - ${error.message}`);
            return false;
        }
    }

    // استخراج روابط الصور من صفحة NetCarShow
    async extractImageUrlsFromPage(brandUrl) {
        try {
            console.log(`🔍 استخراج الصور من: ${brandUrl}`);

            const response = await axios.get(brandUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            });

            const html = response.data;
            const imageUrls = [];

            // استخراج روابط الصور من HTML
            const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let match;

            while ((match = imgRegex.exec(html)) !== null) {
                let imgSrc = match[1];

                // تحويل الروابط النسبية إلى مطلقة
                if (imgSrc.startsWith('//')) {
                    imgSrc = 'https:' + imgSrc;
                } else if (imgSrc.startsWith('/')) {
                    imgSrc = 'https://www.netcarshow.com' + imgSrc;
                }

                // تصفية الصور السيارات فقط
                if (imgSrc.includes('netcarshow.com') &&
                    (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg') || imgSrc.includes('.png')) &&
                    !imgSrc.includes('logo') &&
                    !imgSrc.includes('banner') &&
                    !imgSrc.includes('icon') &&
                    imgSrc.length > 50) { // الصور الحقيقية لها روابط طويلة

                    imageUrls.push(imgSrc);
                }
            }

            // استخراج روابط الصور من data-src أو lazy loading
            const dataSrcRegex = /data-src=["']([^"']+)["']/gi;
            while ((match = dataSrcRegex.exec(html)) !== null) {
                let imgSrc = match[1];
                if (imgSrc.startsWith('//')) {
                    imgSrc = 'https:' + imgSrc;
                } else if (imgSrc.startsWith('/')) {
                    imgSrc = 'https://www.netcarshow.com' + imgSrc;
                }

                if (imgSrc.includes('netcarshow.com') &&
                    (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg') || imgSrc.includes('.png')) &&
                    !imageUrls.includes(imgSrc)) {
                    imageUrls.push(imgSrc);
                }
            }

            console.log(`📸 تم العثور على ${imageUrls.length} صورة في الصفحة`);
            return imageUrls;

        } catch (error) {
            console.log(`❌ فشل في استخراج الصور من ${brandUrl}: ${error.message}`);
            return [];
        }
    }

    // إنشاء اسم ملف ذكي للسيارة
    createCarFilename(brand, model, year, imageIndex, angle = '') {
        const components = [
            brand.replace(/\s+/g, '_'),
            model.replace(/\s+/g, '_'),
            year,
            angle || 'View',
            String(imageIndex).padStart(2, '0')
        ];

        return components.join('_') + '.jpg';
    }

    // استخراج معلومات السيارة من URL
    extractCarInfo(url) {
        // مثال: https://www.netcarshow.com/Mercedes-Benz-S-Class-2021-hd/
        const match = url.match(/\/([^\/]+)-([^\/]+)-(\d{4})/);
        if (match) {
            return {
                brand: match[1].replace(/-/g, ' '),
                model: match[2].replace(/-/g, ' '),
                year: match[3]
            };
        }
        return null;
    }

    // السكريبت الرئيسي
    async run() {
        console.log('🚗 NetCarShow Real Car Images Scraper');
        console.log('=====================================');
        console.log('🎯 الهدف: استخراج صور السيارات الحقيقية من NetCarShow فقط');
        console.log('=====================================\n');

        const outputDir = path.join(__dirname, 'real_netcarshow_cars');

        // قائمة العلامات التجارية الرئيسية
        const brands = [
            'mercedes-benz',
            'bmw',
            'audi',
            'porsche',
            'ferrari',
            'lamborghini',
            'rolls-royce',
            'bentley'
        ];

        for (const brand of brands) {
            console.log(`\n🏎️  معالجة العلامة: ${brand.toUpperCase()}`);

            try {
                const brandUrl = `https://www.netcarshow.com/${brand}/`;
                const imageUrls = await this.extractImageUrlsFromPage(brandUrl);

                if (imageUrls.length === 0) {
                    console.log(`⚠️  لم يتم العثور على صور للعلامة ${brand}`);
                    continue;
                }

                // تنزيل أول 5 صور من كل علامة
                for (let i = 0; i < Math.min(5, imageUrls.length); i++) {
                    const imageUrl = imageUrls[i];
                    const carInfo = this.extractCarInfo(imageUrl);

                    let filename;
                    if (carInfo) {
                        filename = this.createCarFilename(
                            carInfo.brand,
                            carInfo.model,
                            carInfo.year,
                            i + 1
                        );
                    } else {
                        filename = `${brand}_${i + 1}.jpg`;
                    }

                    await this.downloadImage(imageUrl, filename, outputDir);
                    await new Promise(resolve => setTimeout(resolve, 1500)); // انتظار أطول
                }

            } catch (error) {
                console.log(`❌ خطأ في معالجة ${brand}: ${error.message}`);
            }
        }

        // محاولة استخراج من صفحات محددة للسيارات
        console.log('\n🎯 محاولة استخراج من صفحات سيارات محددة...');

        const specificCarPages = [
            'https://www.netcarshow.com/mercedes-benz/s-class/2021/',
            'https://www.netcarshow.com/bmw/7-series/2023/',
            'https://www.netcarshow.com/audi/a8/2022/',
            'https://www.netcarshow.com/porsche/911/2024/'
        ];

        for (const carPage of specificCarPages) {
            try {
                console.log(`🔍 معالجة: ${carPage}`);
                const imageUrls = await this.extractImageUrlsFromPage(carPage);

                if (imageUrls.length > 0) {
                    const carInfo = this.extractCarInfo(carPage);

                    for (let i = 0; i < Math.min(3, imageUrls.length); i++) {
                        const imageUrl = imageUrls[i];
                        let filename;

                        if (carInfo) {
                            filename = this.createCarFilename(
                                carInfo.brand,
                                carInfo.model,
                                carInfo.year,
                                i + 1,
                                ['Front', 'Side', 'Rear'][i] || 'View'
                            );
                        } else {
                            filename = `Specific_${i + 1}.jpg`;
                        }

                        await this.downloadImage(imageUrl, filename, outputDir);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }

            } catch (error) {
                console.log(`❌ فشل في ${carPage}: ${error.message}`);
            }
        }

        // إحصائيات نهائية
        const duration = (Date.now() - this.startTime) / 1000;
        console.log('\n=====================================');
        console.log('📊 إحصائيات نهائية - NetCarShow Scraper');
        console.log('=====================================');
        console.log(`⏰ إجمالي الوقت: ${Math.round(duration)} ثانية`);
        console.log(`📸 إجمالي الصور المنزلة: ${this.downloadedCount}`);
        console.log(`❌ إجمالي الأخطاء: ${this.errorCount}`);
        console.log(`💯 معدل النجاح: ${this.downloadedCount > 0 ? Math.round((this.downloadedCount / (this.downloadedCount + this.errorCount)) * 100) : 0}%`);
        console.log(`⚡ متوسط التنزيل: ${Math.round(this.downloadedCount / duration * 60)} صورة/دقيقة`);
        console.log('=====================================');
        console.log(`📁 المجلد: ${outputDir}`);
        console.log('=====================================');

        if (this.downloadedCount === 0) {
            console.log('\n⚠️  تحذير: لم يتم تنزيل أي صور!');
            console.log('🔍 قد يكون الموقع محمي من الكشط أو تغير هيكله');
            console.log('💡 اقتراح: جرب استخدام VPN أو انتظار قليل');
        } else {
            console.log('\n🎉 تم بنجاح! تحقق من مجلد real_netcarshow_cars');
        }
    }
}

// تشغيل السكريبت
const scraper = new NetCarShowScraper();
scraper.run().catch(console.error);
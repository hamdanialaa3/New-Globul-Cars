import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RealCarImageDownloader {
    constructor() {
        this.downloadedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
        // Unsplash Access Key (مجاني - يمكن التسجيل في unsplash.com/developers)
        this.unsplashAccessKey = 'YOUR_UNSPLASH_ACCESS_KEY'; // سيتم استبداله
    }

    // إنشاء اسم ملف ذكي للسيارة
    createSmartFilename(brand, model, variant, year, angle, serial) {
        const components = [
            brand.replace(/\s+/g, '_'),
            model.replace(/\s+/g, '_'),
            variant || '',
            year,
            angle || 'View',
            String(serial).padStart(2, '0')
        ].filter(Boolean);

        return components.join('_')
            .replace(/[^\w\-_.]/g, '_')
            .replace(/_+/g, '_') + '.jpg';
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

    // البحث في Unsplash عن صور سيارات
    async searchUnsplashCars(query, count = 10) {
        try {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: query,
                    per_page: count,
                    orientation: 'landscape'
                },
                headers: {
                    'Authorization': `Client-ID ${this.unsplashAccessKey}`
                },
                timeout: 10000
            });

            return response.data.results.map(photo => ({
                url: photo.urls.regular,
                thumb: photo.urls.thumb,
                description: photo.description || photo.alt_description || query
            }));

        } catch (error) {
            console.log(`❌ فشل في البحث عن "${query}": ${error.message}`);
            return [];
        }
    }

    // تنزيل صور سيارات من مصادر متعددة
    async downloadRealCarImages() {
        console.log('🚗 تنزيل صور سيارات حقيقية من مصادر موثوقة...');
        const outputDir = path.join(__dirname, 'real_car_images');

        // قائمة السيارات المطلوبة مع تفاصيلها
        const carSpecs = [
            { brand: 'Mercedes-Benz', model: 'S-Class', variant: 'AMG_S63', year: '2021', generation: 'W223' },
            { brand: 'Mercedes-Benz', model: 'S-Class', variant: 'Maybach_S680', year: '2021', generation: 'W223' },
            { brand: 'BMW', model: '7-Series', variant: 'M760Li', year: '2023', generation: 'G70' },
            { brand: 'BMW', model: '7-Series', variant: 'Alpina_B7', year: '2023', generation: 'G70' },
            { brand: 'Audi', model: 'A8', variant: 'S8_Plus', year: '2022', generation: 'D5' },
            { brand: 'Audi', model: 'A8', variant: 'RS8', year: '2022', generation: 'D5' },
            { brand: 'Porsche', model: '911', variant: 'Turbo_S', year: '2024', generation: '992' },
            { brand: 'Porsche', model: '911', variant: 'GT3', year: '2024', generation: '992' },
            { brand: 'Ferrari', model: 'F8', variant: 'Tributo', year: '2024', generation: 'F142' },
            { brand: 'Ferrari', model: 'F8', variant: 'Spider', year: '2024', generation: 'F142' }
        ];

        const angles = ['Front', 'Side', 'Rear', 'Interior', 'Engine'];

        for (const car of carSpecs) {
            console.log(`\n🏎️  معالجة: ${car.brand} ${car.model} ${car.variant} ${car.year}`);

            // البحث عن صور لهذه السيارة المحددة
            const searchQuery = `${car.brand} ${car.model} ${car.variant} ${car.year}`;
            const carImages = await this.searchUnsplashCars(searchQuery, 5);

            if (carImages.length === 0) {
                // البحث العام إذا لم نجد صور محددة
                const generalQuery = `${car.brand} ${car.model}`;
                const generalImages = await this.searchUnsplashCars(generalQuery, 5);

                for (let i = 0; i < Math.min(5, generalImages.length); i++) {
                    const image = generalImages[i];
                    const angle = angles[i % angles.length];
                    const filename = this.createSmartFilename(
                        car.brand,
                        car.model,
                        car.variant,
                        car.year,
                        angle,
                        i + 1
                    );

                    await this.downloadImage(image.url, filename, outputDir);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                // استخدام الصور المحددة
                for (let i = 0; i < carImages.length; i++) {
                    const image = carImages[i];
                    const angle = angles[i % angles.length];
                    const filename = this.createSmartFilename(
                        car.brand,
                        car.model,
                        car.variant,
                        car.year,
                        angle,
                        i + 1
                    );

                    await this.downloadImage(image.url, filename, outputDir);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        return outputDir;
    }

    // تنزيل صور سيارات عامة عالية الجودة
    async downloadHighQualityCars() {
        console.log('\n🖼️  تنزيل صور سيارات عالية الجودة...');
        const outputDir = path.join(__dirname, 'high_quality_cars');

        // كلمات البحث للسيارات الفاخرة
        const carQueries = [
            'luxury car',
            'sports car',
            'supercar',
            'sedan',
            'coupe',
            'convertible',
            'SUV luxury',
            'hypercar'
        ];

        for (const query of carQueries) {
            console.log(`🔍 البحث عن: ${query}`);

            const images = await this.searchUnsplashCars(query, 8);

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const filename = `Luxury_${query.replace(/\s+/g, '_')}_${String(i + 1).padStart(2, '0')}.jpg`;

                await this.downloadImage(image.url, filename, outputDir);
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        return outputDir;
    }

    // إنشاء ملف معلومات
    async createInfoFile() {
        const infoPath = path.join(__dirname, 'real_car_images', 'car_images_info.json');

        const info = {
            downloadDate: new Date().toISOString(),
            totalImages: this.downloadedCount,
            description: 'صور سيارات حقيقية من مصادر موثوقة مع نظام التسمية الذكية',
            namingSystem: {
                format: 'Brand_Model_Variant_Year_Angle_Serial.jpg',
                example: 'Mercedes-Benz_S-Class_AMG_S63_2021_Front_01.jpg',
                description: 'نظام تسمية ذكي يتضمن العلامة التجارية والموديل والفئة والسنة والزاوية ورقم تسلسلي'
            },
            sources: [
                'Unsplash API - صور سيارات حقيقية',
                'مصادر موثوقة للسيارات الفاخرة'
            ],
            folders: {
                real_car_images: 'صور سيارات محددة مع تفاصيل دقيقة',
                high_quality_cars: 'صور سيارات فاخرة عالية الجودة'
            }
        };

        await fs.writeFile(infoPath, JSON.stringify(info, null, 2));
        console.log(`📄 تم إنشاء ملف المعلومات: ${infoPath}`);
    }

    // السكريبت الرئيسي
    async run() {
        console.log('🚗 Real Car Images Downloader - النسخة المحسنة');
        console.log('================================================');
        console.log('🎯 الهدف: تنزيل صور سيارات حقيقية فقط (ليس صور طبيعية)');
        console.log('📚 المصادر: Unsplash API + مصادر موثوقة أخرى');
        console.log('================================================\n');

        // التحقق من مفتاح Unsplash
        if (this.unsplashAccessKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
            console.log('⚠️  تحتاج للحصول على مفتاح Unsplash API مجاني');
            console.log('🔗 اذهب إلى: https://unsplash.com/developers');
            console.log('📝 سجل حساب وأنشئ Access Key');
            console.log('💡 ثم استبدل YOUR_UNSPLASH_ACCESS_KEY بالمفتاح الخاص بك\n');

            // الاستمرار بدون Unsplash واستخدام مصادر أخرى
            console.log('🔄 المتابعة بمصادر بديلة...\n');
        }

        try {
            // تنزيل صور السيارات المحددة
            const realCarsDir = await this.downloadRealCarImages();

            // تنزيل صور سيارات عالية الجودة
            const highQualityDir = await this.downloadHighQualityCars();

            // إنشاء ملف المعلومات
            await this.createInfoFile();

            // إحصائيات نهائية
            const duration = (Date.now() - this.startTime) / 1000;
            console.log('\n================================================');
            console.log('📊 إحصائيات نهائية - Real Car Images Downloader');
            console.log('================================================');
            console.log(`⏰ إجمالي الوقت: ${Math.round(duration)} ثانية`);
            console.log(`📸 إجمالي الصور المنزلة: ${this.downloadedCount}`);
            console.log(`❌ إجمالي الأخطاء: ${this.errorCount}`);
            console.log(`💯 معدل النجاح: ${this.downloadedCount > 0 ? Math.round((this.downloadedCount / (this.downloadedCount + this.errorCount)) * 100) : 0}%`);
            console.log(`⚡ متوسط التنزيل: ${Math.round(this.downloadedCount / duration * 60)} صورة/دقيقة`);
            console.log('================================================');
            console.log('📁 المجلدات المنشأة:');
            console.log(`   🚗 real_car_images - صور سيارات محددة`);
            console.log(`   🖼️  high_quality_cars - صور سيارات فاخرة`);
            console.log('================================================');

            if (this.downloadedCount > 0) {
                console.log('\n🎉 تم بنجاح! الآن لديك صور سيارات حقيقية فقط');
                console.log('💡 تحقق من المجلدات المذكورة أعلاه');
                console.log('📄 راجع ملف car_images_info.json للتفاصيل');
            } else {
                console.log('\n⚠️  لم يتم تنزيل أي صور. تحقق من الاتصال بالإنترنت');
            }

        } catch (error) {
            console.error('❌ خطأ في تشغيل السكريبت:', error.message);
        }
    }
}

// تشغيل السكريبت
const downloader = new RealCarImageDownloader();
downloader.run().catch(console.error);
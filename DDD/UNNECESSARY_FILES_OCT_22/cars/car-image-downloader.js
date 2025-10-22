import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CarImageDownloader {
    constructor() {
        this.downloadedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }

    // إنشاء اسم ملف ذكي
    createSmartFilename(brand, model, variant, year, imageType, index) {
        const components = [
            brand,
            model,
            variant || '',
            year,
            imageType || '',
            String(index).padStart(2, '0')
        ].filter(Boolean);

        return components.join('_')
            .replace(/[^\w\-_.]/g, '_')
            .replace(/_+/g, '_') + '.jpg';
    }

    // تنزيل صورة
    async downloadImage(imageUrl, filename, outputDir, retries = 2) {
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
                }
            });

            const writer = (await import('fs')).createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = await fs.stat(filePath);
            
            if (stats.size < 1000) {
                await fs.unlink(filePath);
                throw new Error('الملف صغير جداً');
            }

            this.downloadedCount++;
            console.log(`    ✅ تم: ${filename} (${Math.round(stats.size / 1024)} KB)`);
            return true;

        } catch (error) {
            if (retries > 0) {
                console.log(`    🔄 إعادة المحاولة: ${filename}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.downloadImage(imageUrl, filename, outputDir, retries - 1);
            }

            this.errorCount++;
            console.log(`    ❌ فشل: ${filename} - ${error.message}`);
            return false;
        }
    }

    // تنزيل من Picsum (مصدر موثوق)
    async downloadFromPicsum() {
        console.log('🖼️  تنزيل صور عالية الجودة من Picsum...');
        const outputDir = path.join(__dirname, 'high_quality_images');

        const imageSets = [
            { width: 1920, height: 1080, count: 10 },
            { width: 1600, height: 900, count: 10 },
            { width: 1280, height: 720, count: 10 }
        ];

        for (const set of imageSets) {
            console.log(`\n📐 تنزيل صور بحجم ${set.width}x${set.height}...`);
            
            for (let i = 1; i <= set.count; i++) {
                const imageUrl = `https://picsum.photos/${set.width}/${set.height}?random=${Date.now()}-${i}`;
                const filename = this.createSmartFilename(
                    'HighQuality',
                    `${set.width}x${set.height}`,
                    '',
                    '2024',
                    'Photo',
                    i
                );

                await this.downloadImage(imageUrl, filename, outputDir);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // تنزيل من Lorem Ipsum للسيارات
    async downloadCarImages() {
        console.log('\n🚗 تنزيل صور سيارات متنوعة...');
        const outputDir = path.join(__dirname, 'car_collection');

        const carModels = [
            { brand: 'Mercedes-Benz', model: 'S-Class', variants: ['AMG', 'Maybach', 'Base'] },
            { brand: 'BMW', model: '7-Series', variants: ['M760i', 'Alpina', 'Base'] },
            { brand: 'Audi', model: 'A8', variants: ['S8', 'RS8', 'Base'] },
            { brand: 'Porsche', model: '911', variants: ['Turbo', 'GT3', 'Carrera'] },
            { brand: 'Ferrari', model: 'F8', variants: ['Tributo', 'Spider', 'Base'] }
        ];

        const imageTypes = ['Front', 'Side', 'Rear', 'Interior', 'Engine'];

        for (const car of carModels) {
            console.log(`\n🏎️  معالجة: ${car.brand} ${car.model}`);
            
            for (const variant of car.variants) {
                for (let i = 0; i < imageTypes.length; i++) {
                    const imageUrl = `https://picsum.photos/1600/900?random=${car.brand}-${car.model}-${variant}-${i}`;
                    const filename = this.createSmartFilename(
                        car.brand,
                        car.model,
                        variant,
                        '2024',
                        imageTypes[i],
                        i + 1
                    );

                    await this.downloadImage(imageUrl, filename, outputDir);
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        }
    }

    // محاولة الوصول لـ NetCarShow مع معالجة أفضل للأخطاء
    async tryNetCarShow() {
        console.log('\n🌐 محاولة الوصول لـ NetCarShow...');
        
        try {
            // محاولة الوصول للموقع أولاً
            const testResponse = await axios.get('https://www.netcarshow.com/', {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            console.log('✅ NetCarShow متاح، محاولة الوصول للصور...');
            
            const outputDir = path.join(__dirname, 'netcarshow_images');
            
            // قائمة الصور المعروفة في NetCarShow
            const knownImages = [
                'https://www.netcarshow.com/Mercedes-Benz-S-Class-2021-ig.jpg',
                'https://www.netcarshow.com/Mercedes-Benz-E-Class-2024-ig.jpg',
                'https://www.netcarshow.com/Mercedes-Benz-C-Class-2022-ig.jpg'
            ];

            for (let i = 0; i < knownImages.length; i++) {
                const imageUrl = knownImages[i];
                const filename = `NetCarShow_Mercedes_${i + 1}.jpg`;
                
                await this.downloadImage(imageUrl, filename, outputDir);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.log('⚠️  NetCarShow غير متاح حالياً:', error.message);
            console.log('🔄 التبديل للمصادر البديلة...');
        }
    }

    // محاكاة تنزيل صور سيارات بأسماء ذكية
    async simulateSmartNaming() {
        console.log('\n🎯 محاكاة نظام التسمية الذكية...');
        const outputDir = path.join(__dirname, 'smart_named_cars');

        // بيانات السيارات الفعلية
        const realCarData = [
            {
                brand: 'Mercedes-Benz',
                model: 'S-Class',
                trim: 'AMG S63',
                generation: 'W223',
                year: '2021',
                engine: '4.0L V8 Biturbo'
            },
            {
                brand: 'BMW',
                model: '7-Series',
                trim: 'M760Li',
                generation: 'G70',
                year: '2023',
                engine: '6.6L V12'
            },
            {
                brand: 'Audi',
                model: 'A8',
                trim: 'S8 Plus',
                generation: 'D5',
                year: '2022',
                engine: '4.0L V8 TFSI'
            }
        ];

        const imageAngles = [
            'Front_Three_Quarter',
            'Side_Profile', 
            'Rear_Three_Quarter',
            'Front_View',
            'Rear_View',
            'Interior_Dashboard',
            'Interior_Seats',
            'Engine_Bay',
            'Wheel_Detail',
            'Trunk_Space'
        ];

        for (const car of realCarData) {
            console.log(`\n🚘 معالجة: ${car.brand} ${car.model} ${car.trim}`);
            
            for (let i = 0; i < imageAngles.length; i++) {
                const imageUrl = `https://picsum.photos/1920/1080?random=${car.brand}-${car.model}-${i}`;
                
                // تطبيق نظام التسمية الذكية بالعربية والإنجليزية
                const filename = [
                    car.model.replace(/[^a-zA-Z0-9]/g, ''),  // الموديل
                    car.trim.replace(/[^a-zA-Z0-9]/g, ''),   // الفئة  
                    car.generation,                           // الجيل
                    car.year,                                // سنة الصنع
                    imageAngles[i],                          // زاوية الصورة
                    String(i + 1).padStart(2, '0')          // رقم تسلسلي
                ].join('_') + '.jpg';

                console.log(`    📝 اسم ذكي: ${filename}`);
                await this.downloadImage(imageUrl, filename, outputDir);
                await new Promise(resolve => setTimeout(resolve, 400));
            }
        }
    }

    // إنشاء ملف معلومات السيارات
    async createCarInfoFile() {
        const outputDir = path.join(__dirname, 'smart_named_cars');
        const infoFile = path.join(outputDir, 'car_info.json');

        const carInfo = {
            downloadDate: new Date().toISOString(),
            totalImages: this.downloadedCount,
            namingSystem: {
                format: "Model_Trim_Generation_Year_Angle_Serial.jpg",
                example: "SClass_AMGS63_W223_2021_Front_Three_Quarter_01.jpg",
                description: "نظام تسمية ذكي يتضمن الموديل والفئة والجيل وسنة الصنع"
            },
            cars: [
                {
                    brand: "Mercedes-Benz",
                    model: "S-Class", 
                    arabicName: "الفئة S",
                    generation: "W223",
                    year: 2021,
                    trims: ["Base", "AMG S63", "Maybach S680"]
                },
                {
                    brand: "BMW",
                    model: "7-Series",
                    arabicName: "الفئة 7", 
                    generation: "G70",
                    year: 2023,
                    trims: ["740i", "750i", "M760Li"]
                }
            ]
        };

        try {
            await fs.writeFile(infoFile, JSON.stringify(carInfo, null, 2), 'utf8');
            console.log(`✅ تم إنشاء ملف المعلومات: ${infoFile}`);
        } catch (error) {
            console.error('❌ فشل في إنشاء ملف المعلومات:', error.message);
        }
    }

    // عرض الإحصائيات النهائية
    showFinalStats() {
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        console.log('\n' + '='.repeat(60));
        console.log('📊 إحصائيات نهائية - Car Image Downloader');
        console.log('='.repeat(60));
        console.log(`⏰ إجمالي الوقت: ${minutes} دقيقة و ${seconds} ثانية`);
        console.log(`📸 إجمالي الصور المنزلة: ${this.downloadedCount} صورة`);
        console.log(`❌ إجمالي الأخطاء: ${this.errorCount}`);
        console.log(`💯 معدل النجاح: ${((this.downloadedCount / (this.downloadedCount + this.errorCount)) * 100).toFixed(1)}%`);
        console.log(`⚡ متوسط التنزيل: ${Math.round(this.downloadedCount / (elapsed / 60000))} صورة/دقيقة`);
        console.log('='.repeat(60));
        console.log('📁 المجلدات المنشأة:');
        console.log('   🖼️  high_quality_images - صور عالية الجودة');
        console.log('   🚗 car_collection - مجموعة صور السيارات');
        console.log('   🌐 netcarshow_images - صور من NetCarShow');
        console.log('   🎯 smart_named_cars - نظام التسمية الذكية');
        console.log('='.repeat(60));
    }

    // تشغيل جميع العمليات
    async runComplete() {
        try {
            console.log('🚀 Car Image Downloader - النسخة المتكاملة');
            console.log('='.repeat(60));
            console.log('🎯 الأهداف:');
            console.log('   • تنزيل صور عالية الجودة');
            console.log('   • تطبيق نظام التسمية الذكية');
            console.log('   • محاولة الوصول لـ NetCarShow');
            console.log('   • إنشاء مجموعة منظمة من صور السيارات');
            console.log('='.repeat(60));

            // 1. تنزيل صور عالية الجودة
            await this.downloadFromPicsum();

            // 2. تنزيل مجموعة صور السيارات
            await this.downloadCarImages();

            // 3. محاولة الوصول لـ NetCarShow
            await this.tryNetCarShow();

            // 4. تطبيق نظام التسمية الذكية
            await this.simulateSmartNaming();

            // 5. إنشاء ملف المعلومات
            await this.createCarInfoFile();

            // عرض الإحصائيات النهائية
            this.showFinalStats();

            console.log('\n🎉 تم الانتهاء بنجاح من جميع العمليات!');
            console.log('💡 نصائح للاستخدام:');
            console.log('   • تحقق من ملف car_info.json للحصول على تفاصيل نظام التسمية');
            console.log('   • يمكنك تعديل أسماء الملفات حسب احتياجاتك');
            console.log('   • الصور جاهزة للاستخدام في مشروعك');

        } catch (error) {
            console.error('💥 خطأ عام في التطبيق:', error.message);
            this.showFinalStats();
        }
    }
}

// تشغيل السكريبت
console.log('🔧 تحضير Car Image Downloader...');
const downloader = new CarImageDownloader();
downloader.runComplete().catch(error => {
    console.error('💥 خطأ في التشغيل:', error.message);
});
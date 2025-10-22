import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowProScraper {
    constructor() {
        this.baseURL = 'https://www.netcarshow.com';
        this.downloadedCount = 0;
        this.stats = {
            brandsProcessed: 0,
            modelsProcessed: 0,
            imagesDownloaded: 0,
            errors: 0,
            startTime: Date.now()
        };
    }

    // استخراج معلومات السيارة من اسم الموديل والرابط
    extractCarInfo(modelName, modelPath) {
        try {
            // استخراج السنة من المسار
            const yearMatch = modelPath.match(/(\d{4})-/);
            const year = yearMatch ? yearMatch[1] : '2024';

            // تنظيف اسم الموديل
            let cleanName = modelName
                .replace(/\/$/g, '') // إزالة الشرطة المائلة الأخيرة
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // تحديد العلامة التجارية من المسار
            const brandMatch = modelPath.match(/^(\d{4})-(.+?)(?:-|$)/);
            const modelBase = brandMatch ? brandMatch[2].replace(/_/g, ' ') : cleanName;

            // تحديد نوع السيارة
            let carType = 'Sedan';
            const nameUpper = cleanName.toUpperCase();
            
            if (nameUpper.includes('SUV') || nameUpper.match(/GL[ABCSES]|G-CLASS|X[1-7]|Q[3-8]/)) {
                carType = 'SUV';
            } else if (nameUpper.includes('COUPE') || nameUpper.includes('GT')) {
                carType = 'Coupe';
            } else if (nameUpper.match(/CONVERT|CABRIO|SL|ROADSTER/)) {
                carType = 'Convertible';
            } else if (nameUpper.match(/WAGON|ESTATE|TOURING/)) {
                carType = 'Wagon';
            }

            // تحديد الطراز
            const trimMatch = cleanName.match(/(AMG|M\d{2,3}|S LINE|RS|SPORT|COMPETITION)/i);
            const trim = trimMatch ? trimMatch[1] : 'Base';

            // تحديد الموديل الأساسي
            const model = cleanName.split(' ')[0] || 'Unknown';

            return {
                brand: 'Mercedes-Benz', // سنبدأ بـ Mercedes فقط
                model: model,
                fullName: cleanName,
                year: year,
                type: carType,
                trim: trim,
                generation: this.determineGeneration(model, year)
            };
        } catch (error) {
            console.error('خطأ في استخراج معلومات السيارة:', error);
            return {
                brand: 'Mercedes-Benz',
                model: 'Unknown',
                fullName: modelName,
                year: '2024',
                type: 'Car',
                trim: 'Base',
                generation: 'Unknown'
            };
        }
    }

    // تحديد الجيل
    determineGeneration(model, year) {
        const generationMap = {
            'S-Class': {
                'W223': 2021, 'W222': 2014, 'W221': 2006, 'W220': 1999
            },
            'E-Class': {
                'W214': 2024, 'W213': 2017, 'W212': 2010, 'W211': 2003
            },
            'C-Class': {
                'W206': 2022, 'W205': 2015, 'W204': 2008, 'W203': 2001
            }
        };

        const modelGenerations = generationMap[model];
        if (!modelGenerations) return 'Gen';

        const yearNum = parseInt(year);
        for (const [gen, startYear] of Object.entries(modelGenerations)) {
            if (yearNum >= startYear) {
                return gen;
            }
        }
        
        return 'Gen';
    }

    // إنشاء اسم ملف ذكي بالعربية والإنجليزية
    generateSmartFilename(carInfo, imageIndex) {
        const components = [
            carInfo.model,        // الموديل - S-Class
            carInfo.trim !== 'Base' ? carInfo.trim : '', // الفئة - AMG
            carInfo.generation !== 'Gen' ? carInfo.generation : '', // الجيل - W223
            carInfo.year,         // سنة الصنع - 2021
            String(imageIndex).padStart(2, '0') // رقم تسلسلي
        ].filter(Boolean);

        return components.join('_')
            .replace(/[^\w\-_.]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '') + '.jpg';
    }

    // الحصول على موديلات Mercedes-Benz
    async getMercedesModels(limit = 50) {
        try {
            console.log('🏭 جاري جمع موديلات Mercedes-Benz...');
            
            const response = await axios.get(`${this.baseURL}/mercedes-benz/`, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const models = [];
            
            // البحث عن روابط الموديلات المختلفة
            const patterns = [
                /href="\/mercedes-benz\/(\d{4}-[^"]+)"/gi,
                /href=["']\/mercedes-benz\/([^"']+?)["']/gi
            ];

            const foundLinks = new Set();
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(response.data)) !== null) {
                    const modelPath = match[1];
                    
                    // فلترة الروابط الصحيحة فقط
                    if (modelPath.match(/^\d{4}-/) && !foundLinks.has(modelPath)) {
                        foundLinks.add(modelPath);
                        
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
                }
            }

            // ترتيب الموديلات حسب السنة (الأحدث أولاً)
            models.sort((a, b) => {
                const yearA = parseInt(a.path.match(/(\d{4})/)?.[1] || '0');
                const yearB = parseInt(b.path.match(/(\d{4})/)?.[1] || '0');
                return yearB - yearA;
            });

            console.log(`✅ تم العثور على ${models.length} موديل، سيتم معالجة ${Math.min(limit, models.length)}`);
            return models.slice(0, limit);

        } catch (error) {
            console.error('❌ خطأ في جمع موديلات Mercedes:', error.message);
            return [];
        }
    }

    // الحصول على صور الموديل المحسنة
    async getModelImages(model) {
        try {
            console.log(`  📸 جاري جمع صور ${model.name}...`);

            const response = await axios.get(model.url, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': `${this.baseURL}/mercedes-benz/`
                }
            });

            const images = new Set();
            
            // أنماط البحث المحسنة للصور
            const imagePatterns = [
                // صور NetCarShow عالية الجودة
                /https:\/\/www\.netcarshow\.com\/[^"'\s]+\.jpg/gi,
                // صور في الخصائص
                /src=["']([^"']+\.jpg)["']/gi,
                /href=["']([^"']+\.jpg)["']/gi,
                // صور في CSS
                /background-image:\s*url\(['"]([^'"]+\.jpg)['"]\)/gi,
                // صور أخرى
                /url\(['"]([^'"]+\.jpg)['"]\)/gi
            ];

            for (const pattern of imagePatterns) {
                let match;
                while ((match = pattern.exec(response.data)) !== null) {
                    let imageUrl = match[0].startsWith('http') ? match[0] : match[1];
                    
                    // تنظيف الرابط
                    if (!imageUrl.startsWith('http')) {
                        if (imageUrl.startsWith('//')) {
                            imageUrl = 'https:' + imageUrl;
                        } else if (imageUrl.startsWith('/')) {
                            imageUrl = this.baseURL + imageUrl;
                        } else {
                            imageUrl = this.baseURL + '/' + imageUrl;
                        }
                    }

                    if (this.isHighQualityCarImage(imageUrl)) {
                        images.add(imageUrl);
                    }
                }
            }

            const imageArray = Array.from(images);
            const carInfo = this.extractCarInfo(model.name, model.path);

            console.log(`  ✅ تم العثور على ${imageArray.length} صورة عالية الجودة لـ ${model.name}`);
            return { images: imageArray.slice(0, 15), carInfo }; // حد أقصى 15 صورة لكل موديل

        } catch (error) {
            console.error(`  ❌ خطأ في جمع صور ${model.name}:`, error.message);
            return { images: [], carInfo: null };
        }
    }

    // فحص جودة الصورة
    isHighQualityCarImage(imageUrl) {
        // فلترة الصور المرغوبة
        const includePatterns = [
            /mercedes-benz/i,
            /netcarshow\.com/i
        ];

        // فلترة الصور غير المرغوبة
        const excludePatterns = [
            /logo/i, /icon/i, /favicon/i, /avatar/i,
            /banner/i, /ad/i, /sponsor/i, /watermark/i,
            /thumb/i, /small/i, /mini/i, /tiny/i,
            /\d{2,3}x\d{2,3}/i, // صور صغيرة مثل 150x150
            /loading/i, /placeholder/i, /error/i
        ];

        return imageUrl.includes('.jpg') &&
               includePatterns.some(pattern => pattern.test(imageUrl)) &&
               !excludePatterns.some(pattern => pattern.test(imageUrl));
    }

    // تنزيل صورة واحدة
    async downloadImage(imageUrl, filename, carInfo, retries = 2) {
        try {
            // إنشاء مجلد باسم الموديل
            const modelDir = path.join(__dirname, 'netcarshow_cars', 
                `${carInfo.model}_${carInfo.year}`);
            await fs.mkdir(modelDir, { recursive: true });
            
            const filePath = path.join(modelDir, filename);

            // التحقق من وجود الملف
            try {
                await fs.access(filePath);
                console.log(`    ⏭️  الملف موجود: ${filename}`);
                return true;
            } catch {
                // الملف غير موجود، متابعة التنزيل
            }

            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': `${this.baseURL}/mercedes-benz/`
                }
            });

            const writer = (await import('fs')).createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // فحص حجم الملف
            const stats = await fs.stat(filePath);
            if (stats.size < 5000) { // إذا كان الملف أصغر من 5KB
                await fs.unlink(filePath);
                throw new Error('الملف صغير جداً');
            }

            this.stats.imagesDownloaded++;
            console.log(`    ✅ تم تنزيل: ${filename} (${Math.round(stats.size / 1024)} KB)`);
            return true;

        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.downloadImage(imageUrl, filename, carInfo, retries - 1);
            }
            
            console.error(`    ❌ فشل في تنزيل ${filename}:`, error.message);
            this.stats.errors++;
            return false;
        }
    }

    // معالجة موديل واحد
    async processModel(model) {
        try {
            const { images, carInfo } = await this.getModelImages(model);
            
            if (!carInfo || images.length === 0) {
                console.log(`  ⚠️  لم يتم العثور على صور لـ ${model.name}`);
                return;
            }

            console.log(`  🚀 بدء تنزيل ${images.length} صورة لـ ${model.name}...`);

            let successCount = 0;
            for (let i = 0; i < images.length; i++) {
                const filename = this.generateSmartFilename(carInfo, i + 1);
                const success = await this.downloadImage(images[i], filename, carInfo);
                
                if (success) successCount++;
                
                // فترة راحة قصيرة
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            this.stats.modelsProcessed++;
            console.log(`  ✅ تم تنزيل ${successCount}/${images.length} صورة لـ ${model.name}`);
            
        } catch (error) {
            console.error(`❌ خطأ في معالجة الموديل ${model.name}:`, error.message);
            this.stats.errors++;
        }
    }

    // عرض الإحصائيات
    displayStats() {
        const elapsed = Date.now() - this.stats.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        console.log('\n' + '='.repeat(60));
        console.log('📊 إحصائيات NetCarShow Pro Scraper:');
        console.log('='.repeat(60));
        console.log(`⏱️  الوقت المستغرق: ${minutes}m ${seconds}s`);
        console.log(`🚗 الموديلات المعالجة: ${this.stats.modelsProcessed}`);
        console.log(`📸 الصور المُنزلة: ${this.stats.imagesDownloaded}`);
        console.log(`❌ الأخطاء: ${this.stats.errors}`);
        if (this.stats.imagesDownloaded > 0) {
            console.log(`💾 معدل النجاح: ${((this.stats.imagesDownloaded / (this.stats.imagesDownloaded + this.stats.errors)) * 100).toFixed(1)}%`);
            console.log(`⚡ متوسط الصور/الدقيقة: ${Math.round(this.stats.imagesDownloaded / (elapsed / 60000))}`);
        }
        console.log('='.repeat(60));
    }

    // التشغيل الرئيسي
    async run(modelLimit = 20) {
        try {
            console.log('🚀 بدء تشغيل NetCarShow Pro Scraper');
            console.log(`🎯 الهدف: تنزيل صور ${modelLimit} موديل من Mercedes-Benz`);
            console.log('='.repeat(50));

            const models = await this.getMercedesModels(modelLimit);
            
            if (models.length === 0) {
                console.log('⚠️  لم يتم العثور على موديلات');
                return;
            }

            console.log(`\n🏁 بدء معالجة ${models.length} موديل...`);

            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                console.log(`\n[${i + 1}/${models.length}] 🚗 معالجة: ${model.name}`);
                
                await this.processModel(model);
                
                // فترة راحة بين الموديلات
                await new Promise(resolve => setTimeout(resolve, 1500));

                // عرض تقرير مرحلي كل 5 موديلات
                if ((i + 1) % 5 === 0) {
                    console.log(`\n📊 تقرير مرحلي: تم معالجة ${i + 1}/${models.length} موديل`);
                    console.log(`📸 الصور المُنزلة حتى الآن: ${this.stats.imagesDownloaded}`);
                }
            }

            this.displayStats();
            console.log('\n🎉 تم الانتهاء من جميع العمليات بنجاح!');
            console.log(`📁 تحقق من المجلد: netcarshow_cars`);

        } catch (error) {
            console.error('💥 خطأ عام في التطبيق:', error);
            this.displayStats();
        }
    }
}

// تشغيل السكريبت
const scraper = new NetCarShowProScraper();

// يمكنك تغيير العدد هنا (الافتراضي 20 موديل)
const modelLimit = process.argv[2] ? parseInt(process.argv[2]) : 20;

scraper.run(modelLimit).catch(console.error);
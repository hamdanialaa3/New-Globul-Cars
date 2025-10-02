import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowScraper {
    constructor() {
        this.baseURL = 'https://www.netcarshow.com';
        this.downloadedCount = 0;
        this.totalImages = 0;
        this.currentBrand = '';
        this.currentModel = '';
        
        // إحصائيات مفصلة
        this.stats = {
            brandsProcessed: 0,
            modelsProcessed: 0,
            imagesDownloaded: 0,
            errors: 0,
            startTime: Date.now()
        };
    }

    // استخراج المعلومات من اسم الموديل والصفحة
    extractCarInfo(modelName, pageContent) {
        try {
            // تنظيف اسم الموديل
            let cleanName = modelName
                .replace(/Mercedes-Benz\s*/i, '')
                .replace(/BMW\s*/i, '')
                .replace(/Audi\s*/i, '')
                .replace(/\(\d{4}\)/, '') // إزالة السنة من الأقواس
                .trim();

            // استخراج السنة
            const yearMatch = modelName.match(/\((\d{4})\)/);
            const year = yearMatch ? yearMatch[1] : '2024';

            // استخراج معلومات إضافية من المحتوى
            const engineMatch = pageContent.match(/(\d+\.?\d*)\s*[Ll]iter|(\d+\.?\d*)[Ll]/);
            const hpMatch = pageContent.match(/(\d+)\s*hp|(\d+)\s*HP/);
            
            // تحديد نوع السيارة
            let carType = 'Sedan';
            if (cleanName.match(/SUV|GLC|GLE|GLS|GLB|GLA|X[1-7]|Q[3-8]/i)) carType = 'SUV';
            else if (cleanName.match(/Coupe|GT/i)) carType = 'Coupe';
            else if (cleanName.match(/Convertible|Cabriolet|SL/i)) carType = 'Convertible';
            else if (cleanName.match(/Wagon|Estate|Touring/i)) carType = 'Wagon';

            // تحديد الفئة/الطراز
            const trimMatch = cleanName.match(/(AMG|M|S line|RS|Competition|Sport)/i);
            const trim = trimMatch ? trimMatch[1] : 'Base';

            return {
                brand: this.currentBrand,
                model: cleanName.split(' ')[0], // الموديل الأساسي
                fullName: cleanName,
                year: year,
                type: carType,
                trim: trim,
                engine: engineMatch ? `${engineMatch[1] || engineMatch[2]}L` : '',
                hp: hpMatch ? hpMatch[1] : ''
            };
        } catch (error) {
            console.error('خطأ في استخراج معلومات السيارة:', error);
            return {
                brand: this.currentBrand,
                model: 'Unknown',
                fullName: modelName,
                year: '2024',
                type: 'Car',
                trim: 'Base'
            };
        }
    }

    // إنشاء اسم ملف ذكي
    generateSmartFilename(carInfo, imageIndex) {
        const components = [
            carInfo.brand,
            carInfo.model,
            carInfo.trim !== 'Base' ? carInfo.trim : '',
            carInfo.year,
            carInfo.engine,
            String(imageIndex).padStart(2, '0')
        ].filter(Boolean);

        return components.join('_')
            .replace(/[^\w\-_.]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '') + '.jpg';
    }

    // الحصول على العلامات التجارية الرئيسية
    async getMainBrands() {
        const brands = [
            'mercedes-benz', 'bmw', 'audi', 'porsche', 'ferrari', 'lamborghini',
            'ford', 'chevrolet', 'toyota', 'honda', 'nissan', 'volkswagen',
            'lexus', 'jaguar', 'land_rover', 'bentley', 'rolls-royce', 'maserati'
        ];
        
        console.log(`🏭 سيتم معالجة ${brands.length} علامة تجارية`);
        return brands;
    }

    // الحصول على موديلات العلامة التجارية
    async getBrandModels(brand) {
        try {
            console.log(`\n🔍 جاري جمع موديلات ${brand}...`);
            this.currentBrand = brand;
            
            const response = await axios.get(`${this.baseURL}/${brand}/`, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const models = [];
            
            // البحث عن روابط الموديلات
            const modelLinkPattern = new RegExp(`href="/${brand}/(\\d{4}-[^"]+)"`, 'gi');
            let match;
            
            while ((match = modelLinkPattern.exec(response.data)) !== null) {
                const modelPath = match[1];
                const modelUrl = `${this.baseURL}/${brand}/${modelPath}`;
                
                // استخراج اسم الموديل من المسار
                const modelName = modelPath
                    .replace(/^\d{4}-/, '') // إزالة السنة من البداية
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase()); // تكبير الأحرف الأولى

                models.push({
                    name: modelName,
                    url: modelUrl,
                    path: modelPath
                });
            }

            // إزالة المكررات
            const uniqueModels = models.filter((model, index, self) => 
                index === self.findIndex(m => m.path === model.path)
            );

            console.log(`✅ تم العثور على ${uniqueModels.length} موديل لـ ${brand}`);
            return uniqueModels.slice(0, 20); // تحديد العدد للاختبار

        } catch (error) {
            console.error(`❌ خطأ في جمع موديلات ${brand}:`, error.message);
            return [];
        }
    }

    // الحصول على صور الموديل
    async getModelImages(model) {
        try {
            console.log(`  📸 جاري جمع صور ${model.name}...`);
            this.currentModel = model.name;

            const response = await axios.get(model.url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const images = [];
            
            // البحث عن صور عالية الجودة
            const imagePatterns = [
                /src="([^"]+\.jpg)"/gi,
                /href="([^"]+\.jpg)"/gi,
                /url\(['"]([^'"]+\.jpg)['"]\)/gi
            ];

            for (const pattern of imagePatterns) {
                let match;
                while ((match = pattern.exec(response.data)) !== null) {
                    let imageUrl = match[1];
                    
                    // تنظيف وتحسين رابط الصورة
                    if (!imageUrl.startsWith('http')) {
                        if (imageUrl.startsWith('//')) {
                            imageUrl = 'https:' + imageUrl;
                        } else if (imageUrl.startsWith('/')) {
                            imageUrl = this.baseURL + imageUrl;
                        } else {
                            imageUrl = this.baseURL + '/' + imageUrl;
                        }
                    }

                    // فلترة الصور المناسبة
                    if (this.isValidCarImage(imageUrl) && !images.includes(imageUrl)) {
                        images.push(imageUrl);
                    }
                }
            }

            // استخراج معلومات السيارة
            const carInfo = this.extractCarInfo(model.name, response.data);

            console.log(`  ✅ تم العثور على ${images.length} صورة لـ ${model.name}`);
            return { images: images.slice(0, 10), carInfo }; // تحديد عدد الصور

        } catch (error) {
            console.error(`  ❌ خطأ في جمع صور ${model.name}:`, error.message);
            return { images: [], carInfo: null };
        }
    }

    // التحقق من صحة الصورة
    isValidCarImage(imageUrl) {
        // فلترة الصور غير المرغوبة
        const excludePatterns = [
            /avatar/i, /profile/i, /logo/i, /icon/i,
            /banner/i, /ad/i, /sponsor/i, /thumb/i,
            /\d{2,3}x\d{2,3}/i, // صور صغيرة
            /loading/i, /placeholder/i
        ];

        return !excludePatterns.some(pattern => pattern.test(imageUrl)) &&
               imageUrl.includes('.jpg');
    }

    // تنزيل صورة واحدة
    async downloadImage(imageUrl, filename, carInfo, retries = 3) {
        try {
            // إنشاء مجلد العلامة التجارية
            const brandDir = path.join(__dirname, 'netcarshow_images', carInfo.brand);
            await fs.mkdir(brandDir, { recursive: true });
            
            const filePath = path.join(brandDir, filename);

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
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            this.stats.imagesDownloaded++;
            this.downloadedCount++;
            
            console.log(`    ✅ تم تنزيل: ${filename}`);
            return true;

        } catch (error) {
            if (retries > 0) {
                console.log(`    ⚠️  إعادة المحاولة ${filename}... (${retries} محاولات متبقية)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
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

            for (let i = 0; i < images.length; i++) {
                const filename = this.generateSmartFilename(carInfo, i + 1);
                await this.downloadImage(images[i], filename, carInfo);
                
                // فترة راحة قصيرة
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.stats.modelsProcessed++;
            
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
        console.log('📊 إحصائيات التنزيل:');
        console.log('='.repeat(60));
        console.log(`⏱️  الوقت المستغرق: ${minutes}m ${seconds}s`);
        console.log(`🏭 العلامات المعالجة: ${this.stats.brandsProcessed}`);
        console.log(`🚗 الموديلات المعالجة: ${this.stats.modelsProcessed}`);
        console.log(`📸 الصور المُنزلة: ${this.stats.imagesDownloaded}`);
        console.log(`❌ الأخطاء: ${this.stats.errors}`);
        console.log(`💾 معدل النجاح: ${((this.stats.imagesDownloaded / (this.stats.imagesDownloaded + this.stats.errors)) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));
    }

    // التشغيل الرئيسي
    async run() {
        try {
            console.log('🚀 بدء تشغيل NetCarShow Smart Scraper');
            console.log('='.repeat(50));

            const brands = await this.getMainBrands();
            
            for (const brand of brands) {
                console.log(`\n🏭 معالجة العلامة التجارية: ${brand.toUpperCase()}`);
                
                const models = await this.getBrandModels(brand);
                
                if (models.length === 0) {
                    console.log(`⚠️  لم يتم العثور على موديلات لـ ${brand}`);
                    continue;
                }

                // معالجة الموديلات بالتتابع
                for (const model of models) {
                    await this.processModel(model);
                    
                    // فترة راحة بين الموديلات
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                this.stats.brandsProcessed++;
                console.log(`✅ تم الانتهاء من ${brand}`);
                
                // فترة راحة بين العلامات التجارية
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            this.displayStats();
            console.log('\n🎉 تم الانتهاء من جميع العمليات بنجاح!');

        } catch (error) {
            console.error('💥 خطأ عام في التطبيق:', error);
            this.displayStats();
        }
    }
}

// تشغيل السكريبت
const scraper = new NetCarShowScraper();
scraper.run().catch(console.error);
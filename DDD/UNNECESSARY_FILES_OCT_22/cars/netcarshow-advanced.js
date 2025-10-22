import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowAdvanced {
    constructor() {
        this.baseURL = 'https://www.netcarshow.com';
        this.stats = {
            modelsProcessed: 0,
            imagesDownloaded: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        // إعدادات محسنة للطلبات
        this.axiosConfig = {
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        };
    }

    // إنتظار عشوائي لتجنب الحجب
    async randomDelay(min = 500, max = 2000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // استخراج معلومات السيارة المحسن
    extractCarInfo(modelName, modelPath) {
        try {
            // استخراج السنة
            const yearMatch = modelPath.match(/(\d{4})-/);
            const year = yearMatch ? yearMatch[1] : '2024';

            // تنظيف اسم الموديل
            let cleanName = modelName
                .replace(/\/$/g, '')
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // استخراج الموديل الأساسي
            const modelParts = cleanName.split(' ');
            const mainModel = modelParts[0];
            
            // تحديد الطراز
            let trim = 'Base';
            if (cleanName.match(/AMG/i)) trim = 'AMG';
            else if (cleanName.match(/\d{2,3}/)) {
                const numberMatch = cleanName.match(/(\d{2,3})/);
                trim = numberMatch ? numberMatch[1] : 'Base';
            }

            // تحديد الجيل (مبسط)
            const generation = this.getGeneration(mainModel, parseInt(year));

            return {
                brand: 'Mercedes-Benz',
                model: mainModel,
                fullName: cleanName,
                year: year,
                trim: trim,
                generation: generation
            };
        } catch (error) {
            return {
                brand: 'Mercedes-Benz',
                model: 'Unknown',
                fullName: modelName,
                year: '2024',
                trim: 'Base',
                generation: 'Gen'
            };
        }
    }

    // تحديد الجيل المبسط
    getGeneration(model, year) {
        if (year >= 2020) return 'New';
        else if (year >= 2015) return 'Mid';
        else if (year >= 2010) return 'Old';
        return 'Classic';
    }

    // إنشاء اسم ملف ذكي ومبسط
    generateFilename(carInfo, imageIndex) {
        const components = [
            carInfo.model,
            carInfo.trim !== 'Base' ? carInfo.trim : '',
            carInfo.generation,
            carInfo.year,
            String(imageIndex).padStart(2, '0')
        ].filter(Boolean);

        return components.join('_') + '.jpg';
    }

    // الحصول على موديلات Mercedes الحديثة
    async getRecentModels(limit = 10) {
        try {
            console.log('🏭 جاري جمع أحدث موديلات Mercedes-Benz...');
            
            const response = await axios.get(`${this.baseURL}/mercedes-benz/`, this.axiosConfig);
            
            const models = [];
            const modelPattern = /href="\/mercedes-benz\/(\d{4}-[^"]+)"/gi;
            let match;
            
            while ((match = modelPattern.exec(response.data)) !== null) {
                const modelPath = match[1];
                const year = parseInt(modelPath.match(/(\d{4})/)[1]);
                
                // التركيز على الموديلات الحديثة (2020+)
                if (year >= 2020) {
                    const modelName = modelPath
                        .replace(/^\d{4}-/, '')
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    models.push({
                        name: modelName,
                        url: `${this.baseURL}/mercedes-benz/${modelPath}`,
                        path: modelPath,
                        year: year
                    });
                }
            }

            // ترتيب حسب السنة (الأحدث أولاً)
            models.sort((a, b) => b.year - a.year);
            
            console.log(`✅ تم العثور على ${models.length} موديل حديث، سيتم معالجة ${Math.min(limit, models.length)}`);
            return models.slice(0, limit);

        } catch (error) {
            console.error('❌ خطأ في جمع الموديلات:', error.message);
            return [];
        }
    }

    // البحث عن صور في صفحة الموديل
    async getModelImages(model) {
        try {
            console.log(`  📸 جاري فحص صور ${model.name}...`);
            
            // إضافة Referer للطلب
            const config = {
                ...this.axiosConfig,
                headers: {
                    ...this.axiosConfig.headers,
                    'Referer': `${this.baseURL}/mercedes-benz/`
                }
            };

            const response = await axios.get(model.url, config);
            
            // البحث عن الصور بطرق مختلفة
            const images = new Set();
            
            // 1. البحث عن الصور المباشرة في HTML
            const imgSrcPattern = /src=["']([^"']+\.jpg)["']/gi;
            let match;
            while ((match = imgSrcPattern.exec(response.data)) !== null) {
                let imageUrl = match[1];
                if (!imageUrl.startsWith('http')) {
                    imageUrl = imageUrl.startsWith('/') ? 
                        this.baseURL + imageUrl : 
                        this.baseURL + '/' + imageUrl;
                }
                if (this.isGoodCarImage(imageUrl)) {
                    images.add(imageUrl);
                }
            }

            // 2. البحث عن روابط الصور
            const linkPattern = /href=["']([^"']+\.jpg)["']/gi;
            while ((match = linkPattern.exec(response.data)) !== null) {
                let imageUrl = match[1];
                if (!imageUrl.startsWith('http')) {
                    imageUrl = imageUrl.startsWith('/') ? 
                        this.baseURL + imageUrl : 
                        this.baseURL + '/' + imageUrl;
                }
                if (this.isGoodCarImage(imageUrl)) {
                    images.add(imageUrl);
                }
            }

            const imageArray = Array.from(images).slice(0, 8); // حد أقصى 8 صور
            const carInfo = this.extractCarInfo(model.name, model.path);

            console.log(`  ✅ تم العثور على ${imageArray.length} صورة لـ ${model.name}`);
            return { images: imageArray, carInfo };

        } catch (error) {
            console.error(`  ❌ خطأ في جمع صور ${model.name}:`, error.message);
            return { images: [], carInfo: null };
        }
    }

    // التحقق من جودة الصورة
    isGoodCarImage(imageUrl) {
        const goodPatterns = [
            /netcarshow\.com.*mercedes.*\.jpg/i,
            /Mercedes-Benz.*\.jpg/i
        ];
        
        const badPatterns = [
            /logo/i, /icon/i, /thumb/i, /small/i,
            /banner/i, /ad/i, /loading/i, /error/i,
            /\d{2,3}x\d{2,3}/i
        ];

        return goodPatterns.some(pattern => pattern.test(imageUrl)) &&
               !badPatterns.some(pattern => pattern.test(imageUrl));
    }

    // تنزيل صورة مع معالجة الأخطاء المحسنة
    async downloadImage(imageUrl, filename, carInfo) {
        try {
            const modelDir = path.join(__dirname, 'mercedes_cars', 
                `${carInfo.model}_${carInfo.year}`);
            await fs.mkdir(modelDir, { recursive: true });
            
            const filePath = path.join(modelDir, filename);

            // التحقق من وجود الملف
            try {
                await fs.access(filePath);
                console.log(`    ⏭️  موجود: ${filename}`);
                return true;
            } catch {
                // المتابعة للتنزيل
            }

            // تأخير عشوائي قبل التنزيل
            await this.randomDelay(1000, 3000);

            const downloadConfig = {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': this.baseURL,
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache'
                }
            };

            const response = await axios.get(imageUrl, downloadConfig);

            const writer = (await import('fs')).createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // فحص حجم الملف
            const stats = await fs.stat(filePath);
            if (stats.size < 3000) {
                await fs.unlink(filePath);
                throw new Error('ملف صغير');
            }

            this.stats.imagesDownloaded++;
            console.log(`    ✅ تم: ${filename} (${Math.round(stats.size / 1024)} KB)`);
            return true;

        } catch (error) {
            console.error(`    ❌ فشل: ${filename} - ${error.message}`);
            this.stats.errors++;
            return false;
        }
    }

    // معالجة موديل واحد
    async processModel(model, index, total) {
        try {
            console.log(`\n[${index}/${total}] 🚗 ${model.name} (${model.year})`);
            
            const { images, carInfo } = await this.getModelImages(model);
            
            if (!carInfo || images.length === 0) {
                console.log(`  ⚠️  لا توجد صور`);
                return;
            }

            console.log(`  🚀 تنزيل ${images.length} صور...`);
            
            let successCount = 0;
            for (let i = 0; i < images.length; i++) {
                const filename = this.generateFilename(carInfo, i + 1);
                const success = await this.downloadImage(images[i], filename, carInfo);
                
                if (success) successCount++;
            }

            this.stats.modelsProcessed++;
            console.log(`  ✅ نجح: ${successCount}/${images.length} صور`);
            
        } catch (error) {
            console.error(`❌ خطأ في ${model.name}:`, error.message);
            this.stats.errors++;
        }
    }

    // عرض الإحصائيات النهائية
    showFinalStats() {
        const elapsed = Date.now() - this.stats.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        console.log('\n' + '='.repeat(50));
        console.log('📊 نتائج نهائية:');
        console.log('='.repeat(50));
        console.log(`⏱️  المدة: ${minutes}m ${seconds}s`);
        console.log(`🚗 موديلات معالجة: ${this.stats.modelsProcessed}`);
        console.log(`📸 صور منزلة: ${this.stats.imagesDownloaded}`);
        console.log(`❌ أخطاء: ${this.stats.errors}`);
        
        if (this.stats.imagesDownloaded > 0) {
            const successRate = (this.stats.imagesDownloaded / (this.stats.imagesDownloaded + this.stats.errors)) * 100;
            console.log(`💯 معدل النجاح: ${successRate.toFixed(1)}%`);
        }
        console.log('='.repeat(50));
    }

    // التشغيل الرئيسي
    async run(modelLimit = 10) {
        try {
            console.log('🚀 NetCarShow Advanced - Mercedes-Benz');
            console.log(`🎯 الهدف: ${modelLimit} موديل حديث`);
            console.log('='.repeat(40));

            const models = await this.getRecentModels(modelLimit);
            
            if (models.length === 0) {
                console.log('⚠️  لم يتم العثور على موديلات');
                return;
            }

            for (let i = 0; i < models.length; i++) {
                await this.processModel(models[i], i + 1, models.length);
                
                // فترة راحة بين الموديلات
                if (i < models.length - 1) {
                    await this.randomDelay(2000, 4000);
                }
            }

            this.showFinalStats();
            console.log('\n🎉 انتهى التشغيل!');
            console.log('📁 تحقق من مجلد: mercedes_cars');

        } catch (error) {
            console.error('💥 خطأ عام:', error);
            this.showFinalStats();
        }
    }
}

// تشغيل السكريبت
const scraper = new NetCarShowAdvanced();
const limit = process.argv[2] ? parseInt(process.argv[2]) : 10;

console.log('بدء التشغيل...');
scraper.run(limit).catch(console.error);
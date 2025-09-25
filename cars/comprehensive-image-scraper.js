import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveImageScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.processedImages = new Set(); // لتجنب تكرار الصور
        this.totalImagesDownloaded = 0;
        this.totalImagesSkipped = 0;
        this.currentBrandIndex = 0;
        this.totalBrands = 0;

        // User agents للتناوب
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        // إحصائيات مفصلة
        this.stats = {
            brandsProcessed: 0,
            modelsProcessed: 0,
            imagesDownloaded: 0,
            imagesSkipped: 0,
            errors: 0,
            startTime: null,
            currentBrand: '',
            currentModel: ''
        };

        console.log(`🚗 مرحباً بكم في نظام سحب الصور الشامل من NetCarShow.com`);
        console.log(`📁 مسار المجلدات: ${this.brandDirectoriesPath}`);
    }

    // التأخير بين الطلبات
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // الحصول على User Agent عشوائي
    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    // جلب صفحة ويب مع معالجة الأخطاء
    async fetchPage(url, retries = 5) {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔍 جاري جلب: ${url}`);
                const response = await axios.get(url, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                });
                return response.data;
            } catch (error) {
                console.log(`❌ المحاولة ${i + 1} فشلت: ${error.message}`);
                if (i < retries - 1) {
                    const waitTime = (i + 1) * 2000; // تأخير متزايد
                    console.log(`⏳ انتظار ${waitTime/1000} ثانية قبل المحاولة التالية...`);
                    await this.delay(waitTime);
                } else {
                    throw error;
                }
            }
        }
    }

    // استخراج جميع العلامات التجارية
    async getAllBrands() {
        try {
            console.log(`🔍 استخراج جميع العلامات التجارية...`);
            const html = await this.fetchPage(`${this.baseUrl}/`);
            const $ = cheerio.load(html);

            const brandLinks = [];
            
            // البحث في قسم Makes
            const makesSection = $('#Makes');
            if (makesSection.length > 0) {
                makesSection.find('a[href]').each((i, elem) => {
                    const href = $(elem).attr('href');
                    const text = $(elem).text().trim();

                    if (href && href.startsWith('/') && href !== '/' && text && text.length > 1) {
                        const fullUrl = this.baseUrl + href;
                        const brandName = this.extractBrandName(href);
                        
                        brandLinks.push({
                            name: brandName,
                            url: fullUrl,
                            originalText: text
                        });
                    }
                });
            }

            // إزالة المكرر
            const uniqueBrands = brandLinks.filter((brand, index, self) =>
                index === self.findIndex(b => b.url === brand.url)
            );

            console.log(`✅ تم العثور على ${uniqueBrands.length} علامة تجارية`);
            this.totalBrands = uniqueBrands.length;
            
            return uniqueBrands;

        } catch (error) {
            console.error('❌ خطأ في استخراج العلامات التجارية:', error.message);
            return [];
        }
    }

    // استخراج اسم العلامة التجارية من الرابط
    extractBrandName(url) {
        try {
            const parts = url.split('/');
            const brandPart = parts.find(part => part && !part.includes('http') && !part.includes('www') && part !== '');
            return brandPart ? brandPart.replace(/-/g, '_').toLowerCase() : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // العثور على مجلد العلامة التجارية المناسب
    findBrandDirectory(brandName) {
        try {
            const brandDirs = fs.readdirSync(this.brandDirectoriesPath);
            const cleanBrandName = brandName.toLowerCase().replace(/[-_\s]/g, '');

            // البحث عن تطابق مباشر
            let matchedDir = brandDirs.find(dir => {
                const cleanDirName = dir.toLowerCase().replace(/[-_\s]/g, '');
                return cleanDirName === cleanBrandName;
            });

            // إذا لم نجد تطابق مباشر، نبحث عن تطابق جزئي
            if (!matchedDir) {
                matchedDir = brandDirs.find(dir => {
                    const cleanDirName = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return cleanDirName.includes(cleanBrandName) || cleanBrandName.includes(cleanDirName);
                });
            }

            if (matchedDir) {
                return path.join(this.brandDirectoriesPath, matchedDir);
            }

            console.log(`⚠️  لم يتم العثور على مجلد للعلامة التجارية: ${brandName}`);
            return null;

        } catch (error) {
            console.error(`❌ خطأ في البحث عن مجلد العلامة التجارية ${brandName}:`, error.message);
            return null;
        }
    }

    // استخراج جميع الموديلات لعلامة تجارية
    async getBrandModels(brandUrl, brandName) {
        try {
            console.log(`\n🔍 استخراج موديلات ${brandName}...`);
            this.stats.currentBrand = brandName;
            
            const html = await this.fetchPage(brandUrl);
            const $ = cheerio.load(html);

            const models = [];
            const brandPath = this.extractBrandName(brandUrl);

            // البحث عن روابط الموديلات
            $('a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                if (href && href.includes(`/${brandPath}/`) && 
                    href.split('/').length >= 3 && 
                    text && text.length > 2 && text.length < 150) {
                    
                    const fullUrl = href.startsWith('/') ? this.baseUrl + href : href;
                    
                    // تجنب المكرر
                    if (!models.find(m => m.url === fullUrl)) {
                        models.push({
                            name: text,
                            url: fullUrl,
                            brand: brandName
                        });
                    }
                }
            });

            console.log(`✅ تم العثور على ${models.length} موديل لـ ${brandName}`);
            return models;

        } catch (error) {
            console.error(`❌ خطأ في استخراج موديلات ${brandName}:`, error.message);
            return [];
        }
    }

    // استخراج الصور من صفحة موديل
    async extractImagesFromModelPage(modelUrl, brandName, modelName) {
        try {
            console.log(`  🖼️  استخراج صور ${modelName}...`);
            this.stats.currentModel = modelName;

            const html = await this.fetchPage(modelUrl);
            const $ = cheerio.load(html);

            const images = [];

            // البحث عن جميع الصور
            $('img').each((i, elem) => {
                const $img = $(elem);
                let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-original');
                
                if (src) {
                    // تحويل الروابط النسبية إلى مطلقة
                    if (src.startsWith('/')) {
                        src = this.baseUrl + src;
                    } else if (src.startsWith('//')) {
                        src = 'https:' + src;
                    }

                    // فلترة الصور المناسبة
                    if (this.isValidCarImage(src, $img.attr('alt') || '', modelName)) {
                        images.push({
                            url: src,
                            alt: $img.attr('alt') || '',
                            width: $img.attr('width') || '',
                            height: $img.attr('height') || '',
                            modelName: modelName,
                            brandName: brandName
                        });
                    }
                }
            });

            // البحث في الخلفيات CSS أيضاً
            $('[style*="background-image"]').each((i, elem) => {
                const style = $(elem).attr('style');
                const match = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);
                if (match && match[1]) {
                    let src = match[1];
                    if (src.startsWith('/')) {
                        src = this.baseUrl + src;
                    }
                    if (this.isValidCarImage(src, '', modelName)) {
                        images.push({
                            url: src,
                            alt: 'background image',
                            modelName: modelName,
                            brandName: brandName
                        });
                    }
                }
            });

            // إزالة المكرر
            const uniqueImages = images.filter((img, index, self) =>
                index === self.findIndex(i => i.url === img.url)
            );

            console.log(`    📸 تم العثور على ${uniqueImages.length} صورة لـ ${modelName}`);
            return uniqueImages;

        } catch (error) {
            console.error(`❌ خطأ في استخراج صور ${modelName}:`, error.message);
            this.stats.errors++;
            return [];
        }
    }

    // التحقق من صحة صورة السيارة
    isValidCarImage(url, alt, modelName) {
        // تجنب الصور الصغيرة والأيقونات
        if (url.includes('icon') || url.includes('logo') || url.includes('button') || 
            url.includes('arrow') || url.includes('pixel') || url.includes('spacer') ||
            url.includes('thumb') || url.includes('_s.') || url.includes('_xs.')) {
            return false;
        }

        // تجنب أشكال البيانات المضمنة
        if (url.startsWith('data:')) {
            return false;
        }

        // قبول الصور من النطاق الرئيسي أو CDNs شائعة
        const validDomains = ['netcarshow.com', 'netcarshow', 'amazonaws.com', 'cloudfront.net'];
        const hasValidDomain = validDomains.some(domain => url.includes(domain));

        // قبول امتدادات الصور الشائعة
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));

        return hasValidDomain || hasImageExtension;
    }

    // تنزيل صورة
    async downloadImage(imageUrl, filePath) {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Referer': 'https://www.netcarshow.com/'
                }
            });

            // التحقق من نوع المحتوى
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`Invalid content type: ${contentType}`);
            }

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    // التحقق من حجم الملف
                    const stats = fs.statSync(filePath);
                    if (stats.size < 1024) { // أقل من 1KB
                        fs.unlinkSync(filePath);
                        reject(new Error('Image too small'));
                    } else {
                        resolve();
                    }
                });
                writer.on('error', reject);
            });

        } catch (error) {
            throw new Error(`فشل تنزيل الصورة: ${error.message}`);
        }
    }

    // تنظيف اسم الملف
    sanitizeFileName(name) {
        return name
            .replace(/[<>:"/\\|?*]/g, '') // إزالة أحرف غير مسموحة في Windows
            .replace(/\s+/g, '_') // استبدال المسافات بـ _
            .replace(/[^\w\-_.]/g, '') // الاحتفاظ بالأحرف والأرقام والرموز المسموحة فقط
            .replace(/_+/g, '_') // دمج _ المتكررة
            .replace(/^_+|_+$/g, '') // إزالة _ من البداية والنهاية
            .substring(0, 100); // تحديد طول الاسم
    }

    // معالجة علامة تجارية واحدة
    async processBrand(brand) {
        try {
            this.currentBrandIndex++;
            console.log(`\n🏭 [${this.currentBrandIndex}/${this.totalBrands}] معالجة علامة ${brand.name}...`);
            
            // العثور على مجلد العلامة التجارية
            const brandDir = this.findBrandDirectory(brand.name);
            if (!brandDir) {
                console.log(`⏭️  تخطي ${brand.name} - لا يوجد مجلد مناسب`);
                return;
            }

            console.log(`📁 مجلد العلامة التجارية: ${path.basename(brandDir)}`);

            // الحصول على جميع موديلات العلامة التجارية
            const models = await this.getBrandModels(brand.url, brand.name);
            if (models.length === 0) {
                console.log(`⚠️  لا توجد موديلات لـ ${brand.name}`);
                return;
            }

            this.stats.brandsProcessed++;
            let modelIndex = 0;

            // معالجة كل موديل
            for (const model of models) {
                modelIndex++;
                console.log(`\n  📱 [${modelIndex}/${models.length}] معالجة ${model.name}...`);

                try {
                    // استخراج الصور
                    const images = await this.extractImagesFromModelPage(model.url, brand.name, model.name);
                    
                    if (images.length === 0) {
                        console.log(`    ⚠️  لا توجد صور لـ ${model.name}`);
                        this.stats.modelsProcessed++;
                        continue;
                    }

                    // تنزيل الصور
                    let imageIndex = 0;
                    for (const image of images) {
                        imageIndex++;

                        // تجنب المكرر
                        if (this.processedImages.has(image.url)) {
                            console.log(`    ⏭️  تخطي صورة مكررة: ${imageIndex}`);
                            this.stats.imagesSkipped++;
                            continue;
                        }

                        // إنشاء اسم الملف
                        const extension = path.extname(new URL(image.url).pathname) || '.jpg';
                        const cleanModelName = this.sanitizeFileName(model.name);
                        const fileName = `${brand.name}_${cleanModelName}_${imageIndex}${extension}`;
                        const filePath = path.join(brandDir, fileName);

                        // تجنب الكتابة فوق الملفات الموجودة
                        if (fs.existsSync(filePath)) {
                            console.log(`    ⏭️  الملف موجود: ${fileName}`);
                            this.stats.imagesSkipped++;
                            continue;
                        }

                        try {
                            await this.downloadImage(image.url, filePath);
                            console.log(`    ✅ تم تنزيل: ${fileName}`);
                            this.processedImages.add(image.url);
                            this.stats.imagesDownloaded++;
                        } catch (error) {
                            console.log(`    ❌ فشل تنزيل ${fileName}: ${error.message}`);
                            this.stats.errors++;
                        }

                        // تأخير بين الصور
                        await this.delay(1000);
                    }

                    this.stats.modelsProcessed++;

                } catch (error) {
                    console.error(`    ❌ خطأ في معالجة موديل ${model.name}: ${error.message}`);
                    this.stats.errors++;
                }

                // تأخير بين الموديلات
                await this.delay(2000);
            }

        } catch (error) {
            console.error(`❌ خطأ في معالجة علامة ${brand.name}: ${error.message}`);
            this.stats.errors++;
        }

        // تأخير بين العلامات التجارية
        await this.delay(5000);
    }

    // عرض الإحصائيات
    displayStats() {
        const runtime = Date.now() - this.stats.startTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((runtime % (1000 * 60)) / 1000);

        console.log(`\n📊 ═══════════════ إحصائيات التشغيل ═══════════════`);
        console.log(`⏱️  وقت التشغيل: ${hours}س ${minutes}د ${seconds}ث`);
        console.log(`🏭 العلامات التجارية المعالجة: ${this.stats.brandsProcessed}`);
        console.log(`📱 الموديلات المعالجة: ${this.stats.modelsProcessed}`);
        console.log(`📸 الصور المنزلة: ${this.stats.imagesDownloaded}`);
        console.log(`⏭️  الصور المتخطاة: ${this.stats.imagesSkipped}`);
        console.log(`❌ الأخطاء: ${this.stats.errors}`);
        console.log(`🎯 العلامة التجارية الحالية: ${this.stats.currentBrand}`);
        console.log(`🔄 الموديل الحالي: ${this.stats.currentModel}`);
        console.log(`═══════════════════════════════════════════════════`);
    }

    // بدء عملية سحب الصور الشاملة
    async startComprehensiveScraping() {
        console.log(`\n🚀 بدء عملية سحب الصور الشاملة من NetCarShow.com`);
        console.log(`════════════════════════════════════════════════════════`);
        
        this.stats.startTime = Date.now();

        try {
            // استخراج جميع العلامات التجارية
            const brands = await this.getAllBrands();
            if (brands.length === 0) {
                console.log(`❌ لم يتم العثور على أي علامات تجارية`);
                return;
            }

            console.log(`\n🎯 سيتم معالجة ${brands.length} علامة تجارية`);
            console.log(`📁 الصور ستحفظ في: ${this.brandDirectoriesPath}`);

            // عرض الإحصائيات كل 10 دقائق
            const statsInterval = setInterval(() => {
                this.displayStats();
            }, 600000);

            // معالجة كل علامة تجارية
            for (const brand of brands) {
                await this.processBrand(brand);
            }

            clearInterval(statsInterval);

            // الإحصائيات النهائية
            console.log(`\n🎉 ═══════════════ اكتملت العملية! ═══════════════`);
            this.displayStats();
            console.log(`\n✅ تم الانتهاء من سحب جميع صور السيارات من NetCarShow.com`);
            console.log(`📁 جميع الصور محفوظة في المجلدات المناسبة`);

        } catch (error) {
            console.error(`❌ خطأ عام في العملية: ${error.message}`);
            this.displayStats();
        }
    }
}

// تشغيل البرنامج
if (import.meta.url === `file://${process.argv[1]}`) {
    const scraper = new ComprehensiveImageScraper();
    
    // التعامل مع إشارات النظام لعرض الإحصائيات
    process.on('SIGINT', () => {
        console.log(`\n\n⏹️  تم إيقاف العملية...`);
        scraper.displayStats();
        process.exit(0);
    });

    scraper.startComprehensiveScraping().catch(console.error);
}

export default ComprehensiveImageScraper;
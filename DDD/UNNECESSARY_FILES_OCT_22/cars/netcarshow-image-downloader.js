import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowImageDownloader {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.downloadedImages = new Set();
        this.imageCounter = 0;
        
        // إحصائيات شاملة
        this.stats = {
            totalBrands: 0,
            processedBrands: 0,
            totalModels: 0,
            processedModels: 0,
            totalImages: 0,
            downloadedImages: 0,
            skippedImages: 0,
            failedImages: 0,
            startTime: Date.now(),
            currentOperation: 'البدء'
        };

        console.log(`\n🎨 ═══════════════════════════════════════════════════════`);
        console.log(`🚗 نظام سحب صور NetCarShow الاحترافي المتقدم`);
        console.log(`🎨 ═══════════════════════════════════════════════════════`);
        console.log(`📁 مسار حفظ الصور: ${this.brandDirectoriesPath}`);
        console.log(`⚡ بدء عملية المسح الشامل...`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchWithRetry(url, options = {}, maxRetries = 5) {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const config = {
                    timeout: 45000,
                    headers: {
                        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        ...options.headers
                    },
                    ...options
                };

                const response = await axios.get(url, config);
                return response;
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
                console.log(`⏳ المحاولة ${attempt} فشلت، إعادة المحاولة خلال ${waitTime/1000}ث...`);
                await this.delay(waitTime);
            }
        }
    }

    // استخراج جميع العلامات التجارية من الصفحة الرئيسية
    async getAllBrands() {
        try {
            console.log(`\n🔍 استخراج جميع العلامات التجارية من الموقع...`);
            this.stats.currentOperation = 'استخراج العلامات التجارية';

            const response = await this.fetchWithRetry(`${this.baseUrl}/`);
            const $ = cheerio.load(response.data);
            
            const brands = [];

            // البحث في المناطق المختلفة للعلامات التجارية
            const searchAreas = ['#Makes', '.makes-section', '[class*="brand"]', '[class*="make"]'];
            
            for (const area of searchAreas) {
                $(area).find('a[href]').each((i, elem) => {
                    const $link = $(elem);
                    const href = $link.attr('href');
                    const text = $link.text().trim();

                    if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/) && text.length > 0) {
                        const brandName = this.extractBrandName(href);
                        if (brandName && brandName !== 'unknown') {
                            brands.push({
                                name: brandName,
                                displayName: text,
                                url: `${this.baseUrl}${href}`,
                                directory: this.findBrandDirectory(brandName)
                            });
                        }
                    }
                });
            }

            // إزالة المكرر وفلترة العلامات التي لها مجلدات
            const uniqueBrands = brands
                .filter((brand, index, self) => 
                    index === self.findIndex(b => b.name === brand.name)
                )
                .filter(brand => brand.directory !== null);

            this.stats.totalBrands = uniqueBrands.length;
            console.log(`✅ تم العثور على ${uniqueBrands.length} علامة تجارية مع مجلدات متاحة`);

            return uniqueBrands;

        } catch (error) {
            console.error(`❌ خطأ في استخراج العلامات التجارية: ${error.message}`);
            return [];
        }
    }

    extractBrandName(url) {
        const match = url.match(/\/([a-zA-Z][a-zA-Z0-9_-]*)\//);
        return match ? match[1].toLowerCase().replace(/-/g, '_') : 'unknown';
    }

    findBrandDirectory(brandName) {
        try {
            if (!fs.existsSync(this.brandDirectoriesPath)) {
                console.error(`❌ مجلد العلامات التجارية غير موجود: ${this.brandDirectoriesPath}`);
                return null;
            }

            const brandDirs = fs.readdirSync(this.brandDirectoriesPath);
            const normalizedBrandName = brandName.toLowerCase().replace(/[-_\s]/g, '');

            // البحث عن تطابق دقيق
            let matchedDir = brandDirs.find(dir => {
                const normalizedDirName = dir.toLowerCase().replace(/[-_\s]/g, '');
                return normalizedDirName === normalizedBrandName;
            });

            // البحث عن تطابق جزئي
            if (!matchedDir) {
                matchedDir = brandDirs.find(dir => {
                    const normalizedDirName = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return normalizedDirName.includes(normalizedBrandName) || 
                           normalizedBrandName.includes(normalizedDirName);
                });
            }

            return matchedDir ? path.join(this.brandDirectoriesPath, matchedDir) : null;

        } catch (error) {
            console.error(`❌ خطأ في البحث عن مجلد ${brandName}: ${error.message}`);
            return null;
        }
    }

    // استخراج جميع صفحات الموديلات لعلامة تجارية
    async getBrandModelPages(brandUrl, brandName) {
        try {
            console.log(`🔍 استخراج صفحات موديلات ${brandName}...`);
            this.stats.currentOperation = `معالجة موديلات ${brandName}`;

            const response = await this.fetchWithRetry(brandUrl);
            const $ = cheerio.load(response.data);

            const modelPages = [];
            const brandSlug = this.extractBrandName(brandUrl);

            // البحث عن جميع روابط الموديلات
            $('a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                // التحقق من أن الرابط يشير إلى موديل في نفس العلامة التجارية
                if (href && href.includes(`/${brandSlug}/`) && 
                    href.split('/').length >= 4 && // على الأقل /brand/model/ أو /brand/year-model/
                    text.length > 0 && text.length < 200) {
                    
                    const fullUrl = href.startsWith('/') ? `${this.baseUrl}${href}` : href;
                    
                    // تجنب المكرر
                    if (!modelPages.find(page => page.url === fullUrl)) {
                        modelPages.push({
                            url: fullUrl,
                            title: text,
                            brand: brandName
                        });
                    }
                }
            });

            this.stats.totalModels += modelPages.length;
            console.log(`✅ تم العثور على ${modelPages.length} صفحة موديل لـ ${brandName}`);
            return modelPages;

        } catch (error) {
            console.error(`❌ خطأ في استخراج موديلات ${brandName}: ${error.message}`);
            return [];
        }
    }

    // استخراج جميع الصور من صفحة موديل
    async extractAllImagesFromPage(pageUrl, brandName, modelTitle) {
        try {
            console.log(`    🖼️  استخراج صور من: ${modelTitle}...`);

            const response = await this.fetchWithRetry(pageUrl);
            const $ = cheerio.load(response.data);

            const images = [];

            // استخراج الصور من IMG tags
            $('img').each((i, elem) => {
                const $img = $(elem);
                const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-original');
                const alt = $img.attr('alt') || '';
                
                if (src && this.isValidCarImage(src, alt)) {
                    let fullUrl = src;
                    if (src.startsWith('/')) {
                        fullUrl = `${this.baseUrl}${src}`;
                    } else if (src.startsWith('//')) {
                        fullUrl = `https:${src}`;
                    }

                    images.push({
                        url: fullUrl,
                        alt: alt,
                        type: 'img-tag',
                        source: pageUrl
                    });
                }
            });

            // استخراج الصور من CSS background-image
            $('[style*="background-image"]').each((i, elem) => {
                const style = $(elem).attr('style') || '';
                const bgImageMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);
                
                if (bgImageMatch && bgImageMatch[1]) {
                    let bgUrl = bgImageMatch[1];
                    if (bgUrl.startsWith('/')) {
                        bgUrl = `${this.baseUrl}${bgUrl}`;
                    }
                    
                    if (this.isValidCarImage(bgUrl, '')) {
                        images.push({
                            url: bgUrl,
                            alt: 'background-image',
                            type: 'css-background',
                            source: pageUrl
                        });
                    }
                }
            });

            // البحث في JSON-LD أو البيانات المنظمة
            $('script[type="application/ld+json"]').each((i, elem) => {
                try {
                    const jsonData = JSON.parse($(elem).html());
                    if (jsonData.image) {
                        const imageUrls = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
                        imageUrls.forEach(imgUrl => {
                            if (typeof imgUrl === 'string' && this.isValidCarImage(imgUrl, '')) {
                                images.push({
                                    url: imgUrl.startsWith('/') ? `${this.baseUrl}${imgUrl}` : imgUrl,
                                    alt: 'structured-data',
                                    type: 'json-ld',
                                    source: pageUrl
                                });
                            }
                        });
                    }
                } catch (e) {
                    // تجاهل أخطاء parsing JSON
                }
            });

            // إزالة المكرر
            const uniqueImages = images.filter((img, index, self) =>
                index === self.findIndex(i => i.url === img.url)
            );

            this.stats.totalImages += uniqueImages.length;
            console.log(`      📸 تم العثور على ${uniqueImages.length} صورة`);
            return uniqueImages;

        } catch (error) {
            console.error(`❌ خطأ في استخراج صور ${modelTitle}: ${error.message}`);
            return [];
        }
    }

    isValidCarImage(url, alt) {
        // تجنب الصور غير المرغوبة
        const excludePatterns = [
            'logo', 'icon', 'button', 'arrow', 'pixel', 'spacer', 'thumbnail',
            'thumb', '_s.', '_xs.', '_sm.', 'avatar', 'profile', 'header',
            'footer', 'navigation', 'menu', 'sidebar', 'banner', 'ad'
        ];

        const lowerUrl = url.toLowerCase();
        const lowerAlt = alt.toLowerCase();

        // تحقق من الأنماط المستبعدة
        if (excludePatterns.some(pattern => 
            lowerUrl.includes(pattern) || lowerAlt.includes(pattern))) {
            return false;
        }

        // تحقق من حجم الصورة في الـ URL (تجنب الصور الصغيرة)
        const sizeMatch = url.match(/(\d+)x(\d+)/);
        if (sizeMatch) {
            const width = parseInt(sizeMatch[1]);
            const height = parseInt(sizeMatch[2]);
            if (width < 200 || height < 150) {
                return false;
            }
        }

        // تحقق من امتدادات الصور الصالحة
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasValidExtension = validExtensions.some(ext => 
            lowerUrl.includes(ext));

        // تحقق من النطاقات المقبولة
        const validDomains = [
            'netcarshow.com', 'netcarshow', 'amazonaws.com', 'cloudfront.net',
            'netdna-ssl.com', 'netdna-cdn.com'
        ];
        const hasValidDomain = validDomains.some(domain => 
            lowerUrl.includes(domain));

        return hasValidExtension || hasValidDomain;
    }

    // تنزيل صورة واحدة
    async downloadSingleImage(imageData, brandDirectory, brandName, modelName, imageIndex) {
        try {
            // إنشاء اسم الملف
            const urlObj = new URL(imageData.url);
            const originalExtension = path.extname(urlObj.pathname) || '.jpg';
            
            const cleanBrandName = this.sanitizeFileName(brandName);
            const cleanModelName = this.sanitizeFileName(modelName);
            const fileName = `${cleanBrandName}_${cleanModelName}_${imageIndex.toString().padStart(3, '0')}${originalExtension}`;
            
            const filePath = path.join(brandDirectory, fileName);

            // تحقق من وجود الملف
            if (fs.existsSync(filePath)) {
                console.log(`        ⏭️  موجود: ${fileName}`);
                this.stats.skippedImages++;
                return false;
            }

            // تنزيل الصورة
            const response = await this.fetchWithRetry(imageData.url, {
                responseType: 'stream',
                headers: {
                    'Referer': imageData.source || this.baseUrl,
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
                }
            });

            // تحقق من نوع المحتوى
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`نوع محتوى غير صالح: ${contentType}`);
            }

            // كتابة الملف
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    try {
                        // تحقق من حجم الملف
                        const stats = fs.statSync(filePath);
                        if (stats.size < 2048) { // أقل من 2KB
                            fs.unlinkSync(filePath);
                            reject(new Error('صورة صغيرة جداً'));
                            return;
                        }

                        console.log(`        ✅ تم: ${fileName} (${Math.round(stats.size/1024)}KB)`);
                        this.stats.downloadedImages++;
                        this.imageCounter++;
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                });
                
                writer.on('error', (error) => {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (e) {}
                    reject(error);
                });
            });

        } catch (error) {
            console.log(`        ❌ فشل: ${error.message}`);
            this.stats.failedImages++;
            return false;
        }
    }

    sanitizeFileName(name) {
        return name
            .replace(/[<>:"/\\|?*\[\]]/g, '') // إزالة أحرف Windows غير المسموحة
            .replace(/\s+/g, '_') // استبدال المسافات
            .replace(/[^\w\-_.]/g, '') // الاحتفاظ بالأحرف المسموحة فقط
            .replace(/_+/g, '_') // دمج الـ underscores
            .replace(/^_+|_+$/g, '') // إزالة _ من البداية والنهاية
            .substring(0, 50); // تحديد الطول
    }

    // معالجة علامة تجارية واحدة
    async processBrandImages(brand) {
        try {
            console.log(`\n🏭 [${this.stats.processedBrands + 1}/${this.stats.totalBrands}] معالجة علامة ${brand.displayName}...`);
            
            if (!brand.directory) {
                console.log(`⏭️  تخطي ${brand.displayName} - لا يوجد مجلد`);
                return;
            }

            console.log(`📁 مجلد الحفظ: ${path.basename(brand.directory)}`);

            // الحصول على جميع صفحات الموديلات
            const modelPages = await this.getBrandModelPages(brand.url, brand.name);
            if (modelPages.length === 0) {
                console.log(`⚠️  لا توجد موديلات لـ ${brand.displayName}`);
                this.stats.processedBrands++;
                return;
            }

            // معالجة كل صفحة موديل
            let processedPages = 0;
            for (const modelPage of modelPages) {
                processedPages++;
                console.log(`\n  📱 [${processedPages}/${modelPages.length}] ${modelPage.title}...`);

                try {
                    // استخراج الصور من الصفحة
                    const images = await this.extractAllImagesFromPage(
                        modelPage.url, 
                        brand.name, 
                        modelPage.title
                    );

                    if (images.length === 0) {
                        console.log(`      ⚠️  لا توجد صور`);
                        this.stats.processedModels++;
                        continue;
                    }

                    // تنزيل جميع الصور
                    let downloadedCount = 0;
                    for (let i = 0; i < images.length; i++) {
                        const success = await this.downloadSingleImage(
                            images[i],
                            brand.directory,
                            brand.name,
                            modelPage.title,
                            i + 1
                        );

                        if (success) downloadedCount++;

                        // تأخير بين الصور
                        await this.delay(800);
                    }

                    console.log(`      📊 تم تنزيل ${downloadedCount}/${images.length} صورة`);
                    this.stats.processedModels++;

                } catch (error) {
                    console.error(`      ❌ خطأ في ${modelPage.title}: ${error.message}`);
                }

                // تأخير بين الموديلات
                await this.delay(1500);
            }

            this.stats.processedBrands++;

        } catch (error) {
            console.error(`❌ خطأ في معالجة ${brand.displayName}: ${error.message}`);
        }

        // تأخير بين العلامات التجارية
        await this.delay(3000);
    }

    // عرض الإحصائيات
    displayProgress() {
        const runtime = Date.now() - this.stats.startTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        
        const brandsProgress = this.stats.totalBrands > 0 ? 
            ((this.stats.processedBrands / this.stats.totalBrands) * 100).toFixed(1) : '0.0';
        
        console.log(`\n📊 ═════════════════ تقرير التقدم ═════════════════`);
        console.log(`⏱️  وقت التشغيل: ${hours}س ${minutes}د`);
        console.log(`🏭 العلامات التجارية: ${this.stats.processedBrands}/${this.stats.totalBrands} (${brandsProgress}%)`);
        console.log(`📱 الموديلات: ${this.stats.processedModels}/${this.stats.totalModels}`);
        console.log(`📸 الصور المنزلة: ${this.stats.downloadedImages}`);
        console.log(`⏭️  الصور المتخطاة: ${this.stats.skippedImages}`);
        console.log(`❌ فشل التنزيل: ${this.stats.failedImages}`);
        console.log(`🔄 العملية الحالية: ${this.stats.currentOperation}`);
        console.log(`══════════════════════════════════════════════════`);
    }

    // بدء عملية سحب الصور الشاملة
    async startImageScraping() {
        console.log(`\n🚀 بدء تنزيل جميع صور NetCarShow.com...`);
        
        try {
            // استخراج جميع العلامات التجارية
            const brands = await this.getAllBrands();
            if (brands.length === 0) {
                console.log(`❌ لم يتم العثور على علامات تجارية`);
                return;
            }

            console.log(`\n🎯 سيتم معالجة ${brands.length} علامة تجارية`);
            
            // عرض تقرير التقدم كل 15 دقيقة
            const progressInterval = setInterval(() => {
                this.displayProgress();
            }, 900000);

            // معالجة كل علامة تجارية
            for (const brand of brands) {
                await this.processBrandImages(brand);
            }

            clearInterval(progressInterval);

            // التقرير النهائي
            console.log(`\n🎉 ═══════════════ اكتملت العملية! ═══════════════`);
            this.displayProgress();
            console.log(`\n✅ تم الانتهاء من تنزيل صور NetCarShow.com`);
            console.log(`📁 جميع الصور محفوظة في: ${this.brandDirectoriesPath}`);
            console.log(`🏆 إجمالي الصور المنزلة: ${this.stats.downloadedImages}`);

        } catch (error) {
            console.error(`❌ خطأ عام: ${error.message}`);
            this.displayProgress();
        }
    }
}

// تشغيل البرنامج
if (import.meta.url === `file://${process.argv[1]}`) {
    const downloader = new NetCarShowImageDownloader();
    
    // التعامل مع إيقاف البرنامج
    process.on('SIGINT', () => {
        console.log(`\n\n⏹️  تم إيقاف العملية بواسطة المستخدم...`);
        downloader.displayProgress();
        process.exit(0);
    });

    downloader.startImageScraping().catch(error => {
        console.error(`❌ خطأ في تشغيل البرنامج: ${error.message}`);
        downloader.displayProgress();
        process.exit(1);
    });
}

export default NetCarShowImageDownloader;
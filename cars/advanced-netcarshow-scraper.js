import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedNetCarShowScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.downloadedUrls = new Set();
        this.failedUrls = new Set();
        
        // كونتر للصور
        this.globalImageCounter = 0;
        
        // إحصائيات شاملة
        this.stats = {
            session: {
                startTime: Date.now(),
                currentBrand: '',
                currentModel: '',
                currentOperation: 'التهيئة'
            },
            brands: {
                total: 0,
                processed: 0,
                successful: 0,
                failed: 0
            },
            models: {
                total: 0,
                processed: 0,
                successful: 0,
                failed: 0
            },
            images: {
                found: 0,
                downloaded: 0,
                skipped: 0,
                failed: 0,
                duplicate: 0
            },
            performance: {
                avgDownloadTime: 0,
                totalDataSize: 0,
                requestCount: 0
            }
        };

        this.printWelcomeMessage();
    }

    printWelcomeMessage() {
        console.log(`\n🎨 ════════════════════════════════════════════════════════════════`);
        console.log(`🚗 NetCarShow.com Advanced Image Scraping System v2.0`);
        console.log(`🎨 ════════════════════════════════════════════════════════════════`);
        console.log(`📁 Target Directory: ${this.brandDirectoriesPath}`);
        console.log(`⚡ Enhanced algorithms for comprehensive image extraction`);
        console.log(`🎯 Features: Smart filtering, duplicate detection, progress tracking`);
        console.log(`🎨 ════════════════════════════════════════════════════════════════\n`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // نظام طلبات محسن مع retry logic
    async makeRequest(url, options = {}) {
        const maxRetries = 5;
        const baseDelay = 1000;
        
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.stats.performance.requestCount++;
                const startTime = Date.now();

                const config = {
                    timeout: 45000,
                    headers: {
                        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                        'Accept': options.responseType === 'stream' ? 
                            'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' : 
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Sec-Fetch-Dest': options.responseType === 'stream' ? 'image' : 'document',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'cross-site',
                        'Referer': this.baseUrl + '/',
                        ...options.headers
                    },
                    ...options
                };

                const response = await axios.get(url, config);
                
                // حساب متوسط وقت التحميل
                const responseTime = Date.now() - startTime;
                this.stats.performance.avgDownloadTime = 
                    (this.stats.performance.avgDownloadTime + responseTime) / 2;

                return response;

            } catch (error) {
                console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed for ${url.substring(0, 50)}...`);
                console.log(`    Error: ${error.message}`);

                if (attempt === maxRetries) {
                    this.failedUrls.add(url);
                    throw error;
                }

                // Exponential backoff with jitter
                const delayTime = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.log(`    Retrying in ${Math.round(delayTime/1000)}s...`);
                await this.delay(delayTime);
            }
        }
    }

    // استخراج جميع العلامات التجارية مع خوارزمية محسنة
    async discoverAllBrands() {
        try {
            console.log(`🔍 Discovering all car brands from NetCarShow.com...`);
            this.stats.session.currentOperation = 'Brand Discovery';

            const response = await this.makeRequest(`${this.baseUrl}/`);
            const $ = cheerio.load(response.data);

            const potentialBrands = new Set();

            // استراتيجية 1: البحث في قسم Makes
            $('#Makes, .makes, [class*="make"], [class*="brand"]').find('a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/) && text) {
                    potentialBrands.add({
                        name: this.extractBrandName(href),
                        displayName: text,
                        url: `${this.baseUrl}${href}`,
                        source: 'makes-section'
                    });
                }
            });

            // استراتيجية 2: البحث في الروابط العامة
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/) && !href.includes('http')) {
                    const text = $(elem).text().trim();
                    if (text && text.length > 1 && text.length < 50) {
                        potentialBrands.add({
                            name: this.extractBrandName(href),
                            displayName: text,
                            url: `${this.baseUrl}${href}`,
                            source: 'general-links'
                        });
                    }
                }
            });

            // تحويل Set إلى Array وإزالة المكرر
            const brandsArray = Array.from(potentialBrands);
            const uniqueBrands = brandsArray.filter((brand, index, self) =>
                index === self.findIndex(b => b.name === brand.name)
            );

            // فلترة العلامات التي لها مجلدات
            const validBrands = uniqueBrands
                .map(brand => ({
                    ...brand,
                    directory: this.findBrandDirectory(brand.name)
                }))
                .filter(brand => brand.directory !== null);

            this.stats.brands.total = validBrands.length;
            
            console.log(`✅ Discovered ${validBrands.length} valid brands with directories`);
            console.log(`   Total potential brands found: ${uniqueBrands.length}`);
            console.log(`   Brands with available directories: ${validBrands.length}`);

            return validBrands;

        } catch (error) {
            console.error(`❌ Brand discovery failed: ${error.message}`);
            return [];
        }
    }

    extractBrandName(url) {
        const match = url.match(/\/([a-zA-Z][a-zA-Z0-9_-]*)\//);
        if (!match) return 'unknown';
        
        return match[1]
            .toLowerCase()
            .replace(/-/g, '_')
            .replace(/\s+/g, '_');
    }

    findBrandDirectory(brandName) {
        try {
            if (!fs.existsSync(this.brandDirectoriesPath)) {
                console.error(`❌ Brand directories path not found: ${this.brandDirectoriesPath}`);
                return null;
            }

            const availableDirs = fs.readdirSync(this.brandDirectoriesPath);
            const normalizedBrandName = brandName.toLowerCase().replace(/[-_\s]/g, '');

            // خوارزمية مطابقة محسنة
            const matchingStrategies = [
                // مطابقة دقيقة
                (dir) => {
                    const normalizedDir = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return normalizedDir === normalizedBrandName;
                },
                // مطابقة جزئية - العلامة التجارية تحتوي على اسم المجلد
                (dir) => {
                    const normalizedDir = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return normalizedBrandName.includes(normalizedDir) && normalizedDir.length > 2;
                },
                // مطابقة جزئية - اسم المجلد يحتوي على العلامة التجارية
                (dir) => {
                    const normalizedDir = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return normalizedDir.includes(normalizedBrandName) && normalizedBrandName.length > 2;
                },
                // مطابقة بالبداية
                (dir) => {
                    const normalizedDir = dir.toLowerCase().replace(/[-_\s]/g, '');
                    return normalizedDir.startsWith(normalizedBrandName) || 
                           normalizedBrandName.startsWith(normalizedDir);
                }
            ];

            for (const strategy of matchingStrategies) {
                const matchedDir = availableDirs.find(strategy);
                if (matchedDir) {
                    return path.join(this.brandDirectoriesPath, matchedDir);
                }
            }

            return null;

        } catch (error) {
            console.error(`❌ Error finding directory for ${brandName}: ${error.message}`);
            return null;
        }
    }

    // اكتشاف جميع صفحات الموديلات لعلامة تجارية
    async discoverBrandModels(brandUrl, brandName) {
        try {
            console.log(`🔍 Discovering models for ${brandName}...`);
            this.stats.session.currentBrand = brandName;
            this.stats.session.currentOperation = `Discovering models for ${brandName}`;

            const response = await this.makeRequest(brandUrl);
            const $ = cheerio.load(response.data);

            const modelPages = new Set();
            const brandSlug = this.extractBrandName(brandUrl);

            // استراتيجية 1: البحث في الروابط المنظمة
            $('.swSBE, .model-link, [class*="model"], [class*="car"]').find('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                
                if (this.isValidModelLink(href, brandSlug, text)) {
                    modelPages.add(this.createModelObject(href, text, brandName));
                }
            });

            // استراتيجية 2: البحث في جميع الروابط
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                
                if (this.isValidModelLink(href, brandSlug, text)) {
                    modelPages.add(this.createModelObject(href, text, brandName));
                }
            });

            const modelArray = Array.from(modelPages);
            this.stats.models.total += modelArray.length;

            console.log(`✅ Discovered ${modelArray.length} model pages for ${brandName}`);
            return modelArray;

        } catch (error) {
            console.error(`❌ Model discovery failed for ${brandName}: ${error.message}`);
            this.stats.brands.failed++;
            return [];
        }
    }

    isValidModelLink(href, brandSlug, text) {
        if (!href || !text) return false;
        
        // يجب أن يحتوي على slug العلامة التجارية
        if (!href.includes(`/${brandSlug}/`)) return false;
        
        // يجب أن يكون رابط موديل (عمق مناسب)
        const segments = href.split('/').filter(s => s);
        if (segments.length < 2 || segments.length > 4) return false;
        
        // فلترة النص
        if (text.length < 3 || text.length > 200) return false;
        
        // تجنب الروابط غير المرغوبة
        const excludePatterns = [
            'wallpaper', 'desktop', 'specification', 'specs', 'review',
            'news', 'gallery', 'video', 'download', 'more', 'all'
        ];
        
        const lowerText = text.toLowerCase();
        const lowerHref = href.toLowerCase();
        
        return !excludePatterns.some(pattern => 
            lowerText.includes(pattern) || lowerHref.includes(pattern));
    }

    createModelObject(href, text, brandName) {
        const fullUrl = href.startsWith('/') ? `${this.baseUrl}${href}` : href;
        
        return JSON.stringify({
            url: fullUrl,
            title: text.trim(),
            brand: brandName,
            slug: href
        });
    }

    // استخراج شامل للصور من صفحة واحدة
    async extractAllImagesFromPage(pageUrl, brandName, modelTitle) {
        try {
            console.log(`    🖼️  Extracting images from: ${modelTitle}...`);
            this.stats.session.currentModel = modelTitle;

            const response = await this.makeRequest(pageUrl);
            const $ = cheerio.load(response.data);

            const discoveredImages = new Set();

            // استراتيجية 1: IMG tags عادية
            $('img').each((i, elem) => {
                const $img = $(elem);
                const sources = [
                    $img.attr('src'),
                    $img.attr('data-src'),
                    $img.attr('data-original'),
                    $img.attr('data-lazy'),
                    $img.attr('data-srcset')?.split(' ')[0]
                ].filter(Boolean);

                sources.forEach(src => {
                    if (this.isValidImageUrl(src, $img.attr('alt') || '')) {
                        discoveredImages.add(this.normalizeImageUrl(src));
                    }
                });
            });

            // استراتيجية 2: CSS Background images
            $('[style*="background-image"]').each((i, elem) => {
                const style = $(elem).attr('style') || '';
                const matches = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/g);
                
                if (matches) {
                    matches.forEach(match => {
                        const urlMatch = match.match(/url\(['"]?([^'")]+)['"]?\)/);
                        if (urlMatch && urlMatch[1]) {
                            const imageUrl = this.normalizeImageUrl(urlMatch[1]);
                            if (this.isValidImageUrl(imageUrl, '')) {
                                discoveredImages.add(imageUrl);
                            }
                        }
                    });
                }
            });

            // استراتيجية 3: JavaScript variables
            $('script').each((i, elem) => {
                const scriptContent = $(elem).html() || '';
                const imageMatches = scriptContent.match(/['"]https?:\/\/[^'"]*\.(jpg|jpeg|png|webp|gif)[^'"]*['"]/gi);
                
                if (imageMatches) {
                    imageMatches.forEach(match => {
                        const cleanUrl = match.replace(/['"]/g, '');
                        if (this.isValidImageUrl(cleanUrl, '')) {
                            discoveredImages.add(cleanUrl);
                        }
                    });
                }
            });

            // استراتيجية 4: JSON-LD structured data
            $('script[type="application/ld+json"]').each((i, elem) => {
                try {
                    const jsonData = JSON.parse($(elem).html() || '{}');
                    this.extractImagesFromJSON(jsonData, discoveredImages);
                } catch (e) {
                    // تجاهل أخطاء parsing
                }
            });

            const imageArray = Array.from(discoveredImages).map(url => ({
                url,
                source: pageUrl,
                brand: brandName,
                model: modelTitle,
                discovered: Date.now()
            }));

            this.stats.images.found += imageArray.length;
            console.log(`      📸 Found ${imageArray.length} images`);
            
            return imageArray;

        } catch (error) {
            console.error(`❌ Image extraction failed for ${modelTitle}: ${error.message}`);
            this.stats.models.failed++;
            return [];
        }
    }

    extractImagesFromJSON(obj, imageSet) {
        if (typeof obj !== 'object' || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach(item => this.extractImagesFromJSON(item, imageSet));
        } else {
            Object.values(obj).forEach(value => {
                if (typeof value === 'string' && this.isValidImageUrl(value, '')) {
                    imageSet.add(this.normalizeImageUrl(value));
                } else if (typeof value === 'object') {
                    this.extractImagesFromJSON(value, imageSet);
                }
            });
        }
    }

    normalizeImageUrl(url) {
        if (!url) return '';
        
        if (url.startsWith('//')) {
            return `https:${url}`;
        } else if (url.startsWith('/')) {
            return `${this.baseUrl}${url}`;
        }
        
        return url;
    }

    isValidImageUrl(url, alt = '') {
        if (!url) return false;

        const lowerUrl = url.toLowerCase();
        const lowerAlt = alt.toLowerCase();

        // فلترة الأنماط غير المرغوبة
        const excludePatterns = [
            'logo', 'icon', 'button', 'arrow', 'pixel', 'spacer', 'thumbnail',
            'thumb', '_s.', '_xs.', '_sm.', 'avatar', 'profile', 'header',
            'footer', 'nav', 'menu', 'sidebar', 'banner', 'ad', 'advertisement'
        ];

        if (excludePatterns.some(pattern => lowerUrl.includes(pattern) || lowerAlt.includes(pattern))) {
            return false;
        }

        // تحقق من الامتدادات
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (!validExtensions.some(ext => lowerUrl.includes(ext))) {
            return false;
        }

        // تحقق من الأبعاد في الـ URL
        const sizeMatch = lowerUrl.match(/(\d+)x(\d+)/);
        if (sizeMatch) {
            const width = parseInt(sizeMatch[1]);
            const height = parseInt(sizeMatch[2]);
            if (width < 300 || height < 200) {
                return false;
            }
        }

        // تحقق من النطاقات الموثوقة
        const trustedDomains = [
            'netcarshow.com', 'netcarshow', 'amazonaws.com', 'cloudfront.net',
            'netdna-ssl.com', 'netdna-cdn.com', 'cloudinary.com'
        ];

        return trustedDomains.some(domain => lowerUrl.includes(domain));
    }

    // تنزيل صورة واحدة مع معلومات مفصلة
    async downloadImageWithDetails(imageData, brandDirectory, imageIndex) {
        try {
            const startTime = Date.now();
            
            // إنشاء اسم ملف ذكي
            const fileName = this.generateSmartFileName(imageData, imageIndex);
            const filePath = path.join(brandDirectory, fileName);

            // تحقق من وجود الملف
            if (fs.existsSync(filePath)) {
                console.log(`        ⏭️  Already exists: ${fileName}`);
                this.stats.images.skipped++;
                return { success: false, reason: 'exists' };
            }

            // تحقق من التكرار
            if (this.downloadedUrls.has(imageData.url)) {
                console.log(`        ⏭️  Duplicate URL: ${fileName}`);
                this.stats.images.duplicate++;
                return { success: false, reason: 'duplicate' };
            }

            // تنزيل الصورة
            const response = await this.makeRequest(imageData.url, {
                responseType: 'stream',
                headers: {
                    'Referer': imageData.source
                }
            });

            // تحقق من نوع المحتوى
            const contentType = response.headers['content-type'];
            if (!contentType?.startsWith('image/')) {
                throw new Error(`Invalid content type: ${contentType}`);
            }

            // كتابة الملف
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            const result = await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    try {
                        const stats = fs.statSync(filePath);
                        const downloadTime = Date.now() - startTime;
                        
                        if (stats.size < 3072) { // أقل من 3KB
                            fs.unlinkSync(filePath);
                            resolve({ success: false, reason: 'too_small' });
                            return;
                        }

                        // تحديث الإحصائيات
                        this.stats.images.downloaded++;
                        this.stats.performance.totalDataSize += stats.size;
                        this.downloadedUrls.add(imageData.url);
                        this.globalImageCounter++;

                        console.log(`        ✅ Downloaded: ${fileName} (${Math.round(stats.size/1024)}KB, ${downloadTime}ms)`);
                        
                        resolve({ 
                            success: true, 
                            size: stats.size, 
                            downloadTime,
                            fileName 
                        });

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

            return result;

        } catch (error) {
            console.log(`        ❌ Download failed: ${error.message}`);
            this.stats.images.failed++;
            return { success: false, reason: 'error', error: error.message };
        }
    }

    generateSmartFileName(imageData, index) {
        const urlObj = new URL(imageData.url);
        const originalExtension = path.extname(urlObj.pathname) || '.jpg';
        
        const cleanBrand = this.sanitizeFileName(imageData.brand);
        const cleanModel = this.sanitizeFileName(imageData.model);
        const paddedIndex = index.toString().padStart(4, '0');
        
        // إضافة timestamp للتأكد من عدم التكرار
        const timestamp = Date.now().toString().slice(-6);
        
        return `${cleanBrand}_${cleanModel}_${paddedIndex}_${timestamp}${originalExtension}`;
    }

    sanitizeFileName(name) {
        return name
            .replace(/[<>:"/\\|?*\[\]]/g, '') // Windows invalid chars
            .replace(/\s+/g, '_') // spaces to underscores
            .replace(/[^\w\-_.]/g, '') // keep only word chars and allowed punctuation
            .replace(/_+/g, '_') // collapse multiple underscores
            .replace(/^_+|_+$/g, '') // trim underscores
            .substring(0, 30); // limit length
    }

    // معالجة علامة تجارية كاملة
    async processBrandComprehensively(brand) {
        try {
            this.stats.brands.processed++;
            console.log(`\n🏭 [${this.stats.brands.processed}/${this.stats.brands.total}] Processing ${brand.displayName}...`);
            console.log(`📁 Directory: ${path.basename(brand.directory)}`);

            // اكتشاف جميع الموديلات
            const modelPages = await this.discoverBrandModels(brand.url, brand.name);
            if (modelPages.length === 0) {
                console.log(`⚠️  No models found for ${brand.displayName}`);
                return;
            }

            let brandImageCount = 0;
            let brandSuccessfulModels = 0;

            // معالجة كل موديل
            for (let i = 0; i < modelPages.length; i++) {
                const modelData = JSON.parse(modelPages[i]);
                this.stats.models.processed++;
                
                console.log(`\n  📱 [${i + 1}/${modelPages.length}] ${modelData.title}...`);

                try {
                    // استخراج الصور
                    const images = await this.extractAllImagesFromPage(
                        modelData.url, 
                        brand.name, 
                        modelData.title
                    );

                    if (images.length === 0) {
                        console.log(`      ⚠️  No images found`);
                        continue;
                    }

                    // تنزيل الصور
                    let modelImageCount = 0;
                    for (let j = 0; j < images.length; j++) {
                        const result = await this.downloadImageWithDetails(
                            images[j], 
                            brand.directory, 
                            j + 1
                        );

                        if (result.success) {
                            modelImageCount++;
                            brandImageCount++;
                        }

                        // تأخير بين الصور
                        await this.delay(500);
                    }

                    console.log(`      📊 Model summary: ${modelImageCount}/${images.length} images downloaded`);
                    if (modelImageCount > 0) {
                        brandSuccessfulModels++;
                        this.stats.models.successful++;
                    }

                } catch (error) {
                    console.error(`      ❌ Model processing failed: ${error.message}`);
                    this.stats.models.failed++;
                }

                // تأخير بين الموديلات
                await this.delay(1000);
            }

            console.log(`\n🏆 Brand summary for ${brand.displayName}:`);
            console.log(`   📱 Models processed: ${modelPages.length}`);
            console.log(`   ✅ Successful models: ${brandSuccessfulModels}`);
            console.log(`   📸 Total images downloaded: ${brandImageCount}`);

            if (brandImageCount > 0) {
                this.stats.brands.successful++;
            }

        } catch (error) {
            console.error(`❌ Brand processing failed for ${brand.displayName}: ${error.message}`);
            this.stats.brands.failed++;
        }

        // تأخير بين العلامات التجارية
        await this.delay(2000);
    }

    // عرض إحصائيات مفصلة
    displayComprehensiveStats() {
        const runtime = Date.now() - this.stats.session.startTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((runtime % (1000 * 60)) / 1000);

        const brandsProgress = this.stats.brands.total > 0 ? 
            ((this.stats.brands.processed / this.stats.brands.total) * 100).toFixed(1) : '0.0';

        const avgImageSize = this.stats.images.downloaded > 0 ? 
            Math.round(this.stats.performance.totalDataSize / this.stats.images.downloaded / 1024) : 0;

        console.log(`\n📊 ════════════════════ COMPREHENSIVE STATS ════════════════════`);
        console.log(`⏱️  Runtime: ${hours}h ${minutes}m ${seconds}s`);
        console.log(`🔄 Current: ${this.stats.session.currentOperation}`);
        console.log(`📍 Brand: ${this.stats.session.currentBrand}`);
        console.log(`🎯 Model: ${this.stats.session.currentModel}`);
        console.log(`\n🏭 BRANDS:`);
        console.log(`   Total: ${this.stats.brands.total}`);
        console.log(`   Processed: ${this.stats.brands.processed}/${this.stats.brands.total} (${brandsProgress}%)`);
        console.log(`   Successful: ${this.stats.brands.successful}`);
        console.log(`   Failed: ${this.stats.brands.failed}`);
        console.log(`\n📱 MODELS:`);
        console.log(`   Total discovered: ${this.stats.models.total}`);
        console.log(`   Processed: ${this.stats.models.processed}`);
        console.log(`   Successful: ${this.stats.models.successful}`);
        console.log(`   Failed: ${this.stats.models.failed}`);
        console.log(`\n📸 IMAGES:`);
        console.log(`   Found: ${this.stats.images.found}`);
        console.log(`   Downloaded: ${this.stats.images.downloaded}`);
        console.log(`   Skipped (existing): ${this.stats.images.skipped}`);
        console.log(`   Failed: ${this.stats.images.failed}`);
        console.log(`   Duplicates: ${this.stats.images.duplicate}`);
        console.log(`\n⚡ PERFORMANCE:`);
        console.log(`   Total data: ${Math.round(this.stats.performance.totalDataSize / (1024 * 1024))} MB`);
        console.log(`   Avg image size: ${avgImageSize} KB`);
        console.log(`   Avg download time: ${Math.round(this.stats.performance.avgDownloadTime)} ms`);
        console.log(`   Total requests: ${this.stats.performance.requestCount}`);
        console.log(`═══════════════════════════════════════════════════════════════`);
    }

    // بدء عملية الكشط الشاملة
    async startAdvancedScraping() {
        console.log(`🚀 Starting comprehensive NetCarShow.com image scraping...`);
        
        try {
            // اكتشاف العلامات التجارية
            const brands = await this.discoverAllBrands();
            if (brands.length === 0) {
                console.log(`❌ No brands discovered`);
                return;
            }

            console.log(`\n🎯 Will process ${brands.length} brands`);
            console.log(`📊 Progress will be displayed every 10 minutes`);

            // عرض الإحصائيات دورياً
            const statsInterval = setInterval(() => {
                this.displayComprehensiveStats();
            }, 600000); // كل 10 دقائق

            // معالجة جميع العلامات التجارية
            for (const brand of brands) {
                await this.processBrandComprehensively(brand);
            }

            clearInterval(statsInterval);

            // الإحصائيات النهائية
            console.log(`\n🎉 ═══════════════════ SCRAPING COMPLETED! ═══════════════════`);
            this.displayComprehensiveStats();
            
            console.log(`\n✅ NetCarShow.com comprehensive scraping finished successfully!`);
            console.log(`📁 All images saved to: ${this.brandDirectoriesPath}`);
            console.log(`🏆 Total images downloaded: ${this.stats.images.downloaded}`);
            console.log(`💾 Total data downloaded: ${Math.round(this.stats.performance.totalDataSize / (1024 * 1024))} MB`);

        } catch (error) {
            console.error(`❌ Critical error in scraping process: ${error.message}`);
            this.displayComprehensiveStats();
        }
    }
}

// تشغيل البرنامج
if (import.meta.url === `file://${process.argv[1]}`) {
    const scraper = new AdvancedNetCarShowScraper();
    
    // معالجة إشارات النظام
    process.on('SIGINT', () => {
        console.log(`\n\n⏹️  Process interrupted by user...`);
        scraper.displayComprehensiveStats();
        console.log(`\n📋 Session summary saved. You can resume later.`);
        process.exit(0);
    });

    process.on('uncaughtException', (error) => {
        console.error(`\n❌ Uncaught exception: ${error.message}`);
        scraper.displayComprehensiveStats();
        process.exit(1);
    });

    scraper.startAdvancedScraping().catch(error => {
        console.error(`❌ Scraper failed to start: ${error.message}`);
        scraper.displayComprehensiveStats();
        process.exit(1);
    });
}

export default AdvancedNetCarShowScraper;
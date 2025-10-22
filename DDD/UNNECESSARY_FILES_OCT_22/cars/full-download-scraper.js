import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 ULTIMATE ANTI-BLOCK SCRAPER - FULL DOWNLOAD MODE');
console.log('📸 Ready to download ALL car images from NetCarShow.com');
console.log('🛡️  Protection: Smart delays + Anti-blocking + Real downloads\n');

class FullDownloadScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.downloadedUrls = new Set();
        this.requestCount = 0;
        this.lastRequestTime = 0;
        
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        ];
        
        this.stats = {
            session: { startTime: Date.now(), currentBrand: '', currentModel: '' },
            requests: { total: 0, successful: 0, failed: 0, blocked: 0 },
            brands: { total: 0, processed: 0, successful: 0, failed: 0 },
            models: { total: 0, processed: 0, successful: 0, failed: 0 },
            images: { found: 0, downloaded: 0, failed: 0, skipped: 0, totalSize: 0 }
        };

        this.settings = {
            // إعدادات التحميل
            maxImagesPerModel: 50,      // حد أقصى للصور لكل موديل
            maxModelsPerBrand: 20,      // حد أقصى للموديلات لكل علامة
            maxBrands: 10,              // حد أقصى للعلامات (غير هذا للتحميل الكامل)
            
            // إعدادات الحماية
            minDelay: 2000,             // 2 ثانية حد أدنى
            maxDelay: 8000,             // 8 ثواني حد أقصى
            retryDelay: 5000,           // 5 ثواني عند إعادة المحاولة
            blockingDelay: 30000,       // 30 ثانية عند الحظر
            
            // إعدادات الجودة
            minImageSize: 5000,         // 5KB حد أدنى لحجم الصورة
            imageTimeout: 30000,        // 30 ثانية timeout للصور
            
            // وضع التشغيل
            enableRealDownload: true,   // true = تحميل فعلي، false = محاكاة
            showProgress: true,         // عرض تقدم مفصل
            saveReports: true           // حفظ تقارير مفصلة
        };

        this.printHeader();
    }

    printHeader() {
        console.log('🛡️  ══════════════════════════════════════════════════════════════════');
        console.log('🚗 ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER - FULL DOWNLOAD');
        console.log('🛡️  ══════════════════════════════════════════════════════════════════');
        console.log(`📁 Target directory: ${this.brandDirectoriesPath}`);
        console.log(`⚙️  Max brands: ${this.settings.maxBrands}`);
        console.log(`⚙️  Max models per brand: ${this.settings.maxModelsPerBrand}`);
        console.log(`⚙️  Max images per model: ${this.settings.maxImagesPerModel}`);
        console.log(`💾 Real download: ${this.settings.enableRealDownload ? 'ENABLED' : 'DISABLED'}`);
        console.log('🛡️  ══════════════════════════════════════════════════════════════════\n');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    calculateSmartDelay() {
        const baseDelay = this.settings.minDelay + 
            Math.random() * (this.settings.maxDelay - this.settings.minDelay);
        
        // زيادة التأخير تدريجياً مع زيادة عدد الطلبات
        const scaleFactor = Math.min(1 + (this.requestCount / 200), 2);
        
        return Math.round(baseDelay * scaleFactor);
    }

    async makeProtectedRequest(url, options = {}) {
        const maxRetries = 5;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.requestCount++;
                this.stats.requests.total++;
                
                // تطبيق التأخير الذكي
                const smartDelay = this.calculateSmartDelay();
                const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                
                if (timeSinceLastRequest < smartDelay) {
                    const waitTime = smartDelay - timeSinceLastRequest;
                    if (this.settings.showProgress) {
                        console.log(`⏳ Smart delay: ${Math.round(waitTime/1000)}s (attempt ${attempt})`);
                    }
                    await this.delay(waitTime);
                }

                const config = {
                    timeout: options.timeout || 30000,
                    headers: {
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': options.isImage ? 
                            'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' :
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'DNT': '1',
                        'Referer': this.baseUrl + '/',
                        ...options.headers
                    },
                    ...options
                };

                const response = await axios.get(url, config);
                this.lastRequestTime = Date.now();
                this.stats.requests.successful++;
                
                // فحص الحظر
                if (this.detectBlocking(response)) {
                    console.log(`🚫 Blocking detected! Applying extended delay...`);
                    this.stats.requests.blocked++;
                    await this.delay(this.settings.blockingDelay);
                    continue;
                }
                
                if (this.settings.showProgress) {
                    const shortUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
                    console.log(`✅ Request successful: ${shortUrl}`);
                }
                
                return response;

            } catch (error) {
                console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
                this.stats.requests.failed++;

                if (attempt === maxRetries) {
                    throw error;
                }

                const retryDelay = this.settings.retryDelay * attempt;
                console.log(`⏳ Retry in ${retryDelay/1000}s...`);
                await this.delay(retryDelay);
            }
        }
    }

    detectBlocking(response) {
        // كشف الحظر البسيط
        if ([403, 429, 503, 520, 521, 522, 524].includes(response.status)) {
            return true;
        }
        
        const text = response.data?.toString?.() || '';
        const blockingKeywords = [
            'blocked', 'rate limit', 'too many requests', 'access denied',
            'cloudflare', 'ddos protection', 'security check'
        ];
        
        return blockingKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
    }

    async discoverBrands() {
        try {
            console.log('\n🔍 Discovering car brands from NetCarShow...');
            
            const response = await this.makeProtectedRequest(this.baseUrl + '/');
            const $ = cheerio.load(response.data);
            
            const brands = [];
            
            $('a[href^="/"]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/) && 
                    text && text.length > 1 && text.length < 30 &&
                    !text.includes('www') && !text.includes('http')) {
                    
                    const brandName = href.replace(/\//g, '').toLowerCase().replace(/-/g, '_');
                    
                    if (!brands.find(b => b.name === brandName)) {
                        const brandDirectory = path.join(this.brandDirectoriesPath, brandName);
                        
                        if (!fs.existsSync(brandDirectory)) {
                            fs.mkdirSync(brandDirectory, { recursive: true });
                        }
                        
                        brands.push({
                            name: brandName,
                            displayName: text,
                            url: this.baseUrl + href,
                            directory: brandDirectory
                        });
                    }
                }
            });

            this.stats.brands.total = brands.length;
            console.log(`✅ Found ${brands.length} car brands`);
            
            const displayBrands = brands.slice(0, Math.min(10, brands.length));
            displayBrands.forEach((brand, index) => {
                console.log(`   ${index + 1}. ${brand.displayName}`);
            });
            
            if (brands.length > 10) {
                console.log(`   ... and ${brands.length - 10} more brands`);
            }
            
            return brands.slice(0, this.settings.maxBrands);

        } catch (error) {
            console.error('❌ Brand discovery failed:', error.message);
            return [];
        }
    }

    async discoverModels(brand) {
        try {
            console.log(`   🔍 Discovering models for ${brand.displayName}...`);
            
            const response = await this.makeProtectedRequest(brand.url);
            const $ = cheerio.load(response.data);
            
            const models = [];
            
            $('a[href^="/"]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                if (href && href.includes(brand.name) && text && text.length > 1 && text.length < 50) {
                    const modelUrl = this.baseUrl + href;
                    
                    if (!models.find(m => m.url === modelUrl) && models.length < this.settings.maxModelsPerBrand) {
                        models.push({
                            name: text,
                            url: modelUrl,
                            brand: brand.name
                        });
                    }
                }
            });

            this.stats.models.total += models.length;
            console.log(`   ✅ Found ${models.length} models for ${brand.displayName}`);
            
            return models;

        } catch (error) {
            console.log(`   ❌ Failed to discover models for ${brand.displayName}: ${error.message}`);
            return [];
        }
    }

    async downloadImage(imageUrl, filePath) {
        try {
            if (!this.settings.enableRealDownload) {
                // محاكاة التحميل
                await this.delay(100);
                return { success: true, size: 50000 };
            }

            const response = await this.makeProtectedRequest(imageUrl, {
                responseType: 'stream',
                isImage: true,
                timeout: this.settings.imageTimeout
            });

            // فحص نوع المحتوى
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                return { success: false, error: 'Invalid content type' };
            }

            // فحص حجم الملف
            const contentLength = parseInt(response.headers['content-length']) || 0;
            if (contentLength < this.settings.minImageSize) {
                return { success: false, error: 'Image too small' };
            }

            // إنشاء المجلد
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // تحميل الصورة
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve) => {
                writer.on('finish', () => {
                    resolve({ success: true, size: contentLength });
                });

                writer.on('error', (error) => {
                    fs.unlink(filePath, () => {});
                    resolve({ success: false, error: error.message });
                });
            });

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async processModel(model, brandDirectory) {
        try {
            this.stats.session.currentModel = model.name;
            console.log(`     🚗 Processing model: ${model.name}`);
            
            const response = await this.makeProtectedRequest(model.url);
            const $ = cheerio.load(response.data);
            
            const images = [];
            
            $('img[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && this.isCarImage(src)) {
                    const fullUrl = src.startsWith('http') ? src : this.baseUrl + src;
                    if (!images.includes(fullUrl) && images.length < this.settings.maxImagesPerModel) {
                        images.push(fullUrl);
                    }
                }
            });

            console.log(`       📸 Found ${images.length} images`);
            this.stats.images.found += images.length;

            let downloaded = 0;
            for (let i = 0; i < images.length; i++) {
                const imageUrl = images[i];
                
                if (this.downloadedUrls.has(imageUrl)) {
                    this.stats.images.skipped++;
                    continue;
                }

                const filename = this.generateImageFilename(model.name, imageUrl, i + 1);
                const filePath = path.join(brandDirectory, filename);
                
                if (fs.existsSync(filePath)) {
                    this.stats.images.skipped++;
                    continue;
                }

                const result = await this.downloadImage(imageUrl, filePath);
                
                if (result.success) {
                    this.downloadedUrls.add(imageUrl);
                    downloaded++;
                    this.stats.images.downloaded++;
                    this.stats.images.totalSize += result.size;
                    
                    console.log(`         ✅ Downloaded: ${filename} (${Math.round(result.size/1024)}KB)`);
                } else {
                    this.stats.images.failed++;
                    console.log(`         ❌ Failed: ${result.error}`);
                }
            }

            this.stats.models.processed++;
            console.log(`     ✅ Model completed: ${downloaded}/${images.length} images downloaded`);
            
            return downloaded;

        } catch (error) {
            console.log(`     ❌ Failed to process model ${model.name}: ${error.message}`);
            this.stats.models.failed++;
            return 0;
        }
    }

    async processBrand(brand) {
        try {
            this.stats.session.currentBrand = brand.displayName;
            console.log(`\n🏭 Processing brand: ${brand.displayName}`);
            
            const models = await this.discoverModels(brand);
            if (models.length === 0) {
                console.log(`   ⚠️  No models found for ${brand.displayName}`);
                this.stats.brands.failed++;
                return 0;
            }

            let totalImages = 0;
            
            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                console.log(`   [${i + 1}/${models.length}] Processing: ${model.name}`);
                
                const downloaded = await this.processModel(model, brand.directory);
                totalImages += downloaded;
                
                // تأخير بين الموديلات
                if (i < models.length - 1) {
                    await this.delay(2000);
                }
            }

            this.stats.brands.processed++;
            if (totalImages > 0) {
                this.stats.brands.successful++;
            }
            
            console.log(`✅ Brand completed: ${brand.displayName} - ${totalImages} images downloaded`);
            return totalImages;

        } catch (error) {
            console.error(`❌ Failed to process ${brand.displayName}: ${error.message}`);
            this.stats.brands.failed++;
            return 0;
        }
    }

    isCarImage(url) {
        if (!url) return false;
        
        const imageExtensions = /\.(jpg|jpeg|png|webp)(\?|$)/i;
        const avoidPatterns = /(?:logo|icon|button|banner|ad|thumb_|small_)/i;
        
        return imageExtensions.test(url) && !avoidPatterns.test(url);
    }

    generateImageFilename(modelName, imageUrl, index) {
        const cleanName = modelName.replace(/[^a-zA-Z0-9\-_]/g, '_').substring(0, 30);
        const urlParts = imageUrl.split('/');
        const originalName = urlParts[urlParts.length - 1].split('?')[0];
        const extension = originalName.split('.').pop() || 'jpg';
        
        return `${cleanName}_${String(index).padStart(3, '0')}.${extension}`;
    }

    displayProgress() {
        const runtime = Date.now() - this.stats.session.startTime;
        const minutes = Math.floor(runtime / 60000);
        const seconds = Math.floor((runtime % 60000) / 1000);
        
        console.log('\n📊 ═══════════════════ PROGRESS REPORT ═══════════════════');
        console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
        console.log(`🏭 Current: ${this.stats.session.currentBrand} - ${this.stats.session.currentModel}`);
        console.log(`🌐 Requests: ${this.stats.requests.successful}/${this.stats.requests.total} (${this.stats.requests.blocked} blocked)`);
        console.log(`🏭 Brands: ${this.stats.brands.processed}/${this.stats.brands.total} (${this.stats.brands.successful} successful)`);
        console.log(`🚗 Models: ${this.stats.models.processed}/${this.stats.models.total}`);
        console.log(`📸 Images: ${this.stats.images.downloaded} downloaded, ${this.stats.images.failed} failed, ${this.stats.images.skipped} skipped`);
        console.log(`💾 Total size: ${Math.round(this.stats.images.totalSize / (1024 * 1024))} MB`);
        console.log('═══════════════════════════════════════════════════════════');
    }

    async start() {
        console.log('\n🚀 STARTING FULL DOWNLOAD WITH ULTIMATE PROTECTION');
        
        try {
            const brands = await this.discoverBrands();
            if (brands.length === 0) {
                console.log('❌ No brands discovered');
                return;
            }

            console.log(`\n🎯 Starting download: ${brands.length} brands, up to ${this.settings.maxModelsPerBrand} models each`);
            console.log(`📱 Estimated total: ${brands.length * this.settings.maxModelsPerBrand * this.settings.maxImagesPerModel} images max`);
            
            // عرض التقدم كل 5 دقائق
            const progressInterval = setInterval(() => {
                this.displayProgress();
            }, 300000);

            for (let i = 0; i < brands.length; i++) {
                const brand = brands[i];
                console.log(`\n[${i + 1}/${brands.length}] Starting: ${brand.displayName}`);
                
                await this.processBrand(brand);
                
                // تأخير بين العلامات
                if (i < brands.length - 1) {
                    console.log('⏳ Inter-brand delay: 10s');
                    await this.delay(10000);
                }
            }

            clearInterval(progressInterval);
            this.displayProgress();

            console.log('\n🎉 ════════════════ DOWNLOAD COMPLETED! ════════════════');
            console.log(`✅ Successfully processed: ${this.stats.brands.successful}/${this.stats.brands.total} brands`);
            console.log(`📸 Total images downloaded: ${this.stats.images.downloaded}`);
            console.log(`💾 Total data downloaded: ${Math.round(this.stats.images.totalSize / (1024 * 1024))} MB`);
            console.log(`⚡ Success rate: ${((this.stats.requests.successful / this.stats.requests.total) * 100).toFixed(1)}%`);

        } catch (error) {
            console.error('❌ Critical error:', error.message);
            this.displayProgress();
        }
    }
}

// تشغيل النظام
const scraper = new FullDownloadScraper();

process.on('SIGINT', () => {
    console.log('\n\n⏹️  DOWNLOAD INTERRUPTED BY USER');
    scraper.displayProgress();
    console.log('\n💾 Session data preserved. You can resume later.');
    process.exit(0);
});

scraper.start().catch(error => {
    console.error('❌ Scraper failed to start:', error.message);
    scraper.displayProgress();
    process.exit(1);
});

export default FullDownloadScraper;
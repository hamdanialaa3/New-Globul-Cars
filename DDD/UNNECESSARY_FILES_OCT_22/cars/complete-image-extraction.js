// إضافة منطق استخراج الصور الكامل لكلاس UltimateAntiBlockScraper

import path from 'path';
import fs from 'fs';
import * as cheerio from 'cheerio';

/**
 * إضافة دوال استخراج الصور المتقدمة
 */
export class ImageExtractionModule {
    
    // استخراج صور الموديلات من صفحة العلامة التجارية
    async extractBrandModelsWithProtection(scraper, brandUrl, brandDirectory) {
        try {
            console.log(`🔍 Extracting models from: ${brandUrl}`);
            scraper.stats.session.currentOperation = 'Extracting Brand Models';

            const response = await scraper.makeUltimateProtectedRequest(brandUrl);
            const $ = cheerio.load(response.data);
            
            const models = [];

            // استراتيجيات متعددة لاكتشاف الموديلات
            const modelSelectors = [
                '.model-item a[href*="/"]',
                '.car-model a[href*="/"]',
                '.vehicle-link a[href*="/"]',
                'a[href*="/"][title*=""]',
                '.grid-item a[href*="/"]',
                'div[class*="model"] a[href*="/"]',
                'li a[href*="/"]',
                '.thumb a[href*="/"]'
            ];

            for (const selector of modelSelectors) {
                $(selector).each((i, elem) => {
                    const $link = $(elem);
                    const href = $link.attr('href');
                    const title = $link.attr('title') || $link.text().trim();
                    const imgSrc = $link.find('img').attr('src') || $link.find('img').attr('data-src');

                    if (href && href.includes('/') && !models.find(m => m.url === href)) {
                        let modelUrl = href.startsWith('http') ? href : `${scraper.baseUrl}${href}`;
                        
                        models.push({
                            name: title || `Model_${models.length + 1}`,
                            url: modelUrl,
                            thumbnailUrl: imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${scraper.baseUrl}${imgSrc}`) : null,
                            brandDirectory: brandDirectory
                        });
                    }
                });

                if (models.length > 0) break; // استخدم أول استراتيجية ناجحة
            }

            scraper.stats.models.total += models.length;
            console.log(`✅ Found ${models.length} models for brand`);
            
            return models;

        } catch (error) {
            console.error(`❌ Failed to extract brand models: ${error.message}`);
            return [];
        }
    }

    // استخراج جميع الصور من صفحة الموديل
    async extractModelImagesWithProtection(scraper, modelUrl, modelName, brandDirectory) {
        try {
            console.log(`📸 Extracting images for: ${modelName}`);
            scraper.stats.session.currentModel = modelName;
            scraper.stats.session.currentOperation = 'Extracting Model Images';

            const response = await scraper.makeUltimateProtectedRequest(modelUrl);
            const $ = cheerio.load(response.data);
            
            const images = new Set(); // استخدم Set لتجنب التكرار

            // 1. الصور المباشرة في IMG tags
            $('img[src], img[data-src], img[data-original]').each((i, elem) => {
                const $img = $(elem);
                const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-original');
                
                if (this.isValidCarImageUrl(src)) {
                    const fullUrl = src.startsWith('http') ? src : `${scraper.baseUrl}${src}`;
                    images.add(fullUrl);
                }
            });

            // 2. الصور في روابط gallery
            $('a[href*="image"], a[href*="photo"], a[href*="gallery"], a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".webp"]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                
                if (this.isValidCarImageUrl(href)) {
                    const fullUrl = href.startsWith('http') ? href : `${scraper.baseUrl}${href}`;
                    images.add(fullUrl);
                }
            });

            // 3. صور CSS background
            $('*').each((i, elem) => {
                const $elem = $(elem);
                const style = $elem.attr('style') || '';
                const backgroundMatches = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi);
                
                if (backgroundMatches) {
                    backgroundMatches.forEach(match => {
                        const urlMatch = match.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
                        if (urlMatch && this.isValidCarImageUrl(urlMatch[1])) {
                            const fullUrl = urlMatch[1].startsWith('http') ? urlMatch[1] : `${scraper.baseUrl}${urlMatch[1]}`;
                            images.add(fullUrl);
                        }
                    });
                }
            });

            // 4. JSON-LD structured data
            $('script[type="application/ld+json"]').each((i, elem) => {
                try {
                    const jsonData = JSON.parse($(elem).html());
                    this.extractImagesFromJsonLd(jsonData, images, scraper.baseUrl);
                } catch (e) {
                    // تجاهل أخطاء JSON
                }
            });

            // 5. معرض الصور الديناميكي
            await this.extractDynamicGalleryImages(scraper, $, modelUrl, images);

            const imageArray = Array.from(images);
            scraper.stats.images.found += imageArray.length;

            console.log(`✅ Found ${imageArray.length} images for ${modelName}`);

            // تحميل الصور
            let downloadedCount = 0;
            for (let i = 0; i < imageArray.length; i++) {
                const imageUrl = imageArray[i];
                const filename = this.generateImageFilename(modelName, imageUrl, i + 1);
                const success = await this.downloadImageWithProtection(scraper, imageUrl, brandDirectory, filename);
                
                if (success) {
                    downloadedCount++;
                    scraper.stats.images.downloaded++;
                } else {
                    scraper.stats.images.failed++;
                }

                // تقرير تقدم كل 10 صور
                if ((i + 1) % 10 === 0) {
                    console.log(`   📊 Progress: ${i + 1}/${imageArray.length} images processed (${downloadedCount} downloaded)`);
                }
            }

            scraper.stats.models.processed++;
            console.log(`✅ Model complete: ${downloadedCount}/${imageArray.length} images downloaded`);
            
            return downloadedCount;

        } catch (error) {
            console.error(`❌ Failed to extract images for ${modelName}: ${error.message}`);
            scraper.stats.models.failed++;
            return 0;
        }
    }

    // استخراج الصور الديناميكية من galleries
    async extractDynamicGalleryImages(scraper, $, modelUrl, images) {
        try {
            // البحث عن روابط المعارض
            const galleryLinks = [];
            
            $('a[href*="gallery"], a[href*="photos"], a[href*="images"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    const fullUrl = href.startsWith('http') ? href : `${scraper.baseUrl}${href}`;
                    galleryLinks.push(fullUrl);
                }
            });

            // معالجة كل رابط معرض
            for (const galleryUrl of galleryLinks.slice(0, 3)) { // حد أقصى 3 معارض
                try {
                    console.log(`   🖼️  Extracting gallery: ${galleryUrl}`);
                    const galleryResponse = await scraper.makeUltimateProtectedRequest(galleryUrl);
                    const gallery$ = cheerio.load(galleryResponse.data);
                    
                    // استخراج صور من المعرض
                    gallery$('img[src], img[data-src]').each((i, elem) => {
                        const src = gallery$(elem).attr('src') || gallery$(elem).attr('data-src');
                        if (this.isValidCarImageUrl(src)) {
                            const fullUrl = src.startsWith('http') ? src : `${scraper.baseUrl}${src}`;
                            images.add(fullUrl);
                        }
                    });

                } catch (error) {
                    console.log(`   ⚠️  Gallery extraction failed: ${error.message}`);
                }
            }

        } catch (error) {
            console.log(`   ⚠️  Dynamic gallery extraction failed: ${error.message}`);
        }
    }

    // استخراج صور من JSON-LD
    extractImagesFromJsonLd(jsonData, images, baseUrl) {
        if (typeof jsonData !== 'object') return;

        // البحث عن خصائص الصور في البيانات
        const searchForImages = (obj) => {
            if (typeof obj !== 'object' || obj === null) return;

            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && this.isValidCarImageUrl(value)) {
                    const fullUrl = value.startsWith('http') ? value : `${baseUrl}${value}`;
                    images.add(fullUrl);
                } else if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (typeof item === 'string' && this.isValidCarImageUrl(item)) {
                            const fullUrl = item.startsWith('http') ? item : `${baseUrl}${item}`;
                            images.add(fullUrl);
                        } else if (typeof item === 'object') {
                            searchForImages(item);
                        }
                    });
                } else if (typeof value === 'object') {
                    searchForImages(value);
                }
            }
        };

        searchForImages(jsonData);
    }

    // التحقق من صحة رابط الصورة
    isValidCarImageUrl(url) {
        if (!url || typeof url !== 'string') return false;

        // رابط يحتوي على امتداد صورة
        const imageExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i;
        
        // أو يحتوي على كلمات مفتاحية للسيارات
        const carKeywords = /(?:car|auto|vehicle|image|photo|gallery|picture|thumb)/i;
        
        // أو موقع NetCarShow
        const isNetCarShow = url.includes('netcarshow.com');
        
        // تجنب الصور الصغيرة أو الأيقونات
        const avoidPatterns = /(?:icon|logo|favicon|button|arrow|nav|menu|social|banner|ad|sponsor)/i;
        
        return (imageExtensions.test(url) || (carKeywords.test(url) && isNetCarShow)) && 
               !avoidPatterns.test(url) && 
               url.length < 500; // تجنب الروابط الطويلة جداً
    }

    // توليد اسم ملف للصورة
    generateImageFilename(modelName, imageUrl, index) {
        const cleanModelName = modelName.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const urlParts = imageUrl.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        
        // استخراج الامتداد
        const extensionMatch = originalFilename.match(/\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i);
        const extension = extensionMatch ? extensionMatch[1] : 'jpg';
        
        return `${cleanModelName}_${String(index).padStart(3, '0')}.${extension}`;
    }

    // تحميل صورة مع الحماية الكاملة
    async downloadImageWithProtection(scraper, imageUrl, brandDirectory, filename) {
        try {
            // تحقق من وجود الملف
            const filePath = path.join(brandDirectory, filename);
            if (fs.existsSync(filePath)) {
                scraper.stats.images.skipped++;
                return true;
            }

            // تحقق من قائمة الروابط المحملة
            if (scraper.downloadedUrls.has(imageUrl)) {
                scraper.stats.images.duplicate++;
                return true;
            }

            console.log(`   ⬇️  Downloading: ${filename}`);

            const response = await scraper.makeUltimateProtectedRequest(imageUrl, {
                responseType: 'stream',
                headers: {
                    'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });

            // التحقق من نوع المحتوى
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                console.log(`   ❌ Invalid content type: ${contentType}`);
                return false;
            }

            // التحقق من حجم الملف
            const contentLength = parseInt(response.headers['content-length']) || 0;
            if (contentLength < 1000) { // أقل من 1KB
                console.log(`   ❌ File too small: ${contentLength} bytes`);
                return false;
            }

            // إنشاء المجلد إذا لم يكن موجود
            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            // تحميل الملف
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve) => {
                writer.on('finish', () => {
                    scraper.downloadedUrls.add(imageUrl);
                    scraper.stats.performance.totalDataSize += contentLength;
                    console.log(`   ✅ Downloaded: ${filename} (${Math.round(contentLength/1024)}KB)`);
                    resolve(true);
                });

                writer.on('error', (error) => {
                    console.log(`   ❌ Download failed: ${error.message}`);
                    fs.unlink(filePath, () => {}); // حذف الملف المعطوب
                    resolve(false);
                });
            });

        } catch (error) {
            console.log(`   ❌ Download error for ${filename}: ${error.message}`);
            return false;
        }
    }

    // معالجة علامة تجارية كاملة
    async processBrandWithUltimateProtection(scraper, brand) {
        try {
            console.log(`\n🏭 Processing brand: ${brand.displayName}`);
            scraper.stats.session.currentBrand = brand.displayName;
            scraper.stats.session.currentOperation = `Processing ${brand.displayName}`;

            // استخراج موديلات العلامة التجارية
            const models = await this.extractBrandModelsWithProtection(scraper, brand.url, brand.directory);
            
            if (models.length === 0) {
                console.log(`   ⚠️  No models found for ${brand.displayName}`);
                scraper.stats.brands.failed++;
                return 0;
            }

            let totalDownloaded = 0;

            // معالجة كل موديل
            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                console.log(`\n   🚗 [${i + 1}/${models.length}] Processing: ${model.name}`);
                
                const downloadedCount = await this.extractModelImagesWithProtection(
                    scraper, 
                    model.url, 
                    model.name, 
                    brand.directory
                );

                totalDownloaded += downloadedCount;

                // تأخير بين الموديلات
                const modelDelay = scraper.calculateIntelligentDelay() / 2;
                console.log(`   ⏳ Inter-model delay: ${Math.round(modelDelay/1000)}s`);
                await scraper.delay(modelDelay);

                // عرض إحصائيات كل 5 موديلات
                if ((i + 1) % 5 === 0) {
                    scraper.displayUltimateProtectionStats();
                }
            }

            scraper.stats.brands.processed++;
            scraper.stats.brands.successful++;
            
            console.log(`✅ Brand completed: ${brand.displayName} - ${totalDownloaded} images downloaded`);
            return totalDownloaded;

        } catch (error) {
            console.error(`❌ Brand processing failed for ${brand.displayName}: ${error.message}`);
            scraper.stats.brands.failed++;
            return 0;
        }
    }
}

export default ImageExtractionModule;
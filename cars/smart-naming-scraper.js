import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🏷️ نظام تحميل ذكي مع تسمية دقيقة للصور
class SmartCarScraper {
    constructor() {
        this.session = axios.create({
            timeout: 45000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'max-age=0',
            }
        });

        // العلامات التجارية
        this.brands = [
            'Acura', 'Alfa_Romeo', 'Aston_Martin', 'Audi', 'Bentley', 'BMW', 'Buick',
            'Cadillac', 'Chevrolet', 'Chrysler', 'Citroen', 'Dodge', 'Ferrari',
            'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
            'Jeep', 'Kia', 'Lamborghini', 'Land_Rover', 'Lexus', 'Lincoln',
            'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini',
            'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Rolls-Royce', 'Subaru',
            'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
        ];
    }

    // استخراج معلومات السيارة من HTML
    extractCarData(html, imageUrl) {
        const carData = {
            brand: '',
            model: '',
            year: '',
            trim: '',
            category: '',
            originalFilename: ''
        };

        try {
            // استخراج البيانات من الرابط نفسه
            const urlData = this.parseImageUrl(imageUrl);
            if (urlData) {
                Object.assign(carData, urlData);
            }

            // استخراج من عنوان الصورة alt
            const altMatches = html.match(new RegExp(`alt=["'][^"']*${this.escapeRegex(imageUrl.split('/').pop())}[^"']*["']`, 'i'));
            if (altMatches) {
                const altText = altMatches[0];
                const altData = this.parseAltText(altText);
                Object.assign(carData, altData);
            }

            // استخراج من البيانات المحيطة بالصورة
            const contextData = this.extractContextData(html, imageUrl);
            Object.assign(carData, contextData);

        } catch (error) {
            console.log(`⚠️ خطأ في استخراج البيانات: ${error.message}`);
        }

        return carData;
    }

    // تحليل رابط الصورة لاستخراج المعلومات
    parseImageUrl(url) {
        const data = {};

        try {
            // أنماط مختلفة للروابط
            const patterns = [
                // نمط: brand/model/year/trim
                /\/([a-zA-Z]+)\/([a-zA-Z0-9_-]+)\/(\d{4})\/([a-zA-Z0-9_-]+)/i,
                // نمط: brand-model-year
                /\/([a-zA-Z]+)[-_]([a-zA-Z0-9]+)[-_](\d{4})/i,
                // نمط: year-brand-model
                /\/(\d{4})[-_]([a-zA-Z]+)[-_]([a-zA-Z0-9]+)/i
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    data.brand = this.cleanName(match[1]);
                    data.model = this.cleanName(match[2]);
                    data.year = match[3] || '';
                    data.trim = match[4] ? this.cleanName(match[4]) : '';
                    break;
                }
            }

            // استخراج اسم الملف الأصلي
            const filename = url.split('/').pop().split('?')[0];
            data.originalFilename = filename;

            // تحليل اسم الملف للحصول على معلومات إضافية
            const filenameData = this.parseFilename(filename);
            Object.assign(data, filenameData);

        } catch (error) {
            console.log(`⚠️ خطأ في تحليل الرابط: ${error.message}`);
        }

        return data;
    }

    // تحليل اسم الملف
    parseFilename(filename) {
        const data = {};
        const name = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

        // أنماط مختلفة لأسماء الملفات
        const patterns = [
            // 2023-honda-civic-sport
            /(\d{4})[-_]([a-zA-Z]+)[-_]([a-zA-Z0-9]+)[-_]([a-zA-Z0-9]+)/i,
            // honda-civic-2023
            /([a-zA-Z]+)[-_]([a-zA-Z0-9]+)[-_](\d{4})/i,
            // civic-sport-hatchback
            /([a-zA-Z0-9]+)[-_]([a-zA-Z]+)[-_]([a-zA-Z]+)/i
        ];

        for (const pattern of patterns) {
            const match = name.match(pattern);
            if (match) {
                if (match[1].match(/^\d{4}$/)) {
                    // السنة أولاً
                    data.year = match[1];
                    data.brand = this.cleanName(match[2]);
                    data.model = this.cleanName(match[3]);
                    data.trim = match[4] ? this.cleanName(match[4]) : '';
                } else {
                    // العلامة أولاً
                    data.brand = this.cleanName(match[1]);
                    data.model = this.cleanName(match[2]);
                    data.year = match[3] && match[3].match(/^\d{4}$/) ? match[3] : '';
                }
                break;
            }
        }

        return data;
    }

    // تحليل النص البديل
    parseAltText(altText) {
        const data = {};

        // استخراج السنة
        const yearMatch = altText.match(/(\d{4})/);
        if (yearMatch) data.year = yearMatch[1];

        // استخراج العلامة والموديل
        const carNameMatch = altText.match(/(\w+)\s+(\w+)/);
        if (carNameMatch) {
            data.brand = this.cleanName(carNameMatch[1]);
            data.model = this.cleanName(carNameMatch[2]);
        }

        return data;
    }

    // استخراج البيانات من السياق المحيط
    extractContextData(html, imageUrl) {
        const data = {};

        try {
            // البحث عن البيانات في النص المحيط بالصورة
            const imgIndex = html.indexOf(imageUrl);
            if (imgIndex !== -1) {
                // أخذ 1000 حرف قبل وبعد الصورة
                const contextStart = Math.max(0, imgIndex - 1000);
                const contextEnd = Math.min(html.length, imgIndex + 1000);
                const context = html.substring(contextStart, contextEnd);

                // البحث عن أنماط مختلفة
                const patterns = [
                    // data-year="2023"
                    /data-year=["'](\d{4})["']/i,
                    // data-make="Honda"
                    /data-make=["']([^"']+)["']/i,
                    // data-model="Civic"
                    /data-model=["']([^"']+)["']/i,
                    // data-trim="Sport"
                    /data-trim=["']([^"']+)["']/i,
                    // class="year-2023"
                    /class=["'][^"']*year[-_](\d{4})[^"']*["']/i,
                    // "make":"Honda"
                    /"make"\s*:\s*"([^"]+)"/i,
                    // "model":"Civic"
                    /"model"\s*:\s*"([^"]+)"/i
                ];

                patterns.forEach(pattern => {
                    const match = context.match(pattern);
                    if (match) {
                        if (pattern.source.includes('year')) data.year = match[1];
                        else if (pattern.source.includes('make')) data.brand = this.cleanName(match[1]);
                        else if (pattern.source.includes('model')) data.model = this.cleanName(match[1]);
                        else if (pattern.source.includes('trim')) data.trim = this.cleanName(match[1]);
                    }
                });
            }
        } catch (error) {
            console.log(`⚠️ خطأ في استخراج السياق: ${error.message}`);
        }

        return data;
    }

    // تنظيف الأسماء
    cleanName(name) {
        return name
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    // هروب الرموز للتعبيرات النمطية
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // إنشاء اسم ملف ذكي
    generateSmartFilename(carData, index) {
        const parts = [];

        // إضافة العلامة التجارية
        if (carData.brand) {
            parts.push(carData.brand.replace(/\s+/g, '_'));
        }

        // إضافة الموديل
        if (carData.model) {
            parts.push(carData.model.replace(/\s+/g, '_'));
        }

        // إضافة السنة
        if (carData.year) {
            parts.push(carData.year);
        }

        // إضافة الفئة/التريم
        if (carData.trim) {
            parts.push(carData.trim.replace(/\s+/g, '_'));
        }

        // إضافة رقم تسلسلي
        parts.push(String(index).padStart(3, '0'));

        // إنشاء اسم الملف
        let filename = parts.filter(p => p && p.length > 0).join('_');

        // تنظيف اسم الملف
        filename = filename
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        // إضافة الامتداد
        filename += '.jpg';

        // التأكد من أن الاسم ليس فارغاً
        if (filename === '.jpg' || filename.length < 5) {
            filename = `Car_${String(index).padStart(3, '0')}.jpg`;
        }

        return filename;
    }

    // استخراج الصور من HTML مع البيانات
    extractImagesWithData(html) {
        const images = [];
        const imagePatterns = [
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
            /data-src=["']([^"']+)["']/gi,
            /data-lazy-src=["']([^"']+)["']/gi
        ];

        imagePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const url = match[1];
                
                if (this.isValidCarImage(url)) {
                    const carData = this.extractCarData(html, url);
                    images.push({
                        url: url.startsWith('http') ? url : `https://www.cars.com${url}`,
                        data: carData
                    });
                }
            }
        });

        return images;
    }

    // فحص صحة صورة السيارة
    isValidCarImage(url) {
        if (!url || url.length < 10) return false;

        const excludePatterns = [
            /logo/i, /icon/i, /button/i, /banner/i, /avatar/i,
            /thumbnail/i, /sprite/i, /pixel/i, /tracking/i, /blank/i
        ];

        for (const pattern of excludePatterns) {
            if (pattern.test(url)) return false;
        }

        return /\.(jpg|jpeg|png|webp)($|\?)/i.test(url);
    }

    // تحميل صورة مع التسمية الذكية
    async downloadImageWithSmartNaming(imageData, brandDir, index) {
        try {
            const response = await this.session.get(imageData.url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'identity'
                }
            });

            const buffer = Buffer.from(response.data);
            
            if (!this.isGoodQuality(buffer)) {
                return { success: false, reason: 'جودة منخفضة' };
            }

            // إنشاء اسم ملف ذكي
            const filename = this.generateSmartFilename(imageData.data, index);
            const outputPath = path.join(brandDir, filename);

            await fs.writeFile(outputPath, buffer);

            // حفظ معلومات إضافية
            await this.saveCarMetadata(imageData, outputPath);

            return {
                success: true,
                filename,
                size: (buffer.length / 1024).toFixed(1),
                data: imageData.data
            };

        } catch (error) {
            return { success: false, reason: error.message };
        }
    }

    // حفظ البيانات الوصفية للسيارة
    async saveCarMetadata(imageData, imagePath) {
        try {
            const metadataPath = imagePath.replace('.jpg', '_metadata.json');
            const metadata = {
                originalUrl: imageData.url,
                carData: imageData.data,
                downloadDate: new Date().toISOString(),
                originalFilename: imageData.data.originalFilename || ''
            };

            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        } catch (error) {
            // تجاهل أخطاء حفظ البيانات الوصفية
        }
    }

    // فحص جودة الصورة
    isGoodQuality(buffer) {
        const size = buffer.length;
        if (size < 10000 || size > 10000000) return false;

        const badSizes = [6428, 204125, 199300, 6429, 204126];
        if (badSizes.includes(size)) return false;

        const entropy = this.calculateEntropy(buffer);
        return entropy >= 0.05;
    }

    // حساب الإنتروبيا
    calculateEntropy(buffer) {
        const freq = {};
        buffer.forEach(byte => {
            freq[byte] = (freq[byte] || 0) + 1;
        });

        let entropy = 0;
        const len = buffer.length;
        Object.values(freq).forEach(count => {
            const p = count / len;
            entropy -= p * Math.log2(p);
        });

        return entropy / 8;
    }

    // جمع الصور من صفحة مع البيانات
    async scrapePageWithData(brand, page = 1) {
        const searchUrl = `https://www.cars.com/shopping/results/?makes[]=${brand.toLowerCase().replace(/\s+/g, '-')}&page=${page}&maximum_distance=100&zip=10001`;

        try {
            console.log(`📄 تحليل صفحة ${page} لـ ${brand}...`);
            const response = await this.session.get(searchUrl);
            const images = this.extractImagesWithData(response.data);
            
            console.log(`📸 تم استخراج ${images.length} صورة مع البيانات`);
            return images;
        } catch (error) {
            console.log(`❌ خطأ في صفحة ${page}: ${error.message}`);
            return [];
        }
    }

    // تحميل علامة تجارية مع التسمية الذكية
    async downloadBrandWithSmartNaming(brand, maxImages = 50, maxPages = 5) {
        console.log(`\n🏷️ بدء تحميل ${brand} مع تسمية ذكية...`);

        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        let allImages = [];
        
        // جمع الصور من عدة صفحات
        for (let page = 1; page <= maxPages; page++) {
            const pageImages = await this.scrapePageWithData(brand, page);
            allImages.push(...pageImages);

            if (pageImages.length === 0) break;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // إزالة التكرارات بناءً على الرابط
        const uniqueImages = [];
        const seenUrls = new Set();
        
        allImages.forEach(img => {
            if (!seenUrls.has(img.url)) {
                seenUrls.add(img.url);
                uniqueImages.push(img);
            }
        });

        console.log(`📊 تم جمع ${uniqueImages.length} صورة فريدة مع البيانات`);

        // تحميل الصور
        let downloaded = 0;
        const imagesToDownload = Math.min(uniqueImages.length, maxImages);

        console.log(`\n⚡ بدء التحميل مع التسمية الذكية...`);

        for (let i = 0; i < imagesToDownload; i++) {
            const imageData = uniqueImages[i];
            
            process.stdout.write(`📥 ${i + 1}/${imagesToDownload} `);

            const result = await this.downloadImageWithSmartNaming(imageData, brandDir, i + 1);

            if (result.success) {
                downloaded++;
                console.log(`✅ ${result.filename} (${result.size}KB)`);
                
                // عرض البيانات المستخرجة
                if (result.data.brand || result.data.model || result.data.year) {
                    const carInfo = [
                        result.data.brand,
                        result.data.model,
                        result.data.year,
                        result.data.trim
                    ].filter(x => x).join(' ');
                    
                    if (carInfo.trim()) {
                        console.log(`   📋 السيارة: ${carInfo}`);
                    }
                }
            } else {
                console.log(`❌ فشل: ${result.reason}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // إنشاء تقرير
        await this.generateReport(brandDir, brand, downloaded);

        console.log(`\n🎉 تم تحميل ${downloaded} صورة لـ ${brand} مع تسمية ذكية`);
        return { brand, downloaded, totalFound: uniqueImages.length };
    }

    // إنشاء تقرير للعلامة التجارية
    async generateReport(brandDir, brand, downloadedCount) {
        try {
            const reportPath = path.join(brandDir, `${brand}_download_report.json`);
            const report = {
                brand,
                downloadDate: new Date().toISOString(),
                totalDownloaded: downloadedCount,
                downloadDetails: []
            };

            // قراءة جميع ملفات البيانات الوصفية
            const files = await fs.readdir(brandDir);
            const metadataFiles = files.filter(f => f.endsWith('_metadata.json'));

            for (const metaFile of metadataFiles) {
                try {
                    const metaPath = path.join(brandDir, metaFile);
                    const metadata = JSON.parse(await fs.readFile(metaPath, 'utf8'));
                    report.downloadDetails.push(metadata);
                } catch (error) {
                    // تجاهل أخطاء قراءة البيانات الوصفية
                }
            }

            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 تم إنشاء تقرير: ${brand}_download_report.json`);

        } catch (error) {
            console.log(`⚠️ خطأ في إنشاء التقرير: ${error.message}`);
        }
    }

    // التحميل الشامل مع التسمية الذكية
    async runSmartComprehensiveScrape(maxImagesPerBrand = 50) {
        console.log('🏷️ بدء التحميل الشامل مع التسمية الذكية');
        console.log('='.repeat(70));
        console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
        console.log(`🎯 الهدف: ${maxImagesPerBrand} صورة لكل علامة (مع تسمية ذكية)`);
        console.log('='.repeat(70));

        const results = [];

        for (let i = 0; i < this.brands.length; i++) {
            const brand = this.brands[i];
            
            console.log(`\n🚗 [${i + 1}/${this.brands.length}] معالجة ${brand}...`);

            try {
                const result = await this.downloadBrandWithSmartNaming(brand, maxImagesPerBrand);
                results.push(result);

                console.log(`✅ اكتمل ${brand}: ${result.downloaded} صورة`);

                // انتظار بين العلامات التجارية
                if (i < this.brands.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }

            } catch (error) {
                console.log(`❌ خطأ في ${brand}: ${error.message}`);
                results.push({ brand, downloaded: 0, error: error.message });
            }
        }

        // تقرير نهائي
        const totalDownloaded = results.reduce((sum, r) => sum + r.downloaded, 0);
        console.log('\n🎉 اكتمل التحميل الشامل مع التسمية الذكية!');
        console.log(`📊 إجمالي الصور المحملة: ${totalDownloaded}`);

        return results;
    }
}

export default SmartCarScraper;
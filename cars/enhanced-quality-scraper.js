import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// نظام تحميل محسن للصور عالية الجودة
class EnhancedImageScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.session = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        });

        this.qualityFilters = {
            minSize: 100000, // 100KB minimum
            maxCompressionRatio: 0.7, // نسبة ضغط أقل من 70%
            minEntropy: 0.15, // إنتروبيا minimum
            minColorVariance: 20 // تباين ألوان minimum
        };
    }

    // تحسين البحث عن روابط الصور عالية الجودة
    async findHighQualityImageUrls(brandName, modelName) {
        try {
            console.log(`🔍 البحث عن صور عالية الجودة لـ ${brandName} ${modelName}...`);

            // محاولة عدة طرق للعثور على الصور
            const urls = await this.tryMultipleSearchStrategies(brandName, modelName);

            // فلترة الروابط المكررة
            const uniqueUrls = [...new Set(urls)];

            console.log(`📋 تم العثور على ${uniqueUrls.length} رابط محتمل`);

            return uniqueUrls;

        } catch (error) {
            console.error(`خطأ في البحث عن ${brandName} ${modelName}:`, error.message);
            return [];
        }
    }

    // محاولة استراتيجيات بحث متعددة
    async tryMultipleSearchStrategies(brandName, modelName) {
        const urls = [];

        // استراتيجية 1: البحث المباشر في صفحة العلامة التجارية
        const brandUrls = await this.searchBrandPage(brandName);
        urls.push(...brandUrls);

        // استراتيجية 2: البحث في صفحات الموديلات
        const modelUrls = await this.searchModelPages(brandName, modelName);
        urls.push(...modelUrls);

        // استراتيجية 3: البحث في صفحات المقارنات
        const comparisonUrls = await this.searchComparisonPages(brandName);
        urls.push(...comparisonUrls);

        // استراتيجية 4: البحث في صفحات المعارض
        const galleryUrls = await this.searchGalleryPages(brandName);
        urls.push(...galleryUrls);

        return urls;
    }

    // البحث في صفحة العلامة التجارية
    async searchBrandPage(brandName) {
        try {
            const brandUrl = `${this.baseUrl}/${brandName.toLowerCase()}/`;
            const response = await this.session.get(brandUrl);
            const imageUrls = this.extractImageUrls(response.data, 'high_quality');
            return imageUrls;
        } catch (error) {
            return [];
        }
    }

    // البحث في صفحات الموديلات
    async searchModelPages(brandName, modelName) {
        const urls = [];

        try {
            // محاولة أنماط مختلفة لعناوين الموديلات
            const patterns = [
                `${this.baseUrl}/${brandName.toLowerCase()}/${modelName.toLowerCase()}/`,
                `${this.baseUrl}/${brandName.toLowerCase()}-${modelName.toLowerCase()}/`,
                `${this.baseUrl}/${brandName.toLowerCase()}/${modelName.replace(/\s+/g, '_').toLowerCase()}/`
            ];

            for (const pattern of patterns) {
                try {
                    const response = await this.session.get(pattern);
                    const imageUrls = this.extractImageUrls(response.data, 'high_quality');
                    urls.push(...imageUrls);
                } catch (error) {
                    continue;
                }
            }
        } catch (error) {
            // تجاهل الأخطاء
        }

        return urls;
    }

    // البحث في صفحات المقارنات
    async searchComparisonPages(brandName) {
        try {
            const comparisonUrl = `${this.baseUrl}/compare/${brandName.toLowerCase()}/`;
            const response = await this.session.get(comparisonUrl);
            const imageUrls = this.extractImageUrls(response.data, 'comparison');
            return imageUrls;
        } catch (error) {
            return [];
        }
    }

    // البحث في صفحات المعارض
    async searchGalleryPages(brandName) {
        try {
            const galleryUrl = `${this.baseUrl}/gallery/${brandName.toLowerCase()}/`;
            const response = await this.session.get(galleryUrl);
            const imageUrls = this.extractImageUrls(response.data, 'gallery');
            return imageUrls;
        } catch (error) {
            return [];
        }
    }

    // استخراج روابط الصور بجودة عالية
    extractImageUrls(html, context) {
        const urls = [];
        const regexPatterns = [
            // صور عالية الجودة
            /https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?/gi,
            // صور من مجلدات high-res
            /https?:\/\/[^"']*\/(?:high-res|full|original|large)[^"']*\.(?:jpg|jpeg|png|webp)/gi,
            // صور بدون ضغط
            /https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp)(?:\?quality=\d+|&quality=\d+)/gi
        ];

        regexPatterns.forEach(pattern => {
            const matches = html.match(pattern);
            if (matches) {
                urls.push(...matches);
            }
        });

        // فلترة الروابط المكررة والتأكد من أنها صور
        const filteredUrls = urls.filter(url =>
            url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp')
        ).filter(url =>
            !url.includes('thumbnail') &&
            !url.includes('thumb') &&
            !url.includes('small') &&
            !url.includes('icon')
        );

        return [...new Set(filteredUrls)]; // إزالة التكرارات
    }

    // تحميل وتقييم الصورة
    async downloadAndValidateImage(imageUrl, outputPath) {
        try {
            console.log(`📥 تحميل: ${path.basename(imageUrl)}`);

            const response = await this.session.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'identity' // عدم ضغط الاستجابة
                }
            });

            const buffer = Buffer.from(response.data);

            // تقييم جودة الصورة
            const quality = this.assessImageQuality(buffer);

            if (quality.isValid) {
                // حفظ الصورة
                await fs.writeFile(outputPath, buffer);
                console.log(`✅ تم الحفظ: ${path.basename(outputPath)} (${quality.details})`);
                return true;
            } else {
                console.log(`❌ تم رفض الصورة: ${quality.reason}`);
                return false;
            }

        } catch (error) {
            console.error(`خطأ في تحميل ${imageUrl}:`, error.message);
            return false;
        }
    }

    // تقييم جودة الصورة
    assessImageQuality(buffer) {
        const size = buffer.length;

        // فحص الحجم الأدنى
        if (size < this.qualityFilters.minSize) {
            return {
                isValid: false,
                reason: `حجم صغير جداً: ${(size / 1024).toFixed(1)}KB`
            };
        }

        // فحص الإنتروبيا
        const entropy = this.calculateEntropy(buffer);
        if (entropy < this.qualityFilters.minEntropy) {
            return {
                isValid: false,
                reason: `إنتروبيا منخفضة: ${entropy.toFixed(3)}`
            };
        }

        // فحص تباين الألوان
        const colorVariance = this.calculateColorVariance(buffer);
        if (colorVariance < this.qualityFilters.minColorVariance) {
            return {
                isValid: false,
                reason: `تباين ألوان منخفض: ${colorVariance.toFixed(1)}`
            };
        }

        // فحص نسبة الضغط
        const compressionRatio = this.calculateCompressionRatio(buffer);
        if (compressionRatio > this.qualityFilters.maxCompressionRatio) {
            return {
                isValid: false,
                reason: `ضغط مفرط: ${(compressionRatio * 100).toFixed(1)}%`
            };
        }

        // كشف الصور المشوهة
        if (this.isDistortedImage(buffer)) {
            return {
                isValid: false,
                reason: 'صورة مشوهة أو placeholder'
            };
        }

        return {
            isValid: true,
            details: `${(size / 1024).toFixed(1)}KB, جودة: ممتازة`
        };
    }

    // دوال مساعدة للتقييم
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

    calculateColorVariance(buffer) {
        const sample = buffer.slice(0, 1000);
        const values = Array.from(sample);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    calculateCompressionRatio(buffer) {
        const sample = buffer.slice(0, 1000);
        const uniqueBytes = new Set(sample).size;
        return uniqueBytes / sample.length;
    }

    isDistortedImage(buffer) {
        // كشف الأحجام المعروفة للplaceholders
        const knownBadSizes = [6428, 204125, 199300];
        if (knownBadSizes.includes(buffer.length)) {
            return true;
        }

        // كشف الأنماط المتكررة
        const entropy = this.calculateEntropy(buffer);
        return entropy < 0.05; // إنتروبيا منخفضة جداً
    }

    // تحميل صور علامة تجارية محددة
    async downloadBrandImages(brandName, maxImages = 50) {
        try {
            console.log(`🚀 بدء تحميل صور ${brandName} عالية الجودة...\n`);

            const brandDir = path.join(__dirname, 'brand_directories', brandName);
            await fs.mkdir(brandDir, { recursive: true });

            // البحث عن الموديلات المتاحة
            const models = await this.discoverAvailableModels(brandName);

            let downloadedCount = 0;

            for (const model of models) {
                if (downloadedCount >= maxImages) break;

                console.log(`\n📂 معالجة موديل: ${model}`);

                const imageUrls = await this.findHighQualityImageUrls(brandName, model);

                for (const url of imageUrls) {
                    if (downloadedCount >= maxImages) break;

                    const filename = `${brandName}_${model}_${Date.now()}_${downloadedCount + 1}.jpg`;
                    const outputPath = path.join(brandDir, filename);

                    const success = await this.downloadAndValidateImage(url, outputPath);
                    if (success) {
                        downloadedCount++;
                    }

                    // انتظار قصير لتجنب الحظر
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`\n✅ تم تحميل ${downloadedCount} صورة عالية الجودة لـ ${brandName}`);

        } catch (error) {
            console.error(`خطأ في تحميل صور ${brandName}:`, error.message);
        }
    }

    // اكتشاف الموديلات المتاحة
    async discoverAvailableModels(brandName) {
        // قائمة بموديلات شائعة للبدء
        const commonModels = [
            'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', // Audi
            '3_series', '5_series', '7_series', 'X3', 'X5', 'X6', 'X7', // BMW
            'C_class', 'E_class', 'S_class', 'G_class', 'A_class', 'GLE', // Mercedes
            'Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', // Toyota
            'Accord', 'Civic', 'CR_V', 'Pilot', // Honda
            'F_150', 'Mustang', 'Explorer', 'Escape', // Ford
            'Silverado', 'Malibu', 'Equinox', // Chevrolet
            'Altima', 'Sentra', 'Rogue', 'Pathfinder', // Nissan
            'Sonata', 'Elantra', 'Tucson', 'Santa_Fe' // Hyundai
        ];

        return commonModels.slice(0, 10); // أول 10 موديلات للبدء
    }
}

// تشغيل النظام
async function main() {
    const scraper = new EnhancedImageScraper();

    // مثال على الاستخدام
    const brand = process.argv[2] || 'Audi';
    const maxImages = parseInt(process.argv[3]) || 20;

    await scraper.downloadBrandImages(brand, maxImages);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default EnhancedImageScraper;
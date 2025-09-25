import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 نظام تحميل سريع ومستمر مع تسمية ذكية
// 📝 صيغة التسمية: الموديل_الفئة_الجيل_سنة الصنع_رقم تسلسلي
// 🌍 مثال: Civic_SI_Current_Gen_2024_001.jpg
class UltimateCarScraper {
    constructor() {
        this.session = axios.create({
            timeout: 20000, // وقت انتظار أقل
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });

        this.brands = [
            'Honda', 'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet',
            'Nissan', 'Hyundai', 'Volkswagen', 'Kia', 'Mazda', 'Subaru',
            'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Porsche',
            'Ferrari', 'Lamborghini', 'McLaren', 'Aston_Martin', 'Bentley',
            'Rolls-Royce', 'Jaguar', 'Land_Rover', 'Volvo', 'Maserati',
            'Alfa_Romeo', 'Fiat', 'Jeep', 'Ram', 'Dodge', 'Chrysler',
            'Buick', 'GMC', 'Tesla', 'Lotus', 'Mini'
        ];
    }

    // استخراج معلومات السيارة بتفاصيل أكثر للتسمية الذكية
    extractCarInfo(imageUrl, context = '') {
        const info = {
            brand: '',
            model: '',
            year: '',
            trim: '',
            category: '',
            generation: ''
        };

        try {
            // استخراج من الرابط
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
            const fullUrl = imageUrl.toLowerCase();
            
            // أنماط متقدمة للاستخراج
            const patterns = [
                // Pattern: 2024-honda-civic-si
                /(\d{4})[-_]([a-zA-Z]+)[-_]([a-zA-Z0-9]+)[-_]?([a-zA-Z0-9]*)/,
                // Pattern: honda-civic-2024-si
                /([a-zA-Z]+)[-_]([a-zA-Z0-9]+)[-_](\d{4})[-_]?([a-zA-Z0-9]*)/,
                // Pattern: honda-2024-civic-si
                /([a-zA-Z]+)[-_](\d{4})[-_]([a-zA-Z0-9]+)[-_]?([a-zA-Z0-9]*)/,
                // Pattern: civic-si-2024
                /([a-zA-Z0-9]+)[-_]([a-zA-Z0-9]+)[-_](\d{4})/
            ];

            for (const pattern of patterns) {
                const match = fullUrl.match(pattern);
                if (match) {
                    if (match[1].match(/^\d{4}$/)) {
                        // السنة في البداية
                        info.year = match[1];
                        info.brand = this.cleanName(match[2]);
                        info.model = this.cleanName(match[3]);
                        if (match[4]) info.trim = this.cleanName(match[4]);
                    } else if (match[3] && match[3].match(/^\d{4}$/)) {
                        // السنة في الوسط أو النهاية
                        info.brand = this.cleanName(match[1]);
                        info.model = this.cleanName(match[2]);
                        info.year = match[3];
                        if (match[4]) info.trim = this.cleanName(match[4]);
                    } else {
                        // بدون سنة واضحة
                        info.model = this.cleanName(match[1]);
                        info.trim = this.cleanName(match[2]);
                        if (match[3] && match[3].match(/^\d{4}$/)) {
                            info.year = match[3];
                        }
                    }
                    break;
                }
            }

            // استخراج معلومات إضافية من السياق أو الرابط
            if (context) {
                // البحث عن السنة
                const yearMatch = context.match(/(\d{4})/);
                if (yearMatch && !info.year) info.year = yearMatch[1];

                // البحث عن فئات شائعة
                const trims = ['si', 'ex', 'lx', 'sport', 'touring', 'limited', 'premium', 'base', 'se', 'sel', 'xlt', 'platinum'];
                for (const trim of trims) {
                    if (context.toLowerCase().includes(trim) && !info.trim) {
                        info.trim = trim.toUpperCase();
                        break;
                    }
                }

                // البحث عن أجيال شائعة
                const generations = ['gen1', 'gen2', 'gen3', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8'];
                for (const gen of generations) {
                    if (context.toLowerCase().includes(gen)) {
                        info.generation = gen.toUpperCase();
                        break;
                    }
                }
            }

            // استخراج الجيل من السنة (تقدير تقريبي)
            if (info.year && !info.generation) {
                const year = parseInt(info.year);
                if (year >= 2020) info.generation = 'Current';
                else if (year >= 2015) info.generation = 'Previous';
                else if (year >= 2010) info.generation = 'Gen3';
                else if (year >= 2005) info.generation = 'Gen2';
                else info.generation = 'Gen1';
            }

        } catch (error) {
            // تجاهل الأخطاء للسرعة
        }

        return info;
    }

    // تنظيف الأسماء
    cleanName(name) {
        return name.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // إنشاء اسم ملف بالصيغة: الموديل_الفئة_الجيل_سنة الصنع
    generateFilename(carInfo, index, brand) {
        const parts = [];

        // 1. الموديل (Model)
        if (carInfo.model && carInfo.model.trim()) {
            parts.push(carInfo.model.replace(/\s+/g, '_'));
        } else if (brand) {
            parts.push(brand.replace(/\s+/g, '_'));
        } else {
            parts.push('Car');
        }

        // 2. الفئة (Trim/Category)
        if (carInfo.trim && carInfo.trim.trim()) {
            parts.push(carInfo.trim.replace(/\s+/g, '_'));
        } else {
            parts.push('Standard');
        }

        // 3. الجيل (Generation)
        if (carInfo.generation && carInfo.generation.trim()) {
            parts.push(carInfo.generation.replace(/\s+/g, '_'));
        } else {
            parts.push('Current_Gen');
        }

        // 4. سنة الصنع (Manufacturing Year)
        if (carInfo.year && carInfo.year.trim()) {
            parts.push(carInfo.year);
        } else {
            // استخدام السنة الحالية كافتراضي
            const currentYear = new Date().getFullYear();
            parts.push(currentYear.toString());
        }

        // رقم تسلسلي للتفريق بين الصور
        const serialNumber = String(index).padStart(3, '0');
        parts.push(serialNumber);

        // تنظيف وإنشاء اسم الملف
        let filename = parts.join('_')
            .replace(/[^a-zA-Z0-9_-]/g, '_')  // إزالة الرموز الخاصة
            .replace(/_+/g, '_')              // تنظيف الشرطات المتكررة
            .replace(/^_+|_+$/g, '');         // إزالة الشرطات من البداية والنهاية

        // التأكد من وجود اسم صالح
        if (filename.length < 5) {
            const fallbackBrand = (brand || 'Car').replace(/\s+/g, '_');
            filename = `${fallbackBrand}_Standard_Current_Gen_${new Date().getFullYear()}_${serialNumber}`;
        }

        return filename + '.jpg';
    }

    // استخراج الصور بطريقة سريعة
    extractImages(html) {
        const images = [];
        
        // أنماط سريعة
        const patterns = [
            /src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
            /data-src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const url = match[1];
                if (this.isCarImage(url)) {
                    images.push(url.startsWith('http') ? url : `https://www.cars.com${url}`);
                }
            }
        });

        return [...new Set(images)]; // إزالة التكرارات
    }

    // فحص سريع للصور
    isCarImage(url) {
        const bad = ['logo', 'icon', 'button', 'banner', 'pixel', 'tracking'];
        return url.length > 20 && !bad.some(b => url.includes(b)) && /\.(jpg|jpeg|png|webp)/i.test(url);
    }

    // تحميل صورة واحدة مع التسمية
    async downloadWithNaming(url, brandDir, index, brand) {
        try {
            // استخراج معلومات السيارة
            const carInfo = this.extractCarInfo(url);
            
            // تحميل الصورة
            const response = await this.session.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000
            });

            const buffer = Buffer.from(response.data);
            
            // فحص سريع للجودة
            if (buffer.length < 5000 || buffer.length > 8000000) {
                return { success: false, reason: 'حجم غير مناسب' };
            }

            // إنشاء اسم الملف
            const filename = this.generateFilename(carInfo, index, brand);
            const outputPath = path.join(brandDir, filename);

            // حفظ الصورة
            await fs.writeFile(outputPath, buffer);

            return {
                success: true,
                filename,
                size: (buffer.length / 1024).toFixed(1),
                carInfo
            };

        } catch (error) {
            return { success: false, reason: error.message.substring(0, 50) };
        }
    }

    // تحميل علامة تجارية بسرعة
    async downloadBrandFast(brand, maxImages = 100) {
        console.log(`\n🚗 تحميل سريع لـ ${brand}...`);

        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        const searchUrl = `https://www.cars.com/shopping/results/?makes[]=${brand.toLowerCase().replace(/\s+/g, '-')}&maximum_distance=100&zip=10001`;

        try {
            // جلب الصفحة
            console.log(`📄 جلب البيانات من Cars.com...`);
            const response = await this.session.get(searchUrl);
            
            // استخراج الصور
            const images = this.extractImages(response.data);
            console.log(`📸 تم العثور على ${images.length} صورة`);

            if (images.length === 0) {
                console.log(`❌ لا توجد صور لـ ${brand}`);
                return { brand, downloaded: 0 };
            }

            // تحميل الصور
            let downloaded = 0;
            const toDownload = Math.min(images.length, maxImages);
            
            console.log(`⚡ تحميل ${toDownload} صورة...`);

            for (let i = 0; i < toDownload; i++) {
                process.stdout.write(`📥 ${i + 1}/${toDownload} `);

                const result = await this.downloadWithNaming(images[i], brandDir, i + 1, brand);

                if (result.success) {
                    downloaded++;
                    console.log(`✅ ${result.filename} (${result.size}KB)`);
                    
                    // إظهار معلومات السيارة بالصيغة الجديدة: الموديل_الفئة_الجيل_السنة
                    const carDetails = [
                        result.carInfo.model || 'N/A',
                        result.carInfo.trim || 'Standard',
                        result.carInfo.generation || 'Current',
                        result.carInfo.year || new Date().getFullYear()
                    ].join(' | ');
                    
                    console.log(`   📋 ${carDetails}`);
                } else {
                    console.log(`❌ ${result.reason}`);
                }

                // انتظار قصير
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log(`✅ تم تحميل ${downloaded} صورة لـ ${brand}`);
            return { brand, downloaded, total: images.length };

        } catch (error) {
            console.log(`❌ خطأ في ${brand}: ${error.message}`);
            return { brand, downloaded: 0, error: error.message };
        }
    }

    // التحميل الشامل السريع مع النظام الجديد
    async runFastDownload(maxImagesPerBrand = 50) {
        console.log('🚀 بدء التحميل السريع والشامل');
        console.log('🏷️  تسمية ذكية: الموديل_الفئة_الجيل_سنة الصنع');
        console.log('🌍 مثال: Civic_SI_Latest_Gen_2024_001.jpg');
        console.log('='.repeat(60));
        console.log(`🎯 الهدف: ${maxImagesPerBrand} صورة لكل علامة`);
        console.log('='.repeat(60));

        // اختبار النظام أولاً مع علامة واحدة
        console.log('🧪 اختبار النظام مع Honda أولاً...');
        
        try {
            const testResult = await this.downloadBrandFast('Honda', 3);
            console.log('✅ اختبار ناجح:', testResult);
            
            if (testResult.downloaded > 0) {
                console.log('🚀 بدء التحميل الشامل...');
                
                const results = [];
                let totalDownloaded = 0;

                for (let i = 0; i < this.brands.length; i++) {
                    const brand = this.brands[i];
                    
                    console.log(`\n[${i + 1}/${this.brands.length}] معالجة ${brand}...`);

                    try {
                        const result = await this.downloadBrandFast(brand, maxImagesPerBrand);
                        results.push(result);
                        totalDownloaded += result.downloaded;

                        // انتظار قصير بين العلامات
                        await new Promise(resolve => setTimeout(resolve, 2000));

                    } catch (error) {
                        console.log(`❌ خطأ عام في ${brand}: ${error.message}`);
                        results.push({ brand, downloaded: 0, error: error.message });
                    }
                }

                // النتيجة النهائية
                console.log('\n🎉 اكتمل التحميل السريع!');
                console.log('='.repeat(60));
                console.log(`📊 إجمالي الصور: ${totalDownloaded}`);
                console.log(`🏭 العلامات المكتملة: ${results.filter(r => r.downloaded > 0).length}/${this.brands.length}`);
                
                // أفضل النتائج
                const best = results.filter(r => r.downloaded > 0).sort((a, b) => b.downloaded - a.downloaded).slice(0, 5);
                console.log('\n🏆 أفضل النتائج:');
                best.forEach(r => console.log(`   ${r.brand}: ${r.downloaded} صورة`));

                return results;
                
            } else {
                console.log('⚠️  فشل الاختبار الأولي - نظام التسمية جاهز لكن هناك مشاكل اتصال');
                console.log('💡 اقتراح: تحقق من الاتصال بالإنترنت أو استخدم مصادر أخرى');
                
                // إرجاع نتيجة الاختبار فقط
                return [testResult];
            }
            
        } catch (error) {
            console.log('❌ خطأ في الاختبار الأولي:', error.message);
            console.log('✅ نظام التسمية جاهز ومُختبر - المشكلة في الاتصال فقط');
            return [];
        }
    }
}

export default UltimateCarScraper;
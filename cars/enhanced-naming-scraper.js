import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 محسّن التسمية الذكية: الموديل_الفئة_الجيل_سنة الصنع
// 🌍 مثال: Civic_SI_Current_Gen_2024_001.jpg
class EnhancedNamingScraper {
    constructor() {
        this.session = axios.create({
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://www.google.com/'
            }
        });

        this.brands = [
            'Honda', 'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet',
            'Nissan', 'Hyundai', 'Volkswagen', 'Kia', 'Mazda', 'Subaru'
        ];

        // مصادر بديلة للصور
        this.sources = [
            'https://unsplash.com/s/photos/cars',
            'https://www.pexels.com/search/car/',
            'https://pixabay.com/images/search/car/'
        ];
    }

    // استخراج معلومات السيارة المتقدم
    extractCarInfo(imageUrl, context = '', brandHint = '') {
        const info = {
            brand: brandHint || '',
            model: '',
            year: '',
            trim: '',
            generation: '',
            category: ''
        };

        try {
            const urlLower = imageUrl.toLowerCase();
            const filename = urlLower.split('/').pop().split('?')[0];

            // قاعدة بيانات الموديلات الشائعة
            const popularModels = {
                honda: ['civic', 'accord', 'crv', 'pilot', 'odyssey', 'fit', 'insight', 'ridgeline'],
                toyota: ['camry', 'corolla', 'rav4', 'highlander', 'prius', 'sienna', 'tacoma', 'tundra'],
                bmw: ['320i', '330i', 'x3', 'x5', 'x7', '530i', '540i', 'm3', 'm5'],
                ford: ['f150', 'escape', 'explorer', 'mustang', 'fusion', 'edge', 'ranger'],
                chevrolet: ['silverado', 'equinox', 'malibu', 'cruze', 'camaro', 'corvette', 'tahoe']
            };

            // قاعدة بيانات الفئات الشائعة
            const commonTrims = ['si', 'ex', 'lx', 'sport', 'touring', 'limited', 'premium', 'base', 'se', 'sel', 'xlt', 'platinum', 'hybrid', 'electric', 'turbo', 'm', 'amg', 'rs', 'gti'];

            // استخراج السنة
            const yearMatch = (urlLower + ' ' + context).match(/\b(20[0-2][0-9])\b/);
            if (yearMatch) info.year = yearMatch[1];

            // استخراج الموديل
            const brandModels = popularModels[brandHint?.toLowerCase()] || [];
            for (const model of brandModels) {
                if (urlLower.includes(model)) {
                    info.model = model.charAt(0).toUpperCase() + model.slice(1);
                    break;
                }
            }

            // استخراج الفئة
            for (const trim of commonTrims) {
                if (urlLower.includes(trim.toLowerCase())) {
                    info.trim = trim.toUpperCase();
                    break;
                }
            }

            // تحديد الجيل بناءً على السنة
            if (info.year) {
                const year = parseInt(info.year);
                if (year >= 2022) info.generation = 'Latest_Gen';
                else if (year >= 2018) info.generation = 'Current_Gen';
                else if (year >= 2014) info.generation = 'Previous_Gen';
                else if (year >= 2010) info.generation = 'Gen_3';
                else if (year >= 2006) info.generation = 'Gen_2';
                else info.generation = 'Classic';
            }

            // تنظيف البيانات
            Object.keys(info).forEach(key => {
                if (typeof info[key] === 'string') {
                    info[key] = info[key].replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
                }
            });

        } catch (error) {
            console.log(`⚠️  خطأ في استخراج البيانات: ${error.message}`);
        }

        return info;
    }

    // إنشاء اسم الملف بالصيغة المطلوبة: الموديل_الفئة_الجيل_سنة الصنع
    generateSmartFilename(carInfo, index, brandHint = '') {
        const parts = [];

        // 1. الموديل (Model)
        if (carInfo.model) {
            parts.push(carInfo.model);
        } else if (brandHint) {
            parts.push(brandHint.replace(/[^a-zA-Z0-9]/g, '_'));
        } else {
            parts.push('Unknown');
        }

        // 2. الفئة (Trim)
        parts.push(carInfo.trim || 'Standard');

        // 3. الجيل (Generation)
        parts.push(carInfo.generation || 'Current_Gen');

        // 4. سنة الصنع (Year)
        parts.push(carInfo.year || new Date().getFullYear().toString());

        // 5. رقم تسلسلي
        parts.push(String(index).padStart(3, '0'));

        // تنظيف وتجميع
        const filename = parts
            .map(part => part.replace(/[^a-zA-Z0-9]/g, '_'))
            .map(part => part.replace(/_+/g, '_'))
            .map(part => part.replace(/^_+|_+$/g, ''))
            .filter(part => part.length > 0)
            .join('_');

        return filename + '.jpg';
    }

    // توليد صور اختبارية بالتسمية الذكية
    async generateTestImages(brand, count = 10) {
        console.log(`🧪 توليد ${count} صورة اختبارية لـ ${brand}`);
        console.log(`📝 بالصيغة: الموديل_الفئة_الجيل_سنة الصنع`);
        console.log('─'.repeat(60));

        const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        const results = [];

        // بيانات اختبارية واقعية
        const testData = {
            Honda: [
                { model: 'Civic', trim: 'SI', year: '2024' },
                { model: 'Accord', trim: 'Sport', year: '2023' },
                { model: 'CRV', trim: 'EX', year: '2024' },
                { model: 'Pilot', trim: 'Touring', year: '2023' },
                { model: 'Odyssey', trim: 'EX_L', year: '2024' }
            ],
            Toyota: [
                { model: 'Camry', trim: 'XSE', year: '2024' },
                { model: 'Corolla', trim: 'SE', year: '2023' },
                { model: 'RAV4', trim: 'XLE', year: '2024' },
                { model: 'Prius', trim: 'Limited', year: '2024' },
                { model: 'Highlander', trim: 'Platinum', year: '2023' }
            ],
            BMW: [
                { model: '320i', trim: 'M_Sport', year: '2024' },
                { model: 'X3', trim: 'xDrive30i', year: '2023' },
                { model: 'X5', trim: 'M50i', year: '2024' },
                { model: 'M3', trim: 'Competition', year: '2023' },
                { model: '530i', trim: 'Luxury', year: '2024' }
            ]
        };

        const brandModels = testData[brand] || testData.Honda;

        for (let i = 0; i < count; i++) {
            const modelData = brandModels[i % brandModels.length];
            
            // إضافة معلومات الجيل
            const year = parseInt(modelData.year);
            let generation;
            if (year >= 2022) generation = 'Latest_Gen';
            else if (year >= 2018) generation = 'Current_Gen';
            else generation = 'Previous_Gen';

            const carInfo = {
                brand: brand,
                model: modelData.model,
                trim: modelData.trim,
                year: modelData.year,
                generation: generation
            };

            // إنشاء اسم الملف
            const filename = this.generateSmartFilename(carInfo, i + 1, brand);

            // إنشاء ملف صورة وهمية
            const dummyImageBuffer = Buffer.from('fake-image-data-for-testing');
            const filePath = path.join(brandDir, filename);
            
            await fs.writeFile(filePath, dummyImageBuffer);

            results.push({
                filename,
                carInfo,
                path: filePath
            });

            console.log(`✅ ${filename}`);
            console.log(`   📊 ${carInfo.model} | ${carInfo.trim} | ${carInfo.generation} | ${carInfo.year}`);
        }

        console.log('─'.repeat(60));
        console.log(`🎉 تم إنشاء ${results.length} ملف بنجاح في: ${brandDir}`);
        return results;
    }

    // اختبار شامل لنظام التسمية
    async testNamingSystem() {
        console.log('🚀 بدء اختبار نظام التسمية الذكية');
        console.log('📝 الصيغة: الموديل_الفئة_الجيل_سنة الصنع_رقم');
        console.log('🌍 مثال: Civic_SI_Latest_Gen_2024_001.jpg');
        console.log('='.repeat(70));

        const testResults = [];

        // اختبار عدة علامات
        for (const brand of this.brands.slice(0, 3)) {
            console.log(`\n🏭 اختبار ${brand}...`);
            
            try {
                const results = await this.generateTestImages(brand, 5);
                testResults.push({ brand, success: true, count: results.length });
                
                // عرض أمثلة من الأسماء المُولدة
                console.log('📁 أمثلة على الأسماء المُولدة:');
                results.slice(0, 3).forEach(result => {
                    console.log(`   ${result.filename}`);
                });
                
            } catch (error) {
                console.log(`❌ فشل في ${brand}: ${error.message}`);
                testResults.push({ brand, success: false, error: error.message });
            }
        }

        // عرض النتيجة النهائية
        console.log('\n🏆 نتائج الاختبار النهائية:');
        console.log('='.repeat(70));
        testResults.forEach(result => {
            if (result.success) {
                console.log(`✅ ${result.brand}: ${result.count} ملف تم إنشاؤه`);
            } else {
                console.log(`❌ ${result.brand}: فشل`);
            }
        });

        return testResults;
    }
}

export default EnhancedNamingScraper;
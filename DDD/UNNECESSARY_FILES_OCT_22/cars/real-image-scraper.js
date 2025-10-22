import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌐 نظام تحميل من مصادر متعددة مع التسمية الذكية
class MultiSourceCarScraper {
    constructor() {
        this.brands = ['Honda', 'Toyota', 'BMW', 'Mercedes-Benz', 'Audi'];
        
        // مصادر الصور المتاحة
        this.imageSources = [
            'https://picsum.photos/800/600', // صور عشوائية عالية الجودة
            'https://source.unsplash.com/800x600/?car',
            'https://source.unsplash.com/800x600/?automobile',
            'https://source.unsplash.com/800x600/?vehicle'
        ];

        // بيانات السيارات الواقعية
        this.carDatabase = {
            'Honda': [
                { model: 'Civic', trim: 'SI', year: '2024', generation: 'Latest_Gen' },
                { model: 'Accord', trim: 'Sport', year: '2023', generation: 'Latest_Gen' },
                { model: 'CRV', trim: 'EX', year: '2024', generation: 'Latest_Gen' },
                { model: 'Pilot', trim: 'Touring', year: '2023', generation: 'Latest_Gen' },
                { model: 'Odyssey', trim: 'EX_L', year: '2024', generation: 'Latest_Gen' },
                { model: 'Ridgeline', trim: 'RTL_E', year: '2023', generation: 'Current_Gen' },
                { model: 'Passport', trim: 'Elite', year: '2024', generation: 'Current_Gen' },
                { model: 'HR_V', trim: 'EX_L', year: '2023', generation: 'Latest_Gen' }
            ],
            'Toyota': [
                { model: 'Camry', trim: 'XSE', year: '2024', generation: 'Latest_Gen' },
                { model: 'Corolla', trim: 'SE', year: '2023', generation: 'Latest_Gen' },
                { model: 'RAV4', trim: 'XLE', year: '2024', generation: 'Latest_Gen' },
                { model: 'Prius', trim: 'Limited', year: '2024', generation: 'Latest_Gen' },
                { model: 'Highlander', trim: 'Platinum', year: '2023', generation: 'Latest_Gen' },
                { model: 'Sienna', trim: 'Limited', year: '2024', generation: 'Current_Gen' },
                { model: 'Tacoma', trim: 'TRD_Pro', year: '2023', generation: 'Current_Gen' },
                { model: 'Tundra', trim: 'Capstone', year: '2024', generation: 'Latest_Gen' }
            ],
            'BMW': [
                { model: '320i', trim: 'M_Sport', year: '2024', generation: 'Latest_Gen' },
                { model: '330i', trim: 'xDrive', year: '2023', generation: 'Latest_Gen' },
                { model: 'X3', trim: 'xDrive30i', year: '2024', generation: 'Latest_Gen' },
                { model: 'X5', trim: 'M50i', year: '2023', generation: 'Latest_Gen' },
                { model: 'M3', trim: 'Competition', year: '2024', generation: 'Latest_Gen' },
                { model: 'X7', trim: 'xDrive40i', year: '2023', generation: 'Current_Gen' },
                { model: '530i', trim: 'Luxury', year: '2024', generation: 'Latest_Gen' },
                { model: 'Z4', trim: 'sDrive30i', year: '2023', generation: 'Current_Gen' }
            ]
        };
    }

    // تحميل صورة فعلية من مصدر خارجي
    async downloadRealImage(url, filePath) {
        return new Promise((resolve, reject) => {
            const file = require('fs').createWriteStream(filePath);
            
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });

                file.on('error', (error) => {
                    require('fs').unlink(filePath, () => {});
                    reject(error);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    // إنشاء اسم ملف بالصيغة المطلوبة
    generateSmartFilename(carData, index) {
        const parts = [
            carData.model,
            carData.trim,
            carData.generation,
            carData.year,
            String(index).padStart(3, '0')
        ];

        const filename = parts
            .map(part => part.replace(/[^a-zA-Z0-9]/g, '_'))
            .join('_');

        return filename + '.jpg';
    }

    // تحميل صور فعلية لعلامة تجارية
    async downloadRealBrandImages(brandName, count = 5) {
        console.log(`\n🚗 تحميل صور حقيقية لـ ${brandName}`);
        console.log(`📝 بالصيغة: الموديل_الفئة_الجيل_سنة الصنع`);
        console.log('─'.repeat(60));

        const brandDir = path.join(__dirname, 'brand_directories', brandName.replace(/[^a-zA-Z0-9]/g, '_'));
        await fs.mkdir(brandDir, { recursive: true });

        const carModels = this.carDatabase[brandName] || this.carDatabase['Honda'];
        const results = [];
        let successful = 0;

        for (let i = 0; i < count; i++) {
            const carData = carModels[i % carModels.length];
            const filename = this.generateSmartFilename(carData, i + 1);
            const filePath = path.join(brandDir, filename);

            // اختيار مصدر صورة عشوائي
            const imageSource = this.imageSources[i % this.imageSources.length];
            
            try {
                console.log(`📥 ${i + 1}/${count} ${filename}...`);
                
                await this.downloadRealImage(imageSource, filePath);
                
                // التحقق من حجم الملف
                const stats = await fs.stat(filePath);
                const sizeKB = (stats.size / 1024).toFixed(1);
                
                if (stats.size > 10000) { // أكثر من 10KB
                    console.log(`✅ ${filename} (${sizeKB}KB)`);
                    console.log(`   📊 ${carData.model} | ${carData.trim} | ${carData.generation} | ${carData.year}`);
                    successful++;
                    
                    results.push({
                        filename,
                        carData,
                        size: sizeKB + 'KB',
                        success: true
                    });
                } else {
                    console.log(`❌ ${filename} - صغيرة جداً`);
                    await fs.unlink(filePath); // حذف الملف الصغير
                }
                
                // انتظار قصير بين التحميلات
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`❌ فشل ${filename}: ${error.message}`);
                results.push({
                    filename,
                    carData,
                    success: false,
                    error: error.message
                });
            }
        }

        console.log('─'.repeat(60));
        console.log(`🎉 تم تحميل ${successful}/${count} صورة حقيقية`);
        
        return {
            brand: brandName,
            total: count,
            successful,
            results
        };
    }

    // تحميل شامل للصور الحقيقية
    async downloadAllRealImages(imagesPerBrand = 8) {
        console.log('🚀 بدء تحميل الصور الحقيقية');
        console.log('🏷️  مع التسمية الذكية: الموديل_الفئة_الجيل_سنة الصنع');
        console.log('🌍 مصادر متعددة للصور عالية الجودة');
        console.log('='.repeat(70));

        const allResults = [];
        let totalDownloaded = 0;

        for (const brand of this.brands) {
            try {
                const result = await this.downloadRealBrandImages(brand, imagesPerBrand);
                allResults.push(result);
                totalDownloaded += result.successful;

                // انتظار بين العلامات
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`❌ خطأ في ${brand}: ${error.message}`);
                allResults.push({
                    brand,
                    total: imagesPerBrand,
                    successful: 0,
                    error: error.message
                });
            }
        }

        // عرض النتائج النهائية
        console.log('\n🏆 نتائج التحميل النهائية');
        console.log('='.repeat(70));
        console.log(`📊 إجمالي الصور المُحملة: ${totalDownloaded}`);
        console.log(`🏭 العلامات المعالجة: ${this.brands.length}`);
        
        console.log('\n📈 تفاصيل كل علامة:');
        allResults.forEach(result => {
            const percentage = result.total > 0 ? (result.successful / result.total * 100).toFixed(1) : '0.0';
            console.log(`   ${result.brand}: ${result.successful}/${result.total} (${percentage}%)`);
        });

        return allResults;
    }

    // اختبار تحميل صورة واحدة
    async testSingleDownload(brandName = 'Honda') {
        console.log(`🧪 اختبار تحميل صورة واحدة لـ ${brandName}`);
        
        try {
            const result = await this.downloadRealBrandImages(brandName, 1);
            
            if (result.successful > 0) {
                console.log('✅ نجح الاختبار! جاري بدء التحميل الشامل...');
                return true;
            } else {
                console.log('❌ فشل الاختبار');
                return false;
            }
            
        } catch (error) {
            console.log('❌ خطأ في الاختبار:', error.message);
            return false;
        }
    }
}

export default MultiSourceCarScraper;
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 أداة اختبار سريع لموقع جديد
class WebsiteTester {
    constructor() {
        this.session = axios.create({
            timeout: 15000,
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
    }

    // اختبار موقع جديد
    async testWebsite(baseUrl, testQueries = ['audi', 'bmw', 'mercedes']) {
        console.log(`🌐 اختبار الموقع: ${baseUrl}`);
        console.log('='.repeat(60));

        const results = {
            url: baseUrl,
            accessible: false,
            hasImages: false,
            imageCount: 0,
            quality: 'unknown',
            recommendations: []
        };

        try {
            // اختبار الوصول الأساسي
            console.log('🔍 اختبار الوصول الأساسي...');
            const response = await this.session.get(baseUrl);
            results.accessible = response.status === 200;

            if (!results.accessible) {
                console.log(`❌ الموقع غير متاح (Status: ${response.status})`);
                return results;
            }

            console.log('✅ الموقع متاح');

            // استخراج الصور من الصفحة الرئيسية
            const images = this.extractImages(response.data);
            results.hasImages = images.length > 0;
            results.imageCount = images.length;

            console.log(`📸 عدد الصور في الصفحة الرئيسية: ${images.length}`);

            if (images.length > 0) {
                console.log('🖼️  عينة من الصور:');
                images.slice(0, 3).forEach((img, i) => {
                    console.log(`   ${i + 1}. ${img.substring(0, 80)}...`);
                });
            }

            // اختبار البحث
            console.log('\n🔍 اختبار البحث...');
            for (const query of testQueries) {
                try {
                    const searchResults = await this.testSearch(baseUrl, query);
                    if (searchResults.hasImages) {
                        console.log(`   ✅ "${query}": ${searchResults.imageCount} صورة`);
                        results.hasImages = true;
                        results.imageCount = Math.max(results.imageCount, searchResults.imageCount);
                    } else {
                        console.log(`   ⚠️  "${query}": لا توجد صور`);
                    }
                } catch (error) {
                    console.log(`   ❌ "${query}": خطأ في البحث`);
                }

                // انتظار قصير
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // تقييم الجودة المحتملة
            results.quality = this.assessPotentialQuality(results);
            results.recommendations = this.generateRecommendations(results);

            console.log('\n📊 التقييم العام:');
            console.log(`   جودة محتملة: ${results.quality}`);
            console.log(`   مناسب للscraping: ${results.hasImages ? 'نعم' : 'لا'}`);

            if (results.recommendations.length > 0) {
                console.log('\n💡 التوصيات:');
                results.recommendations.forEach(rec => console.log(`   • ${rec}`));
            }

        } catch (error) {
            console.log(`❌ خطأ في اختبار الموقع: ${error.message}`);
            results.recommendations.push('تحقق من صحة الرابط وإعدادات الشبكة');
        }

        console.log('='.repeat(60));
        return results;
    }

    // استخراج الصور من HTML
    extractImages(html) {
        const imagePatterns = [
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
            /https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp|gif)/gi,
            /data:image\/[^;]+;base64,[^"'\s]+/gi
        ];

        const images = [];

        imagePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                images.push(match[1]);
            }
        });

        // فلترة التكرارات وإزالة الصور الصغيرة
        return [...new Set(images)].filter(img =>
            !img.includes('icon') &&
            !img.includes('logo') &&
            !img.includes('button') &&
            img.length > 10
        );
    }

    // اختبار البحث
    async testSearch(baseUrl, query) {
        const searchPatterns = [
            `${baseUrl}/search?q=${query}`,
            `${baseUrl}/search/${query}`,
            `${baseUrl}?s=${query}`,
            `${baseUrl}/?search=${query}`
        ];

        for (const searchUrl of searchPatterns) {
            try {
                const response = await this.session.get(searchUrl);
                const images = this.extractImages(response.data);

                if (images.length > 0) {
                    return {
                        hasImages: true,
                        imageCount: images.length,
                        searchUrl: searchUrl
                    };
                }
            } catch (error) {
                continue;
            }
        }

        return { hasImages: false, imageCount: 0 };
    }

    // تقييم الجودة المحتملة
    assessPotentialQuality(results) {
        if (!results.accessible) return 'غير متاح';
        if (!results.hasImages) return 'لا توجد صور';
        if (results.imageCount > 50) return 'ممتاز - موقع غني بالصور';
        if (results.imageCount > 20) return 'جيد - صور كافية';
        if (results.imageCount > 5) return 'مقبول - يحتاج تطوير';
        return 'ضعيف - قلة صور';
    }

    // توليد التوصيات
    generateRecommendations(results) {
        const recommendations = [];

        if (!results.accessible) {
            recommendations.push('تحقق من صحة الرابط والشبكة');
            return recommendations;
        }

        if (!results.hasImages) {
            recommendations.push('الموقع لا يحتوي على صور كافية للسيارات');
            recommendations.push('جرب موقع آخر متخصص في صور السيارات');
        } else {
            if (results.imageCount < 10) {
                recommendations.push('عدد الصور قليل - قد يحتاج وقت طويل لجمع مجموعة كبيرة');
            }

            recommendations.push('اختبر تحميل عينة صغيرة للتأكد من الجودة');
            recommendations.push('تحقق من شروط الاستخدام قبل التحميل الجماعي');
        }

        return recommendations;
    }

    // حفظ النتائج
    async saveResults(results, filename = 'website_test_results.json') {
        const outputPath = path.join(__dirname, filename);
        await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
        console.log(`💾 تم حفظ النتائج في: ${filename}`);
    }
}

// استخدام الأداة
async function testNewWebsite() {
    const tester = new WebsiteTester();

    // قائمة مواقع للاختبار
    const websitesToTest = [
        'https://www.autotrader.com',
        'https://www.cars.com',
        'https://www.cargurus.com',
        'https://www.caranddriver.com',
        'https://www.motortrend.com'
    ];

    console.log('🚀 بدء اختبار المواقع الجديدة...\n');

    const allResults = [];

    for (const website of websitesToTest) {
        const results = await tester.testWebsite(website);
        allResults.push(results);

        // انتظار بين الاختبارات
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // عرض ملخص
    console.log('\n📊 ملخص النتائج:');
    console.log('='.repeat(60));

    allResults.forEach(result => {
        const status = result.accessible ?
            (result.hasImages ? '✅ مناسب' : '⚠️  لا صور') :
            '❌ غير متاح';

        console.log(`${status} ${result.url}`);
        console.log(`   الصور: ${result.imageCount}, الجودة: ${result.quality}`);
        console.log('');
    });

    // حفظ النتائج
    await tester.saveResults(allResults, 'website_comparison_results.json');

    // التوصية الأفضل
    const bestResult = allResults
        .filter(r => r.accessible && r.hasImages)
        .sort((a, b) => b.imageCount - a.imageCount)[0];

    if (bestResult) {
        console.log(`🏆 أفضل موقع: ${bestResult.url}`);
        console.log(`   عدد الصور: ${bestResult.imageCount}`);
        console.log(`   الجودة: ${bestResult.quality}`);
    }
}

// تشغيل الاختبار
if (import.meta.url === `file://${process.argv[1]}`) {
    const websiteUrl = process.argv[2];
    const tester = new WebsiteTester();

    if (websiteUrl) {
        // اختبار موقع محدد
        tester.testWebsite(websiteUrl).then(results => {
            tester.saveResults(results);
        });
    } else {
        // اختبار مواقع متعددة
        testNewWebsite();
    }
}

export default WebsiteTester;
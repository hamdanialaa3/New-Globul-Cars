import axios from 'axios';

// اختبار بسيط جداً لـ Cars.com
async function testCarsComStructure() {
    console.log('🔍 تحليل هيكل Cars.com...');

    try {
        const response = await axios.get('https://www.cars.com/shopping/results/?makes[]=honda&page=1&maximum_distance=100&zip=10001', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ نجح الاتصال');

        const html = response.data;

        // البحث عن أنماط مختلفة للصور
        const patterns = [
            /data-src="([^"]*\.jpg[^"]*)"/g,
            /src="([^"]*\.jpg[^"]*)"/g,
            /data-lazy-src="([^"]*\.jpg[^"]*)"/g,
            /"image_url":"([^"]*\.jpg[^"]*)"/g,
            /"photo_url":"([^"]*\.jpg[^"]*)"/g
        ];

        let totalImages = 0;

        patterns.forEach((pattern, index) => {
            const matches = html.match(pattern);
            if (matches) {
                console.log(`نمط ${index + 1}: ${matches.length} تطابق`);
                totalImages += matches.length;

                // عرض عينة
                if (matches.length > 0) {
                    console.log(`  عينة: ${matches[0].substring(0, 80)}...`);
                }
            }
        });

        console.log(`\n📊 إجمالي الصور المحتملة: ${totalImages}`);

        if (totalImages > 0) {
            console.log('🎯 نجح التحليل! جاهز للتحميل');
        } else {
            console.log('⚠️ لم يتم العثور على صور - يحتاج تحليل أعمق');
        }

    } catch (error) {
        console.log('❌ خطأ:', error.message);
    }
}

testCarsComStructure();
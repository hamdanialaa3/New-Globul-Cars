import axios from 'axios';

// اختبار بسيط جداً
async function testCarsCom() {
    console.log('🧪 اختبار بسيط لـ Cars.com...');

    try {
        const response = await axios.get('https://www.cars.com/shopping/results/?makes[]=honda&maximum_distance=100&zip=10001', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ نجح الاتصال');

        // عد الصور
        const imgMatches = response.data.match(/<img[^>]+src=["'][^"']+/g);
        console.log(`📸 عدد عناصر الصور: ${imgMatches ? imgMatches.length : 0}`);

        // ابحث عن صور السيارات
        const carImgMatches = response.data.match(/data-src=["'][^"']*\.jpg[^"']*/g);
        console.log(`🚗 صور السيارات المحتملة: ${carImgMatches ? carImgMatches.length : 0}`);

        if (carImgMatches && carImgMatches.length > 0) {
            console.log('🎯 يمكن استخراج الصور!');
            console.log('عينة:', carImgMatches[0].substring(0, 100) + '...');
        }

    } catch (error) {
        console.log('❌ فشل:', error.message);
    }
}

testCarsCom();
import axios from 'axios';

// اختبار بسيط لموقع
async function quickTest(url) {
    console.log(`🌐 اختبار: ${url}`);

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`✅ متاح - Status: ${response.status}`);

        // عد الصور
        const imageMatches = response.data.match(/<img[^>]+src=["'][^"']+\.(?:jpg|jpeg|png|webp)/gi);
        const imageCount = imageMatches ? imageMatches.length : 0;

        console.log(`📸 عدد الصور: ${imageCount}`);

        if (imageCount > 0) {
            console.log('🎯 مناسب للاختبار!');
        } else {
            console.log('⚠️  لا توجد صور كافية');
        }

    } catch (error) {
        console.log(`❌ خطأ: ${error.message}`);
    }
}

// اختبار مواقع سريع
async function testMultipleSites() {
    const sites = [
        'https://www.cars.com',
        'https://www.autotrader.com',
        'https://www.cargurus.com'
    ];

    console.log('🚀 اختبار سريع للمواقع...\n');

    for (const site of sites) {
        await quickTest(site);
        console.log(''); // سطر فارغ

        // انتظار
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testMultipleSites();
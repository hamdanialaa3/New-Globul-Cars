import axios from 'axios';

async function testWebsiteAccess() {
    const urls = [
        'https://www.netcarshow.com/',
        'https://www.netcarshow.com/bmw/',
        'https://www.netcarshow.com/mercedes-benz/'
    ];

    console.log('🔍 Testing website access...\n');

    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            console.log(`✅ Status: ${response.status}`);
            console.log(`📏 Content Length: ${response.data.length} characters`);

            // Check for common blocking indicators
            if (response.data.includes('blocked') || response.data.includes('forbidden') ||
                response.data.includes('access denied') || response.data.includes('403') ||
                response.data.includes('429')) {
                console.log('⚠️  Possible blocking detected in content');
            }

            if (response.status === 403) {
                console.log('🚫 HTTP 403 Forbidden - Device is likely blocked');
            } else if (response.status === 429) {
                console.log('⏱️  HTTP 429 Too Many Requests - Rate limited');
            } else if (response.status === 200) {
                console.log('✅ Access successful');
            }

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);

            if (error.response) {
                console.log(`📊 Status Code: ${error.response.status}`);

                if (error.response.status === 403) {
                    console.log('🚫 CONFIRMED: Device is blocked (403 Forbidden)');
                } else if (error.response.status === 429) {
                    console.log('⏱️  Rate limited (429 Too Many Requests)');
                } else if (error.response.status === 503) {
                    console.log('🛠️  Service Unavailable');
                }
            } else if (error.code === 'ECONNREFUSED') {
                console.log('🔌 Connection refused');
            } else if (error.code === 'ENOTFOUND') {
                console.log('🌐 DNS resolution failed');
            }
        }

        console.log('---\n');

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

testWebsiteAccess().catch(console.error);
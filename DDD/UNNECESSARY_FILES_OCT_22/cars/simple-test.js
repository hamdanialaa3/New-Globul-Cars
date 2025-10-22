import axios from 'axios';

async function simpleTest() {
    console.log('🧪 Simple NetCarShow connection test...\n');

    try {
        console.log('Testing connection to NetCarShow...');
        const response = await axios.get('https://www.netcarshow.com/', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ Connection successful!');
        console.log(`Status: ${response.status}`);
        console.log(`Content length: ${response.data.length} characters`);

        // Check if we got HTML
        if (response.data.includes('<html') || response.data.includes('<HTML')) {
            console.log('✅ Received HTML content');
        } else {
            console.log('⚠️  Did not receive expected HTML content');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

simpleTest();
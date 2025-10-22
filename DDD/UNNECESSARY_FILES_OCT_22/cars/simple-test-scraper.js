import axios from 'axios';

console.log('🚀 Testing Ultimate Anti-Block Scraper...');
console.log('📋 Node.js version:', process.version);
console.log('📁 Working directory:', process.cwd());

// اختبار بسيط للاتصال
async function testConnection() {
    try {
        console.log('\n🔍 Testing connection to NetCarShow...');
        const response = await axios.get('https://www.netcarshow.com/', {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log('✅ Connection successful!');
        console.log('📊 Status:', response.status);
        console.log('📏 Content length:', response.data.length);
        
        // فحص بسيط للمحتوى
        if (response.data.includes('NetCarShow')) {
            console.log('✅ Content validation passed');
        } else {
            console.log('⚠️  Content validation failed - site may have changed');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Timeout - site may be slow or blocked');
        } else if (error.response) {
            console.log('📊 Response status:', error.response.status);
        }
        
        return false;
    }
}

// تشغيل الاختبار
testConnection().then(success => {
    if (success) {
        console.log('\n🎉 System test passed! Ready for full scraping.');
    } else {
        console.log('\n❌ System test failed. Check your internet connection or try with VPN.');
    }
}).catch(error => {
    console.error('❌ Test error:', error.message);
});
import NetCarShowScraper from './scraper.js';

async function testScraper() {
    console.log('🧪 Testing NetCarShow Scraper...\n');

    const scraper = new NetCarShowScraper();

    try {
        // Test 1: Check if we can fetch the main page
        console.log('Test 1: Fetching main page...');
        const html = await scraper.fetchPage('https://www.netcarshow.com/');
        console.log('✅ Main page fetched successfully\n');

        // Test 2: Extract brands
        console.log('Test 2: Extracting brands...');
        const brands = await scraper.getAllBrands();
        console.log(`✅ Found ${brands.length} brands\n`);

        // Test 3: Test one brand (if available)
        if (brands.length > 0) {
            console.log('Test 3: Testing first brand...');
            const firstBrand = brands[0];
            const { brandName, models } = await scraper.getBrandModels(firstBrand);
            console.log(`✅ Brand: ${brandName}, Models: ${models.length}\n`);
        }

        // Test 4: Test file saving
        console.log('Test 4: Testing file operations...');
        await scraper.saveBrandData('Test Brand', [
            { name: 'Test Model 2023', year: 2023 },
            { name: 'Test Model 2022', year: 2022 }
        ]);
        console.log('✅ Test file created successfully\n');

        console.log('🎉 All tests passed! Scraper is ready to use.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Make sure Node.js is installed');
        console.log('3. Verify cheerio is installed: npm install cheerio');
    }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testScraper().catch(console.error);
}

export default testScraper;
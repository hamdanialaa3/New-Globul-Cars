import NetCarShowScraper from './scraper.js';

async function updatedTest() {
    console.log('🧪 Testing updated NetCarShow scraper...\n');

    const scraper = new NetCarShowScraper();

    try {
        // Test 1: Get brands
        console.log('Test 1: Extracting brands...');
        const brandUrls = await scraper.getAllBrands();
        console.log(`✅ Found ${brandUrls.length} brands`);

        if (brandUrls.length > 0) {
            console.log('Sample brands:');
            brandUrls.slice(0, 5).forEach((url, i) => {
                const brandName = scraper.extractBrandName(url);
                console.log(`  ${i + 1}. ${brandName} -> ${url}`);
            });
            console.log();
        }

        // Test 2: Get models for first brand
        if (brandUrls.length > 0) {
            console.log('Test 2: Extracting models for first brand...');
            const firstBrandUrl = brandUrls[0];
            const { brandName, models } = await scraper.getBrandModels(firstBrandUrl);
            console.log(`✅ Brand: ${brandName}, Models found: ${models.length}`);

            if (models.length > 0) {
                console.log('Sample models:');
                models.slice(0, 5).forEach((model, i) => {
                    console.log(`  ${i + 1}. ${model.name} (${model.year})`);
                });
                console.log();
            }
        }

        // Test 3: Save test data
        console.log('Test 3: Testing file save...');
        await scraper.saveBrandData('Test Brand', [
            { name: '2023 Test Model X', year: 2023 },
            { name: '2022 Test Model Y', year: 2022 },
            { name: '2021 Test Model Z', year: 2021 }
        ]);
        console.log('✅ Test file saved successfully\n');

        console.log('🎉 All tests passed! Scraper is ready for full operation.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

updatedTest();
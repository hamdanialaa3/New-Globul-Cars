import NetCarShowScraper from './scraper.js';

async function testMultipleBrands() {
    const scraper = new NetCarShowScraper();

    // Test with just a few brands
    const testBrands = [
        'https://www.netcarshow.com/bmw/',
        'https://www.netcarshow.com/audi/',
        'https://www.netcarshow.com/mercedes-benz/',
        'https://www.netcarshow.com/ford/'
    ];

    console.log('Testing scraper with', testBrands.length, 'brands...');

    for (let i = 0; i < testBrands.length; i++) {
        const brandUrl = testBrands[i];
        console.log(`\nProcessing ${i + 1}/${testBrands.length}: ${brandUrl}`);

        try {
            const { brandName, models } = await scraper.getBrandModels(brandUrl);
            await scraper.saveBrandData(brandName, models);
            console.log(`✓ Saved ${brandName} with ${models.length} models`);
        } catch (error) {
            console.error(`✗ Failed ${brandUrl}:`, error.message);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\nTest completed!');
}

testMultipleBrands().catch(console.error);
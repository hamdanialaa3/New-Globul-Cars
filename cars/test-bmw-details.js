import NetCarShowScraper from './scraper.js';

async function testBMWWithDetails() {
    const scraper = new NetCarShowScraper();

    console.log('Testing BMW brand scraping with detailed specifications...');

    try {
        // Get BMW models
        const { brandName, models } = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');

        console.log(`Found ${models.length} BMW models`);

        // Get detailed specs for first 3 models to test
        const testModels = models.slice(0, 3);

        for (let i = 0; i < testModels.length; i++) {
            const model = testModels[i];
            console.log(`\n--- Processing ${model.name} (${model.year}) ---`);

            try {
                const details = await scraper.getModelDetails(model.url);
                if (details) {
                    model.details = details;
                    console.log(`✓ Engine: ${details.engine || 'Not found'}`);
                    console.log(`✓ Power: ${details.power || 'Not found'}`);
                    console.log(`✓ Transmission: ${details.transmission || 'Not found'}`);
                    console.log(`✓ Drivetrain: ${details.drivetrain || 'Not found'}`);
                    console.log(`✓ Dimensions: ${details.dimensions || 'Not found'}`);
                    console.log(`✓ Acceleration: ${details.acceleration || 'Not found'}`);
                } else {
                    console.log('✗ No details extracted');
                }
            } catch (error) {
                console.log(`✗ Error getting details: ${error.message}`);
            }

            // Small delay between requests
            await scraper.delay(1000);
        }

        // Save the test data
        await scraper.saveBrandData('BMW_Test', testModels);
        console.log('\n✓ Test data saved to BMW_Test.txt');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBMWWithDetails().catch(console.error);
import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function updateBMWWithDetails() {
    const scraper = new NetCarShowScraper();

    console.log('Updating BMW.txt with detailed specifications...');

    try {
        // Get all BMW models
        const { brandName, models } = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');
        console.log(`Found ${models.length} BMW models`);

        // Process models in batches to avoid overwhelming the server
        const batchSize = 10;
        const totalBatches = Math.ceil(models.length / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const startIdx = batch * batchSize;
            const endIdx = Math.min(startIdx + batchSize, models.length);
            const batchModels = models.slice(startIdx, endIdx);

            console.log(`Processing batch ${batch + 1}/${totalBatches} (models ${startIdx + 1}-${endIdx})`);

            // Get detailed specs for this batch
            for (let i = 0; i < batchModels.length; i++) {
                const model = batchModels[i];
                console.log(`  Getting specs for ${model.name} (${model.year})`);

                try {
                    const details = await scraper.getModelDetails(model.url);
                    if (details) {
                        model.details = details;
                        console.log(`    ✓ Found specs: ${details.engine ? 'Engine' : ''} ${details.power ? 'Power' : ''} ${details.transmission ? 'Trans' : ''}`.trim());
                    } else {
                        console.log(`    ✗ No specs found`);
                    }
                } catch (error) {
                    console.log(`    ✗ Error: ${error.message}`);
                }

                // Delay between requests
                await scraper.delay(1000);
            }

            // Save progress after each batch
            await scraper.saveBrandData('BMW', models);
            console.log(`  ✓ Batch ${batch + 1} saved`);

            // Longer delay between batches
            if (batch < totalBatches - 1) {
                console.log('  Waiting 5 seconds before next batch...');
                await scraper.delay(5000);
            }
        }

        console.log('\n🎉 BMW.txt has been updated with detailed specifications!');

    } catch (error) {
        console.error('Update failed:', error);
    }
}

updateBMWWithDetails().catch(console.error);
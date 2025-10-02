import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function updateAllBrandsWithSpecs() {
    const scraper = new NetCarShowScraper();

    console.log('Starting comprehensive update for all car brands with detailed specs...');

    // Get all brand URLs first
    const brandUrls = await scraper.getAllBrands();
    console.log(`Found ${brandUrls.length} brands to process`);

    // Process each brand
    for (let i = 0; i < brandUrls.length; i++) {
        const brandUrl = brandUrls[i];
        console.log(`\n=== Processing Brand ${i + 1}/${brandUrls.length}: ${brandUrl} ===`);

        try {
            // Get brand models
            const { brandName, models } = await scraper.getBrandModels(brandUrl);
            console.log(`Found ${models.length} models for ${brandName}`);

            // Check if brand file already has specs
            const brandFilePath = path.join(scraper.outputDir, `${brandName}.txt`);
            let hasSpecs = false;

            if (fs.existsSync(brandFilePath)) {
                const content = fs.readFileSync(brandFilePath, 'utf8');
                hasSpecs = content.includes('  Engine:') || content.includes('  Power:') || content.includes('  Transmission:');
            }

            if (hasSpecs) {
                console.log(`✓ ${brandName} already has detailed specs - skipping`);
                continue;
            }

            console.log(`Adding detailed specs to ${models.length} models for ${brandName}...`);

            // Process models in small batches
            const batchSize = 3; // Very small batches for reliability
            let processedCount = 0;

            for (let j = 0; j < models.length; j += batchSize) {
                const batch = models.slice(j, j + batchSize);
                console.log(`  Processing models ${j + 1}-${Math.min(j + batchSize, models.length)}/${models.length}`);

                // Get specs for this batch
                for (const model of batch) {
                    try {
                        const details = await scraper.getModelDetails(model.url);
                        if (details) {
                            model.details = details;
                            processedCount++;
                        }
                    } catch (error) {
                        console.log(`    ✗ Failed to get specs for ${model.name}: ${error.message}`);
                    }

                    // Small delay between models
                    await scraper.delay(1000);
                }

                // Save progress
                await scraper.saveBrandData(brandName, models);
                console.log(`    💾 Saved progress (${processedCount}/${models.length} models with specs)`);

                // Delay between batches
                await scraper.delay(2000);
            }

            console.log(`✓ Completed ${brandName}: ${processedCount}/${models.length} models have specs`);

        } catch (error) {
            console.log(`✗ Failed to process ${brandUrl}: ${error.message}`);
        }

        // Delay between brands
        await scraper.delay(3000);
    }

    console.log('\n🎉 All brands update completed!');
}

updateAllBrandsWithSpecs().catch(console.error);
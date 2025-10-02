import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function resumeBMWUpdate() {
    const scraper = new NetCarShowScraper();

    console.log('Resuming BMW.txt update with detailed specifications...');

    try {
        // Get all BMW models
        const { brandName, models } = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');
        console.log(`Found ${models.length} BMW models`);

        // Check which models already have specs by reading the existing file
        const existingFilePath = path.join(scraper.outputDir, 'BMW.txt');
        let modelsWithSpecs = 0;
        let modelsWithoutSpecs = 0;

        if (fs.existsSync(existingFilePath)) {
            const existingContent = fs.readFileSync(existingFilePath, 'utf8');
            // Count models that have spec details
            const specIndicators = ['  Engine:', '  Power:', '  Transmission:'];
            specIndicators.forEach(indicator => {
                const count = (existingContent.match(new RegExp(indicator, 'g')) || []).length;
                modelsWithSpecs += count;
            });
            modelsWithSpecs = Math.min(modelsWithSpecs, models.length); // Cap at total models
            modelsWithoutSpecs = models.length - modelsWithSpecs;
        } else {
            modelsWithoutSpecs = models.length;
        }

        console.log(`Models with specs: ${modelsWithSpecs}`);
        console.log(`Models without specs: ${modelsWithoutSpecs}`);

        // Process only models without specs
        const modelsToProcess = models.filter(model =>
            !model.details || (!model.details.engine && !model.details.power && !model.details.transmission)
        );

        console.log(`Need to process ${modelsToProcess.length} models`);

        // Process in smaller batches with more error handling
        const batchSize = 5; // Smaller batches for better error recovery
        const totalBatches = Math.ceil(modelsToProcess.length / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const startIdx = batch * batchSize;
            const endIdx = Math.min(startIdx + batchSize, modelsToProcess.length);
            const batchModels = modelsToProcess.slice(startIdx, endIdx);

            console.log(`Processing batch ${batch + 1}/${totalBatches} (models ${startIdx + 1}-${endIdx})`);

            // Get detailed specs for this batch
            for (let i = 0; i < batchModels.length; i++) {
                const model = batchModels[i];
                console.log(`  Getting specs for ${model.name} (${model.year})`);

                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        const details = await scraper.getModelDetails(model.url);
                        if (details) {
                            model.details = details;
                            const hasSpecs = details.engine || details.power || details.transmission;
                            console.log(`    ✓ Found specs: ${hasSpecs ? 'Yes' : 'Limited'}`);
                        } else {
                            console.log(`    ✗ No specs found`);
                        }
                        break; // Success, exit retry loop
                    } catch (error) {
                        retryCount++;
                        console.log(`    ✗ Attempt ${retryCount}/${maxRetries} failed: ${error.message}`);
                        if (retryCount < maxRetries) {
                            await scraper.delay(2000 * retryCount); // Exponential backoff
                        }
                    }
                }

                // Delay between requests
                await scraper.delay(1500);
            }

            // Save progress after each batch
            await scraper.saveBrandData('BMW', models);
            console.log(`  ✓ Batch ${batch + 1} saved (${modelsWithSpecs + (batch + 1) * batchSize} total models processed)`);

            // Longer delay between batches
            if (batch < totalBatches - 1) {
                console.log('  Waiting 3 seconds before next batch...');
                await scraper.delay(3000);
            }
        }

        console.log('\n🎉 BMW.txt update completed!');
        console.log(`Total models with specs: ${models.filter(m => m.details && (m.details.engine || m.details.power || m.details.transmission)).length}/${models.length}`);

    } catch (error) {
        console.error('Update failed:', error);
    }
}

resumeBMWUpdate().catch(console.error);
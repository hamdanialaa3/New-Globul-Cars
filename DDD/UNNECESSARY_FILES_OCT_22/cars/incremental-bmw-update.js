import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function incrementalBMWUpdate() {
    const scraper = new NetCarShowScraper();

    console.log('Incremental BMW update - processing one model at a time...');

    try {
        // Get all BMW models
        const { brandName, models } = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');
        console.log(`Found ${models.length} BMW models`);

        // Read existing file to see which models already have specs
        const existingFilePath = path.join(scraper.outputDir, 'BMW.txt');
        let existingContent = '';
        if (fs.existsSync(existingFilePath)) {
            existingContent = fs.readFileSync(existingFilePath, 'utf8');
        }

        let processedCount = 0;
        let skippedCount = 0;

        // Process each model individually
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const modelKey = `${model.name} (${model.year})`;

            // Check if this model already has specs in the file
            const hasEngine = existingContent.includes(`- ${model.name}`) &&
                            (existingContent.includes('  Engine:') || existingContent.includes('  Power:') || existingContent.includes('  Transmission:'));

            if (hasEngine) {
                skippedCount++;
                if (skippedCount % 50 === 0) {
                    console.log(`Skipped ${skippedCount} models that already have specs...`);
                }
                continue;
            }

            console.log(`Processing ${i + 1}/${models.length}: ${modelKey}`);

            let retryCount = 0;
            const maxRetries = 3;
            let success = false;

            while (retryCount < maxRetries && !success) {
                try {
                    const details = await scraper.getModelDetails(model.url);
                    if (details) {
                        model.details = details;
                        success = true;
                        processedCount++;
                        console.log(`  ✓ Added specs for ${model.name}`);
                    }
                } catch (error) {
                    retryCount++;
                    console.log(`  ✗ Attempt ${retryCount}/${maxRetries} failed: ${error.message}`);
                    if (retryCount < maxRetries) {
                        await scraper.delay(3000 * retryCount);
                    }
                }
            }

            if (!success) {
                console.log(`  ✗ Skipped ${model.name} after ${maxRetries} failed attempts`);
            }

            // Save after each model to preserve progress
            await scraper.saveBrandData('BMW', models);
            console.log(`  💾 Progress saved (${processedCount} new models processed)`);

            // Small delay between models
            await scraper.delay(1000);
        }

        console.log('\n🎉 Incremental BMW update completed!');
        console.log(`Processed: ${processedCount} models`);
        console.log(`Skipped: ${skippedCount} models (already had specs)`);

        // Final count
        const finalContent = fs.readFileSync(existingFilePath, 'utf8');
        const finalSpecCount = (finalContent.match(/Engine:|Power:|Transmission:/g) || []).length;
        console.log(`Total models with specs: ${finalSpecCount}/${models.length}`);

    } catch (error) {
        console.error('Update failed:', error);
    }
}

incrementalBMWUpdate().catch(console.error);
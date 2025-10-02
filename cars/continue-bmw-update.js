import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function continueBMWUpdate() {
    const scraper = new NetCarShowScraper();

    console.log('Continuing BMW update for models without specs...');

    try {
        // Get all BMW models
        const { brandName, models } = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');
        console.log(`Found ${models.length} BMW models`);

        // Read existing file content
        const existingFilePath = path.join(scraper.outputDir, 'BMW.txt');
        const existingContent = fs.readFileSync(existingFilePath, 'utf8');

        let processedCount = 0;
        let errorCount = 0;

        // Process each model
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const modelLine = `- ${model.name}`;

            // Check if this model already has ANY specs (look for indented lines after the model name)
            const modelIndex = existingContent.indexOf(modelLine);
            if (modelIndex === -1) continue; // Model not found in file

            // Look for the next model or section to see if there are specs
            const nextModelIndex = existingContent.indexOf('\n- ', modelIndex + modelLine.length);
            const modelSection = existingContent.substring(modelIndex, nextModelIndex === -1 ? existingContent.length : nextModelIndex);

            // Check if it has any spec details
            const hasSpecs = modelSection.includes('  Engine:') ||
                           modelSection.includes('  Power:') ||
                           modelSection.includes('  Transmission:') ||
                           modelSection.includes('  Drivetrain:') ||
                           modelSection.includes('  Dimensions:');

            if (hasSpecs) {
                continue; // Already has specs
            }

            console.log(`Processing ${i + 1}/${models.length}: ${model.name} (${model.year})`);

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
                        await scraper.delay(2000 * retryCount);
                    }
                }
            }

            if (!success) {
                console.log(`  ✗ Skipped ${model.name} after ${maxRetries} failed attempts`);
                errorCount++;
            }

            // Save after each successful model
            if (success) {
                await scraper.saveBrandData('BMW', models);
                console.log(`  💾 Progress saved (${processedCount} models updated)`);
            }

            // Delay between models
            await scraper.delay(1500);
        }

        console.log('\n🎉 BMW update continuation completed!');
        console.log(`Successfully processed: ${processedCount} models`);
        console.log(`Errors: ${errorCount} models`);

        // Final count
        const finalContent = fs.readFileSync(existingFilePath, 'utf8');
        const finalSpecCount = (finalContent.match(/- [^-]*\n(?:  [A-Z][^:]*:.*\n)*/g) || [])
            .filter(section => section.includes('  Engine:') || section.includes('  Power:') || section.includes('  Transmission:'))
            .length;
        console.log(`Total models with specs: ${finalSpecCount}/${models.length}`);

    } catch (error) {
        console.error('Update failed:', error);
    }
}

continueBMWUpdate().catch(console.error);
import NetCarShowScraper from './scraper.js';

async function testDetailedSpecs() {
    const scraper = new NetCarShowScraper();

    console.log('Testing detailed specifications extraction...');

    // Test with BMW X3 2025
    const testUrl = 'https://www.netcarshow.com/bmw/2025-x3/';

    try {
        console.log(`Testing with: ${testUrl}`);
        const details = await scraper.getModelDetails(testUrl);

        if (details) {
            console.log('\n=== EXTRACTED SPECIFICATIONS ===');
            console.log(`Name: ${details.name}`);
            console.log(`Year: ${details.year}`);
            console.log(`Engine: ${details.engine}`);
            console.log(`Power: ${details.power}`);
            console.log(`Transmission: ${details.transmission}`);
            console.log(`Drivetrain: ${details.drivetrain}`);
            console.log(`Dimensions: ${details.dimensions}`);
            console.log(`Weight: ${details.weight}`);
            console.log(`Top Speed: ${details.topSpeed}`);
            console.log(`Acceleration: ${details.acceleration}`);
            console.log(`Fuel Economy: ${details.fuelEconomy}`);
            console.log('=================================\n');
        } else {
            console.log('No details extracted');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testDetailedSpecs().catch(console.error);
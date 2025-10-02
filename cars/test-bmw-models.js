import NetCarShowScraper from './scraper.js';

async function testBMWExtraction() {
    const scraper = new NetCarShowScraper();
    console.log('Testing BMW model extraction...');

    const result = await scraper.getBrandModels('https://www.netcarshow.com/bmw/');

    console.log(`Brand: ${result.brandName}`);
    console.log(`Total models found: ${result.models.length}`);

    console.log('\nFirst 20 models:');
    result.models.slice(0, 20).forEach((model, i) => {
        console.log(`${i+1}. ${model.name} (${model.year || 'N/A'}) - ${model.url}`);
    });

    console.log('\nLast 10 models:');
    result.models.slice(-10).forEach((model, i) => {
        console.log(`${result.models.length - 9 + i}. ${model.name} (${model.year || 'N/A'}) - ${model.url}`);
    });
}

testBMWExtraction().catch(console.error);
import NetCarShowScraper from './scraper.js';
import * as cheerio from 'cheerio';

async function analyzeMercedes() {
    const scraper = new NetCarShowScraper();
    console.log('Analyzing Mercedes-Benz page...');

    const html = await scraper.fetchPage('https://www.netcarshow.com/mercedes-benz/');
    const $ = cheerio.load(html);

    console.log('Page title:', $('title').text());
    console.log('swSBE elements found:', $('.swSBE').length);
    console.log('Links with /mercedes-benz/ found:', $('a[href*="/mercedes-benz/"]').length);

    // Check for different selectors
    console.log('swBE elements found:', $('.swBE').length);
    console.log('Total links:', $('a').length);

    // Look for model links with different patterns
    const modelLinks = [];
    $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.includes('/mercedes-benz/') && href.split('/').length >= 3) {
            modelLinks.push(href);
        }
    });

    console.log('Model links found:', modelLinks.length);
    if (modelLinks.length > 0) {
        console.log('First 5 model links:');
        modelLinks.slice(0, 5).forEach(link => console.log(' -', link));
    }
}

analyzeMercedes().catch(console.error);
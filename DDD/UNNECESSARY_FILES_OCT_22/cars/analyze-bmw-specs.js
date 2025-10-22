import NetCarShowScraper from './scraper.js';
import * as cheerio from 'cheerio';

async function analyzeBMWPage() {
    const scraper = new NetCarShowScraper();
    console.log('Analyzing BMW X3 page structure...');

    const html = await scraper.fetchPage('https://www.netcarshow.com/bmw/2025-x3/');
    const $ = cheerio.load(html);

    console.log('Page title:', $('title').text());
    console.log('H1:', $('h1').first().text());

    // Look for text containing specifications
    const bodyText = $('body').text();
    const lines = bodyText.split('\n').filter(line => line.trim().length > 10);

    console.log('\nLines containing specs:');
    let specLines = 0;
    lines.forEach((line, i) => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('engine') || lowerLine.includes('power') || lowerLine.includes('transmission') ||
            lowerLine.includes('dimension') || lowerLine.includes('weight') || lowerLine.includes('speed') ||
            lowerLine.includes('length') || lowerLine.includes('width') || lowerLine.includes('height')) {
            console.log(`${i}: ${line.trim()}`);
            specLines++;
            if (specLines > 10) return; // Limit output
        }
    });

    // Look for structured data in paragraphs
    console.log('\nParagraphs with specs:');
    $('p').each((i, elem) => {
        const text = $(elem).text().trim();
        const lowerText = text.toLowerCase();
        if (lowerText.includes('engine') || lowerText.includes('power') || lowerText.includes('hp') ||
            lowerText.includes('kw') || lowerText.includes('transmission')) {
            console.log(`P${i}: ${text}`);
        }
    });
}

analyzeBMWPage().catch(console.error);
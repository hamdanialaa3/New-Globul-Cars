import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function analyzeBrandPage() {
    console.log('🔍 Analyzing a specific brand page (BMW)...\n');

    try {
        const response = await axios.get('https://www.netcarshow.com/bmw/', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        console.log('📊 BMW Page Analysis:');
        console.log(`Total links: ${$('a').length}`);
        console.log(`Links with href: ${$('a[href]').length}`);

        // Look for model links
        let modelLinks = [];
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();

            if (href && text && text.match(/\b(19|20)\d{2}\b/)) {
                modelLinks.push({
                    text: text,
                    href: href
                });
            }
        });

        console.log(`\n🎯 Found ${modelLinks.length} potential model links`);
        console.log('Sample model links:');
        modelLinks.slice(0, 10).forEach((link, i) => {
            console.log(`  ${i + 1}. "${link.text}" -> ${link.href}`);
        });

        // Look for other patterns
        console.log('\n🔍 Looking for other patterns...');

        // Check for divs with model classes
        const modelDivs = $('.model, .car, .item, [class*="model"], [class*="car"]');
        console.log(`Found ${modelDivs.length} model/car divs`);

        // Check for images with car thumbnails
        const carImages = $('img[src*="/R/"], img[alt*="BMW"]');
        console.log(`Found ${carImages.length} car images`);

        // Save page for manual inspection
        fs.writeFileSync('bmw-page.html', response.data);
        console.log('\n💾 Saved BMW page to bmw-page.html for manual inspection');

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeBrandPage();
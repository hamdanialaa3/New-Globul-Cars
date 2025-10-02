import axios from 'axios';
import * as cheerio from 'cheerio';

async function brandExtractionTest() {
    console.log('🧪 Testing brand extraction from NetCarShow...\n');

    try {
        console.log('Fetching main page...');
        const response = await axios.get('https://www.netcarshow.com/', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ Page fetched successfully');
        const $ = cheerio.load(response.data);

        console.log('\n🔍 Looking for brand links...');

        // Look for various patterns of brand links
        const brandSelectors = [
            'a[href*="/"][href*="brand"]',
            'a[href*="/"][href*="make"]',
            'a[href*="/"][href*="manufacturer"]',
            '.brand-list a',
            '.manufacturer-list a',
            '.make-list a',
            'nav a[href*="/"]',
            '.menu a[href*="/"]'
        ];

        let totalLinks = 0;
        let brandLinks = [];

        brandSelectors.forEach((selector, index) => {
            const links = $(selector);
            console.log(`Selector ${index + 1} (${selector}): ${links.length} links found`);

            links.each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();

                if (href && text && text.length > 1 && text.length < 50) {
                    // Check if it's likely a brand link
                    if (href.includes('brand') || href.includes('make') ||
                        (href.split('/').length === 2 && href.startsWith('/'))) {
                        brandLinks.push({
                            url: href.startsWith('/') ? `https://www.netcarshow.com${href}` : href,
                            name: text
                        });
                    }
                }
            });

            totalLinks += links.length;
        });

        console.log(`\n📊 Total links analyzed: ${totalLinks}`);
        console.log(`🎯 Potential brand links found: ${brandLinks.length}`);

        if (brandLinks.length > 0) {
            console.log('\n📋 Sample brand links:');
            brandLinks.slice(0, 10).forEach((brand, index) => {
                console.log(`${index + 1}. ${brand.name} -> ${brand.url}`);
            });
        }

        // Try to find any link that might contain car brands
        console.log('\n🔍 Looking for any links containing car brand names...');
        const allLinks = $('a[href]');
        const carBrandNames = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Volkswagen'];

        let foundBrands = [];
        allLinks.each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();

            for (const brand of carBrandNames) {
                if (text.includes(brand) && href && href.includes('/')) {
                    foundBrands.push({
                        brand: brand,
                        text: text,
                        url: href.startsWith('/') ? `https://www.netcarshow.com${href}` : href
                    });
                    break;
                }
            }
        });

        if (foundBrands.length > 0) {
            console.log('✅ Found specific car brand links:');
            foundBrands.forEach(brand => {
                console.log(`- ${brand.brand}: ${brand.text} -> ${brand.url}`);
            });
        } else {
            console.log('❌ No specific car brand links found');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        }
    }
}

brandExtractionTest();
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function analyzeNetCarShow() {
    console.log('🔍 Analyzing NetCarShow HTML structure...\n');

    try {
        const response = await axios.get('https://www.netcarshow.com/', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        console.log('📊 HTML Analysis:');
        console.log(`Total links: ${$('a').length}`);
        console.log(`Links with href: ${$('a[href]').length}`);
        console.log(`Links starting with /: ${$('a[href^="/"]').length}`);
        console.log();

        // Analyze link patterns
        const linkPatterns = {};
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href) {
                // Categorize links
                if (href.startsWith('/')) {
                    if (href.split('/').length === 2 && !href.includes('.')) {
                        linkPatterns['brand-like'] = (linkPatterns['brand-like'] || 0) + 1;
                    } else if (href.includes('news')) {
                        linkPatterns['news'] = (linkPatterns['news'] || 0) + 1;
                    } else if (href.includes('reviews')) {
                        linkPatterns['reviews'] = (linkPatterns['reviews'] || 0) + 1;
                    } else {
                        linkPatterns['other-internal'] = (linkPatterns['other-internal'] || 0) + 1;
                    }
                } else if (href.startsWith('http')) {
                    linkPatterns['external'] = (linkPatterns['external'] || 0) + 1;
                } else {
                    linkPatterns['other'] = (linkPatterns['other'] || 0) + 1;
                }
            }
        });

        console.log('🔗 Link Pattern Analysis:');
        Object.entries(linkPatterns).forEach(([pattern, count]) => {
            console.log(`  ${pattern}: ${count} links`);
        });
        console.log();

        // Look for potential brand links
        console.log('🎯 Potential Brand Links (first 20):');
        let brandCount = 0;
        $('a[href]').each((i, elem) => {
            if (brandCount >= 20) return false;

            const href = $(elem).attr('href');
            const text = $(elem).text().trim();

            if (href && href.startsWith('/') && href.split('/').length === 2 && !href.includes('.') &&
                text && text.length > 1 && text.length < 50) {

                console.log(`  ${text} -> ${href}`);
                brandCount++;
            }
        });

        // Save HTML for manual inspection
        console.log('\n💾 Saving HTML for manual inspection...');
        fs.writeFileSync('netcarshow-homepage.html', response.data);
        console.log('✅ HTML saved to netcarshow-homepage.html');

        // Look for navigation menus
        console.log('\n🧭 Navigation Analysis:');
        const navElements = $('nav, .nav, .menu, .navigation, [class*="nav"], [class*="menu"]');
        console.log(`Navigation elements found: ${navElements.length}`);

        navElements.each((i, elem) => {
            const links = $(elem).find('a[href]');
            console.log(`  Nav ${i + 1}: ${links.length} links`);
        });

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeNetCarShow();
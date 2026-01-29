import { BaseScraper } from './base-scraper.ts';
import { ScrapedCarData } from './types.ts';
import chalk from 'chalk';
import * as cheerio from 'cheerio';

export class MobileBGScraper extends BaseScraper {
    private startUrl = 'https://www.mobile.bg/pcgi/mobile.cgi?act=3&slink=vso50i&f1=1'; // Example search link

    async run() {
        await this.initialize();

        if (!this.page) return;

        console.log(chalk.yellow(`Starting scrape on ${this.startUrl}`));

        try {
            await this.page.goto(this.startUrl, { waitUntil: 'networkidle2' });

            // Accept cookies if needed (Generic selector)
            try {
                const cookieBtn = await this.page.$('.fc-button-label'); // Common consent button
                if (cookieBtn) await cookieBtn.click();
            } catch (e) { }

            const listings = await this.getListings();
            console.log(chalk.green(`Found ${listings.length} listings on first page.`));

            const scrapedData: ScrapedCarData[] = [];

            for (const url of listings) {
                if (scrapedData.length >= (this.config.maxPages || 10)) break; // Limit for demo

                console.log(chalk.blue(`Scraping details: ${url}`));
                const data = await this.scrapeDetails(url);
                if (data) {
                    scrapedData.push(data);
                    this.stats.totalScraped++;
                }
                await this.delay(this.config.delayBetweenRequests || 2000);
            }

            await this.saveJson('mobile-bg-cars.json', scrapedData);

        } catch (error) {
            console.error(chalk.red('Error during scraping:'), error);
            this.stats.totalErrors++;
        } finally {
            await this.close();
        }
    }

    private async getListings(): Promise<string[]> {
        if (!this.page) return [];

        // Evaluate page to get links
        // Mobile.bg usually uses specific classes. We'll grab any link that looks like a car ad.
        // 'act=4' usually indicates a specific ad in the URL parameters.
        const links = await this.page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href.includes('act=4') && href.includes('adv='));
        });

        // Remove duplicates
        return [...new Set(links)];
    }

    private async scrapeDetails(url: string): Promise<ScrapedCarData | null> {
        if (!this.page) return null;

        try {
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });

            const content = await this.page.content();
            const $ = cheerio.load(content);

            // --- Selectors (Hypothetical/Targeted for Mobile.bg structure) ---
            // Title usually in H1 or specific bold class
            const title = $('h1').first().text().trim() || $('.adv-title').text().trim();
            const priceText = $('.price').first().text().trim().replace(/\s/g, '');
            const price = parseFloat(priceText) || 0;

            // Key specs
            const infoList = $('.info-list, .commands').text(); // Grab blob of text for regex if needed

            // Extracting year
            // Often found in a table or specific list item
            // Standard Mobile.bg parsing strategy: Look for "Година" in li
            let year = new Date().getFullYear();
            $('li').each((_, el) => {
                const text = $(el).text();
                if (text.includes('Година')) {
                    const match = text.match(/20\d{2}|19\d{2}/);
                    if (match) year = parseInt(match[0]);
                }
            });

            // Extracting images
            const images: string[] = [];
            $('.photo-wrapper img, .gallery img').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && !src.includes('spacer')) images.push(src);
            });

            if (!title) return null;

            // Parse Make/Model from Title (Simple Heuristic)
            const parts = title.split(' ');
            const make = parts[0] || 'Unknown';
            const model = parts.slice(1).join(' ') || 'Unknown';

            return {
                externalId: url.split('adv=')[1]?.split('&')[0] || Math.random().toString(36),
                sourceUrl: url,
                make,
                model,
                year,
                price,
                currency: 'EUR', // Assuming EUR for now, mobile.bg usually BGN/EUR
                mileage: 0, // Need selector
                fuelType: 'Unknown',
                transmission: 'Unknown',
                location: 'Bulgaria',
                images: images.slice(0, 5), // Take top 5
                scrapedAt: new Date().toISOString()
            };

        } catch (e) {
            console.error(`Failed to scrape ${url}`, e);
            return null;
        }
    }
}

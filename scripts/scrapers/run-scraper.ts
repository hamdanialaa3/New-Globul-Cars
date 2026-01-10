import { MobileBGScraper } from './mobile-bg-scraper.ts';
import chalk from 'chalk';

async function main() {
    console.log(chalk.bold.magenta('🚗 New Globul Cars - Scraper Engine v1.0'));

    const scraper = new MobileBGScraper({
        baseUrl: 'https://mobile.bg',
        maxPages: 5,
        delayBetweenRequests: 3000,
        headless: true
    });

    await scraper.run();
}

main().catch(err => {
    console.error(chalk.red('Fatal Error:'), err);
    process.exit(1);
});

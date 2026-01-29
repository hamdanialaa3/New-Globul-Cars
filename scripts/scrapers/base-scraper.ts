import puppeteer, { Browser, Page } from 'puppeteer';
import { ScraperConfig, ScraperStats } from './types.ts';
import fs from 'fs-extra';
import chalk from 'chalk';

export abstract class BaseScraper {
    protected browser: Browser | null = null;
    protected page: Page | null = null;
    protected config: ScraperConfig;
    protected stats: ScraperStats = {
        totalScraped: 0,
        totalSkipped: 0,
        totalErrors: 0,
        startTime: Date.now(),
    };

    constructor(config: ScraperConfig) {
        this.config = config;
    }

    async initialize() {
        console.log(chalk.blue('Launching browser...'));
        this.browser = await puppeteer.launch({
            headless: this.config.headless !== false, // Default to true
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-size=1366,768'],
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });

        // Set a realistic User Agent
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(chalk.green('Browser launched successfully.'));
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            console.log(chalk.blue('Browser closed.'));
        }
    }

    protected async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async saveJson(filename: string, data: any) {
        await fs.ensureDir('scripts/scrapers/data');
        await fs.writeJson(`scripts/scrapers/data/${filename}`, data, { spaces: 2 });
        console.log(chalk.cyan(`Saved data to scripts/scrapers/data/${filename}`));
    }

    abstract run(): Promise<void>;
}

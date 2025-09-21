import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetCarShowScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brands = [];
        this.models = {};
        this.outputDir = __dirname;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchPage(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`Fetching: ${url}`);
                const response = await axios.get(url, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                return response.data;
            } catch (error) {
                console.log(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
                if (i < retries - 1) {
                    await this.delay(2000 * (i + 1)); // Exponential backoff
                }
            }
        }
        throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
    }

    async getAllBrands() {
        try {
            const html = await this.fetchPage(`${this.baseUrl}/`);
            const $ = cheerio.load(html);

            const brandLinks = [];

            // Look specifically in the "Makes" section which contains all brands
            const makesSection = $('#Makes');
            if (makesSection.length > 0) {
                makesSection.find('a[href]').each((i, elem) => {
                    const href = $(elem).attr('href');
                    const text = $(elem).text().trim();

                    if (href && href.startsWith('/') && href !== '/' && text && text.length > 1 && text.length < 50) {
                        // This is a brand link in the Makes section
                        const fullUrl = href.startsWith('/') ? this.baseUrl + href : href;
                        brandLinks.push({
                            url: fullUrl,
                            name: text
                        });
                    }
                });
            }

            // Remove duplicates based on URL
            const uniqueBrands = brandLinks.filter((brand, index, self) =>
                index === self.findIndex(b => b.url === brand.url)
            );

            console.log(`Found ${uniqueBrands.length} brand links from Makes section`);
            return uniqueBrands.map(brand => brand.url);

        } catch (error) {
            console.error('Error getting brands:', error);
            return [];
        }
    }

    async getBrandModels(brandUrl) {
        try {
            const html = await this.fetchPage(brandUrl);
            const $ = cheerio.load(html);

            const models = [];
            const brandName = this.extractBrandName(brandUrl);

            // Extract the brand path from URL (e.g., 'mercedes-benz' from '/mercedes-benz/')
            const urlParts = brandUrl.split('/');
            const brandPath = urlParts.find(part => part && !part.includes('http') && !part.includes('www') && part !== '');

            // Look for model links in the structured sections (swSBE elements)
            $('.swSBE a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                // Check if this is a model link for this brand
                if (href && href.startsWith(`/${brandPath}/`) && href.split('/').length >= 3) {
                    const fullUrl = href.startsWith('/') ? this.baseUrl + href : href;

                    // Extract year from URL or text
                    let year = null;
                    const urlParts = href.split('/');
                    const modelPart = urlParts[urlParts.length - 2]; // Usually year-model format

                    if (modelPart) {
                        const yearMatch = modelPart.match(/^(\d{4})/);
                        if (yearMatch) {
                            year = parseInt(yearMatch[1]);
                        }
                    }

                    // If no year in URL, try to extract from text
                    if (!year) {
                        year = this.extractYear(text);
                    }

                    // Clean up model name (remove year if present)
                    let modelName = text;
                    if (year && modelName.includes(year.toString())) {
                        modelName = modelName.replace(year.toString(), '').trim();
                    }

                    models.push({
                        name: modelName,
                        url: fullUrl,
                        year: year
                    });
                }
            });

            // Also look for any other model links that might be missed
            $('a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                // Additional check for model links
                if (href && href.includes(`/${brandPath}/`) &&
                    href.split('/').length >= 3 &&
                    text && text.length > 2 && text.length < 100) {

                    const fullUrl = href.startsWith('/') ? this.baseUrl + href : href;

                    // Skip if already added
                    if (!models.find(m => m.url === fullUrl)) {
                        let year = this.extractYear(text) || this.extractYear(href);
                        let modelName = text;

                        if (year && modelName.includes(year.toString())) {
                            modelName = modelName.replace(year.toString(), '').trim();
                        }

                        models.push({
                            name: modelName,
                            url: fullUrl,
                            year: year
                        });
                    }
                }
            });

            // Remove duplicates based on URL
            const uniqueModels = models.filter((model, index, self) =>
                index === self.findIndex(m => m.url === model.url)
            );

            // Sort models by year (newest first)
            uniqueModels.sort((a, b) => (b.year || 0) - (a.year || 0));

            console.log(`Found ${uniqueModels.length} models for ${brandName}`);
            return { brandName, models: uniqueModels };

        } catch (error) {
            console.error(`Error getting models for ${brandUrl}:`, error);
            return { brandName: this.extractBrandName(brandUrl), models: [] };
        }
    }

    extractBrandName(url) {
        try {
            const parts = url.split('/');
            const brandPart = parts.find(part => part && !part.includes('http') && !part.includes('www') && part !== '');
            return brandPart ? brandPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Brand';
        } catch (error) {
            return 'Unknown Brand';
        }
    }

    extractYear(text) {
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? parseInt(yearMatch[0]) : null;
    }

    async getModelDetails(modelUrl) {
        try {
            const html = await this.fetchPage(modelUrl);
            const $ = cheerio.load(html);

            const details = {
                name: '',
                year: null,
                engine: '',
                power: '',
                transmission: '',
                drivetrain: '',
                bodyStyle: '',
                dimensions: '',
                weight: '',
                topSpeed: '',
                acceleration: '',
                fuelEconomy: '',
                price: ''
            };

            // Extract model name
            const title = $('title').text() || $('h1').first().text();
            details.name = title.split(' - ')[0].trim();

            // Extract year
            details.year = this.extractYear(details.name);

            // Get all text content from the page
            const pageText = $('body').text();

            // Extract specifications from text content
            details.engine = this.extractEngineInfo(pageText);
            details.power = this.extractPowerInfo(pageText);
            details.transmission = this.extractTransmissionInfo(pageText);
            details.drivetrain = this.extractDrivetrainInfo(pageText);
            details.dimensions = this.extractDimensionsInfo(pageText);
            details.weight = this.extractWeightInfo(pageText);
            details.topSpeed = this.extractTopSpeedInfo(pageText);
            details.acceleration = this.extractAccelerationInfo(pageText);
            details.fuelEconomy = this.extractFuelEconomyInfo(pageText);

            return details;

        } catch (error) {
            console.error(`Error getting details for ${modelUrl}:`, error);
            return null;
        }
    }

    extractEngineInfo(text) {
        // Look for engine specifications - more specific patterns
        const patterns = [
            /(\d+\.?\d*)\s*l(?:itre|iter)?\s+(?:petrol|diesel|gasoline|electric|hybrid)\s+([a-zA-Z\s-]+)/gi,
            /(?:inline|in-line|v|v8|v6|v12|four-cylinder|six-cylinder|eight-cylinder|twelve-cylinder)\s+(?:petrol|diesel|gasoline|electric|hybrid)?\s*(\d+\.?\d*)?\s*l(?:itre|iter)?/gi,
            /(\d+\.?\d*)\s*l(?:itre|iter)?\s+(?:inline|in-line|v|v8|v6|v12|four-cylinder|six-cylinder|eight-cylinder|twelve-cylinder)/gi,
            /(?:engine|motor):\s*([^.\n]{10,80})/gi,
            /(?:petrol|diesel|gasoline|electric|hybrid)\s+(?:inline|in-line|v|v8|v6|v12|four-cylinder|six-cylinder|eight-cylinder|twelve-cylinder)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[0].length < 100) { // Avoid overly long matches
                return match[0].trim();
            }
        }
        return '';
    }

    extractPowerInfo(text) {
        // Look for power and torque specifications
        const patterns = [
            /(\d+)\s*(?:kW|hp|PS|horsepower)/gi,
            /(\d+)\s*Nm\s*(?:torque)?/gi,
            /(\d+)\s*(?:kW|hp|PS)\s*(?:\([^)]*\))?/gi,
            /(?:power|horsepower):\s*([^.\n]+)/gi,
            /(?:maximum|peak)\s+(?:output|power):\s*([^.\n]+)/gi
        ];

        const powerSpecs = [];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                powerSpecs.push(...matches);
            }
        }

        return powerSpecs.slice(0, 3).join(', '); // Return up to 3 power specs
    }

    extractTransmissionInfo(text) {
        // Look for transmission specifications
        const patterns = [
            /(?:eight|six|seven|nine|ten|five|four|three)-\s*(?:speed|gear)\s+(?:automatic|manual|steptronic|dct|cv|transmission)/gi,
            /(?:automatic|manual|steptronic|dct|cv)\s+(?:transmission|gearbox)/gi,
            /(?:transmission|gearbox):\s*([^.\n]+)/gi,
            /(?:eight|six|seven|nine|ten|five|four|three)-\s*(?:speed|gear)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return '';
    }

    extractDrivetrainInfo(text) {
        // Look for drivetrain specifications
        const patterns = [
            /(?:all-wheel|four-wheel|rear-wheel|front-wheel|awd|rwd|fwd|xdrive|quattro|4matic|4motion)\s+(?:drive|drivetrain)/gi,
            /(?:xDrive|Quattro|4MATIC|4Motion|AWD|RWD|FWD)/gi,
            /(?:drivetrain|drive):\s*([^.\n]+)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return '';
    }

    extractDimensionsInfo(text) {
        // Look for dimension specifications - match various formats
        const patterns = [
            /(\d{1,2},\d{3})\s*(?:millimetres?|mm)\s*(?:in)?\s*(?:length|width|height|wheelbase)/gi,
            /(?:length|width|height|wheelbase):\s*(\d{1,2},\d{3})\s*(?:millimetres?|mm)/gi,
            /(?:exterior|overall)\s*(?:dimensions?|size):\s*([^.\n]{20,100})/gi,
            /(\d{1,2},\d{3})\s*×\s*(\d{1,2},\d{3})\s*×\s*(\d{1,2},\d{3})\s*(?:mm|millimetres?)/gi
        ];

        const dimensions = [];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                // Clean up the matches to avoid duplicates
                matches.forEach(match => {
                    if ((match.includes('mm') || match.includes('millimetre')) && !dimensions.includes(match)) {
                        dimensions.push(match);
                    }
                });
            }
        }

        if (dimensions.length > 0) {
            return dimensions.slice(0, 4).join(', ');
        }
        return '';
    }

    extractWeightInfo(text) {
        // Look for weight specifications
        const patterns = [
            /(\d{1,2},\d{3})\s*(?:kg|lbs?|pounds?)\s*(?:curb|kerb|weight)/gi,
            /(?:weight|curb|kerb):\s*([^.\n]+)/gi,
            /(\d{1,2},\d{3})\s*(?:kg|lbs?)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return '';
    }

    extractTopSpeedInfo(text) {
        // Look for top speed specifications
        const patterns = [
            /(\d{1,3})\s*(?:km\/h|kmh|mph|kph)\s*(?:top|maximum|max)\s*(?:speed)?/gi,
            /(?:top|maximum|max)\s*(?:speed):\s*([^.\n]+)/gi,
            /(?:electronically\s+governed|limited)\s+(?:to|at)\s+(\d{1,3})\s*(?:km\/h|kmh|mph|kph)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return '';
    }

    extractAccelerationInfo(text) {
        // Look for acceleration specifications
        const patterns = [
            /(?:\d+\.?\d*)\s*(?:seconds?|s)\s*(?:0-100|0-60|0-62|0-200)\s*(?:km\/h|kmh|mph)?/gi,
            /(?:0-100|0-60|0-62|0-200)\s*(?:km\/h|kmh|mph)?\s*(?:in)?\s*(\d+\.?\d*)\s*(?:seconds?|s)/gi,
            /(?:acceleration|0-100):\s*([^.\n]+)/gi
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return '';
    }

    extractFuelEconomyInfo(text) {
        // Look for fuel economy specifications
        const patterns = [
            /(\d+\.?\d*)\s*(?:l|litres?|liters?)\s*(?:per|\/)\s*(?:100\s*)?(?:km|kilometers?)/gi,
            /(\d+\.?\d*)\s*(?:mpg|mpge)\s*(?:combined|city|highway)?/gi,
            /(?:fuel|consumption|economy):\s*([^.\n]+)/gi,
            /(?:combined|city|highway)\s*([^.\n]*\d+\.?\d*\s*(?:l|mpg|mpge)[^.\n]*)/gi
        ];

        const fuelSpecs = [];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                fuelSpecs.push(...matches);
            }
        }

        return fuelSpecs.slice(0, 3).join(', '); // Return up to 3 fuel specs
    }

    async saveBrandData(brandName, models) {
        const fileName = `${brandName}.txt`;
        const filePath = path.join(this.outputDir, fileName);

        let content = `${brandName} Car Models and Generations:\n\n`;

        if (models && models.length > 0) {
            // Group models by year
            const modelsByYear = {};
            models.forEach(model => {
                const year = model.year || 'Unknown Year';
                if (!modelsByYear[year]) {
                    modelsByYear[year] = [];
                }
                modelsByYear[year].push(model);
            });

            // Sort years descending
            const sortedYears = Object.keys(modelsByYear).sort((a, b) => {
                if (a === 'Unknown Year') return 1;
                if (b === 'Unknown Year') return -1;
                return parseInt(b) - parseInt(a);
            });

            sortedYears.forEach(year => {
                content += `${year}:\n`;
                modelsByYear[year].forEach(model => {
                    content += `- ${model.name}\n`;
                    // Add detailed specifications if available
                    if (model.details) {
                        const details = model.details;
                        if (details.engine) content += `  Engine: ${details.engine}\n`;
                        if (details.power) content += `  Power: ${details.power}\n`;
                        if (details.transmission) content += `  Transmission: ${details.transmission}\n`;
                        if (details.drivetrain) content += `  Drivetrain: ${details.drivetrain}\n`;
                        if (details.dimensions) content += `  Dimensions: ${details.dimensions}\n`;
                        if (details.weight) content += `  Weight: ${details.weight}\n`;
                        if (details.topSpeed) content += `  Top Speed: ${details.topSpeed}\n`;
                        if (details.acceleration) content += `  Acceleration: ${details.acceleration}\n`;
                        if (details.fuelEconomy) content += `  Fuel Economy: ${details.fuelEconomy}\n`;
                        content += '\n';
                    } else {
                        content += '\n';
                    }
                });
                content += '\n';
            });
        } else {
            content += 'No models found for this brand.\n';
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Saved data for ${brandName} (${models.length} models)`);
    }

    async scrapeAllBrands() {
        console.log('Starting comprehensive NetCarShow scraping...');

        try {
            // Get all brand URLs
            const brandUrls = await this.getAllBrands();
            console.log(`Found ${brandUrls.length} brands to process`);

            // Process each brand
            for (let i = 0; i < brandUrls.length; i++) {
                const brandUrl = brandUrls[i];
                console.log(`Processing brand ${i + 1}/${brandUrls.length}: ${brandUrl}`);

                try {
                    const { brandName, models } = await this.getBrandModels(brandUrl);

                    // Get detailed specifications for each model
                    console.log(`Getting detailed specs for ${models.length} models...`);
                    for (let j = 0; j < models.length; j++) {
                        const model = models[j];
                        console.log(`  Processing model ${j + 1}/${models.length}: ${model.name}`);

                        try {
                            const details = await this.getModelDetails(model.url);
                            if (details) {
                                model.details = details;
                            }
                            // Small delay between model requests
                            await this.delay(500);
                        } catch (error) {
                            console.error(`    Failed to get details for ${model.name}:`, error);
                        }
                    }

                    // Save brand data with detailed specs
                    await this.saveBrandData(brandName, models);

                    // Add delay between brands to be respectful
                    await this.delay(1000);

                } catch (error) {
                    console.error(`Failed to process brand ${brandUrl}:`, error);
                }
            }

            console.log('Scraping completed successfully!');

        } catch (error) {
            console.error('Scraping failed:', error);
        }
    }

    async updateExistingFiles() {
        console.log('Updating existing brand files with detailed information...');

        const files = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.txt'));

        for (const file of files) {
            const brandName = file.replace('.txt', '');
            console.log(`Updating ${brandName}...`);

            try {
                // Read existing content
                const existingContent = fs.readFileSync(path.join(this.outputDir, file), 'utf8');
                const lines = existingContent.split('\n');

                // Extract model names
                const models = [];
                let inModelsSection = false;

                for (const line of lines) {
                    if (line.includes('Car Models and Generations:')) {
                        inModelsSection = true;
                        continue;
                    }

                    if (inModelsSection && line.trim() && !line.includes(':') && line.startsWith('- ')) {
                        const modelName = line.substring(2).trim();
                        models.push({
                            name: modelName,
                            year: this.extractYear(modelName)
                        });
                    }
                }

                // Save updated data
                await this.saveBrandData(brandName, models);

            } catch (error) {
                console.error(`Failed to update ${file}:`, error);
            }

            await this.delay(500);
        }

        console.log('Update completed!');
    }
}

// Main execution
async function main() {
    const scraper = new NetCarShowScraper();

    const args = process.argv.slice(2);
    const command = args[0] || 'scrape';

    switch (command) {
        case 'scrape':
            await scraper.scrapeAllBrands();
            break;
        case 'update':
            await scraper.updateExistingFiles();
            break;
        default:
            console.log('Usage: node scraper.js [scrape|update]');
            console.log('  scrape: Scrape all brands from NetCarShow');
            console.log('  update: Update existing files with better formatting');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default NetCarShowScraper;
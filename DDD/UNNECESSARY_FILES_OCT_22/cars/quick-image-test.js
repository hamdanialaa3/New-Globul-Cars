import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuickImageScraper {
    constructor() {
        this.imagesDir = path.join(__dirname, 'quick_car_images');
        this.ensureImagesDir();
    }

    ensureImagesDir() {
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async downloadImage(imageUrl, filePath) {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            console.error(`Failed to download ${imageUrl}: ${error.message}`);
            throw error;
        }
    }

    async searchWikimediaImages(query, limit = 3) {
        try {
            // Using Wikimedia Commons API
            const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=${limit}&srnamespace=6`;

            console.log(`Searching Wikimedia for: ${query}`);
            const searchResponse = await axios.get(searchUrl, { timeout: 10000 });

            if (searchResponse.data.query && searchResponse.data.query.search) {
                const images = [];

                for (const item of searchResponse.data.query.search.slice(0, limit)) {
                    try {
                        // Get image info
                        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${item.title}&prop=imageinfo&iiprop=url&format=json`;
                        const infoResponse = await axios.get(infoUrl, { timeout: 5000 });

                        const pages = infoResponse.data.query.pages;
                        const pageId = Object.keys(pages)[0];
                        const imageInfo = pages[pageId];

                        if (imageInfo.imageinfo && imageInfo.imageinfo[0]) {
                            const imageUrl = imageInfo.imageinfo[0].url;
                            images.push({
                                url: imageUrl,
                                source: 'Wikimedia Commons',
                                description: item.title,
                                width: imageInfo.imageinfo[0].width,
                                height: imageInfo.imageinfo[0].height
                            });
                        }
                    } catch (error) {
                        console.log(`⚠️  Failed to get info for ${item.title}`);
                    }
                }

                console.log(`Found ${images.length} images on Wikimedia`);
                return images;
            }

            console.log('No images found on Wikimedia');
            return [];
        } catch (error) {
            console.log(`❌ Wikimedia API error: ${error.message}`);
            return [];
        }
    }

    async searchDirectCarImages(brand, model, year) {
        // Fallback: try some known car image sources
        const knownUrls = [
            `https://www.carpixel.net/w/${encodeURIComponent(`${brand} ${model}`)}/`,
            `https://www.netcarshow.com/${brand.toLowerCase()}/${year}-${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}/`,
            // Add more known sources
        ];

        const images = [];

        for (const baseUrl of knownUrls) {
            try {
                console.log(`Trying direct source: ${baseUrl}`);
                const response = await axios.get(baseUrl, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                const $ = cheerio.load(response.data);
                $('img').each((i, elem) => {
                    const src = $(elem).attr('src');
                    const alt = $(elem).attr('alt') || '';

                    if (src && (alt.toLowerCase().includes('car') || alt.toLowerCase().includes(brand.toLowerCase()) || src.includes('.jpg') || src.includes('.png'))) {
                        const fullUrl = src.startsWith('http') ? src : baseUrl + src;
                        if (!images.find(img => img.url === fullUrl) && images.length < 3) {
                            images.push({
                                url: fullUrl,
                                source: 'Direct Source',
                                description: `${brand} ${model}`,
                                width: null,
                                height: null
                            });
                        }
                    }
                });

                if (images.length > 0) break; // Stop if we found images

            } catch (error) {
                console.log(`⚠️  Direct source ${baseUrl} failed: ${error.message}`);
            }
        }

        return images;
    }

    sanitizeFileName(name) {
        return name.replace(/[^a-z0-9\-_\.]/gi, '_').toLowerCase();
    }

    async scrapeBMWImages() {
        console.log('🚀 Starting quick BMW image scraping...\n');

        const bmwFile = path.join(__dirname, 'BMW.txt');
        if (!fs.existsSync(bmwFile)) {
            console.log('❌ BMW.txt not found');
            return;
        }

        // Read first few BMW models for testing
        const content = fs.readFileSync(bmwFile, 'utf8');
        const lines = content.split('\n');

        const testModels = [];
        let currentYear = null;
        let count = 0;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for year
            const yearMatch = trimmed.match(/^(\d{4}):$/);
            if (yearMatch) {
                currentYear = parseInt(yearMatch[1]);
                continue;
            }

            // Check for car model (take only first 3 models)
            if (trimmed.startsWith('- ') && currentYear && count < 3) {
                const modelName = trimmed.substring(2).split('  ')[0].trim();
                testModels.push({
                    year: currentYear,
                    model: modelName
                });
                count++;
            }

            if (count >= 3) break;
        }

        console.log(`📋 Testing with ${testModels.length} BMW models:\n`);

        const brandDir = path.join(this.imagesDir, 'bmw');
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }

        let totalImages = 0;

        for (const car of testModels) {
            try {
                console.log(`🔍 Processing: ${car.year} ${car.model}`);

                const query = `BMW ${car.model} car`;
                const wikimediaImages = await this.searchWikimediaImages(query, 2);
                const directImages = await this.searchDirectCarImages('BMW', car.model, car.year);
                const images = [...wikimediaImages, ...directImages];

                if (images.length > 0) {
                    const modelDir = path.join(brandDir, `${car.year}_${this.sanitizeFileName(car.model)}`);
                    if (!fs.existsSync(modelDir)) {
                        fs.mkdirSync(modelDir, { recursive: true });
                    }

                    for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        const ext = path.extname(image.url) || '.jpg';
                        const fileName = `${i + 1}_pixabay${ext}`;
                        const filePath = path.join(modelDir, fileName);

                        try {
                            await this.downloadImage(image.url, filePath);
                            console.log(`✅ Downloaded: ${fileName} (${image.width}x${image.height})`);
                            totalImages++;
                        } catch (error) {
                            console.log(`❌ Failed to download: ${fileName}`);
                        }
                    }
                } else {
                    console.log(`⚠️  No images found for ${car.model}`);
                }

                await this.delay(2000); // 2 second delay

            } catch (error) {
                console.error(`❌ Error processing ${car.model}: ${error.message}`);
            }
        }

        console.log(`\n🎉 Quick test completed! Downloaded ${totalImages} images`);
        console.log(`📁 Images saved to: ${this.imagesDir}`);

        if (totalImages > 0) {
            console.log('\n✅ SUCCESS: The image scraping system works!');
            console.log('💡 You can now run the full scraper for all brands');
        } else {
            console.log('\n⚠️  No images downloaded. Check your internet connection and try again.');
        }
    }
}

// Run quick test
async function main() {
    const scraper = new QuickImageScraper();

    try {
        await scraper.scrapeBMWImages();
        console.log('\n🎉 Quick test completed successfully!');
    } catch (error) {
        console.error('❌ Error during quick test:', error);
        process.exit(1);
    }
}

main();
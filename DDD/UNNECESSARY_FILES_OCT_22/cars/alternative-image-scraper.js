import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AlternativeImageScraper {
    constructor() {
        this.imagesDir = path.join(__dirname, 'car_images_alternative');
        this.ensureImagesDir();

        // API Keys - Replace with your actual keys
        this.unsplashApiKey = process.env.UNSPLASH_API_KEY || 'YOUR_UNSPLASH_API_KEY';
        this.pexelsApiKey = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';
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

    parseCarDataFromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        const cars = [];
        let currentYear = null;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for year
            const yearMatch = trimmed.match(/^(\d{4}):$/);
            if (yearMatch) {
                currentYear = parseInt(yearMatch[1]);
                continue;
            }

            // Check for car model
            if (trimmed.startsWith('- ') && currentYear) {
                const modelName = trimmed.substring(2).split('  ')[0].trim();
                cars.push({
                    year: currentYear,
                    model: modelName
                });
            }
        }

        return cars;
    }

    sanitizeFileName(name) {
        return name.replace(/[^a-z0-9\-_\.]/gi, '_').toLowerCase();
    }

    async searchUnsplashImages(query, limit = 5) {
        if (this.unsplashApiKey === 'YOUR_UNSPLASH_API_KEY') {
            console.log('⚠️  Unsplash API key not configured, skipping...');
            return [];
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Client-ID ${this.unsplashApiKey}`
                },
                timeout: 10000
            });

            return response.data.results.map(photo => ({
                url: photo.urls.regular,
                source: 'Unsplash',
                description: photo.description || photo.alt_description || query,
                width: photo.width,
                height: photo.height
            }));
        } catch (error) {
            console.log(`❌ Unsplash API error: ${error.message}`);
            return [];
        }
    }

    async searchPexelsImages(query, limit = 5) {
        if (this.pexelsApiKey === 'YOUR_PEXELS_API_KEY') {
            console.log('⚠️  Pexels API key not configured, skipping...');
            return [];
        }

        try {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': this.pexelsApiKey
                },
                timeout: 10000
            });

            return response.data.photos.map(photo => ({
                url: photo.src.large,
                source: 'Pexels',
                description: photo.alt || query,
                width: photo.width,
                height: photo.height
            }));
        } catch (error) {
            console.log(`❌ Pexels API error: ${error.message}`);
            return [];
        }
    }

    async searchPixabayImages(query, limit = 5) {
        try {
            // Using Pixabay's public API (limited but no key required)
            const url = `https://pixabay.com/api/?key=46100727-XXXXXXXXXXXXXXXXXXXXX&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${limit}&safesearch=true`;

            const response = await axios.get(url, { timeout: 10000 });

            if (response.data.hits) {
                return response.data.hits.map(hit => ({
                    url: hit.largeImageURL,
                    source: 'Pixabay',
                    description: hit.tags || query,
                    width: hit.imageWidth,
                    height: hit.imageHeight
                }));
            }
            return [];
        } catch (error) {
            console.log(`❌ Pixabay API error: ${error.message}`);
            return [];
        }
    }

    async scrapeImagesForBrand(brandFile) {
        const brandName = path.basename(brandFile, '.txt');
        console.log(`\n🚀 Starting alternative image scraping for ${brandName}`);

        const cars = this.parseCarDataFromFile(brandFile);
        console.log(`📋 Found ${cars.length} car models in ${brandName}.txt`);

        const brandDir = path.join(this.imagesDir, this.sanitizeFileName(brandName));
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }

        let successCount = 0;
        let totalImages = 0;

        for (const car of cars) {
            try {
                console.log(`\n🔍 Processing: ${car.year} ${car.model}`);

                const query = `${brandName} ${car.model} car ${car.year}`;
                console.log(`Search query: "${query}"`);

                // Search multiple sources
                const [unsplashImages, pexelsImages, pixabayImages] = await Promise.all([
                    this.searchUnsplashImages(query, 3),
                    this.searchPexelsImages(query, 3),
                    this.searchPixabayImages(query, 3)
                ]);

                const allImages = [...unsplashImages, ...pexelsImages, ...pixabayImages];

                if (allImages.length > 0) {
                    console.log(`✅ Found ${allImages.length} images from alternative sources`);

                    const modelDir = path.join(brandDir, `${car.year}_${this.sanitizeFileName(car.model)}`);
                    if (!fs.existsSync(modelDir)) {
                        fs.mkdirSync(modelDir, { recursive: true });
                    }

                    for (let i = 0; i < allImages.length; i++) {
                        const image = allImages[i];
                        const ext = path.extname(image.url) || '.jpg';
                        const fileName = `${i + 1}_${image.source.toLowerCase()}${ext}`;
                        const filePath = path.join(modelDir, fileName);

                        try {
                            await this.downloadImage(image.url, filePath);
                            console.log(`📥 Downloaded from ${image.source}: ${fileName} (${image.width}x${image.height})`);
                            totalImages++;
                        } catch (error) {
                            console.log(`❌ Failed to download from ${image.source}: ${fileName}`);
                        }
                    }

                    successCount++;
                } else {
                    console.log(`❌ No images found for ${car.model} from any alternative source`);
                }

                // Delay between searches to be respectful to APIs
                await this.delay(1000 + Math.random() * 1000);

            } catch (error) {
                console.error(`❌ Error processing ${car.model}: ${error.message}`);
            }
        }

        console.log(`\n🏁 Completed ${brandName}: ${successCount}/${cars.length} models, ${totalImages} images`);
        return { successCount, totalImages };
    }

    async scrapeAllBrands() {
        console.log('🎨 Starting alternative image scraping from free APIs...\n');

        const carsDir = __dirname;
        const brandFiles = fs.readdirSync(carsDir)
            .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md')
            .map(file => path.join(carsDir, file));

        console.log(`📁 Found ${brandFiles.length} brand files to process\n`);

        const results = [];

        for (const brandFile of brandFiles) {
            try {
                const result = await this.scrapeImagesForBrand(brandFile);
                results.push({
                    brand: path.basename(brandFile, '.txt'),
                    ...result
                });

                // Short delay between brands
                await this.delay(2000);

            } catch (error) {
                console.error(`❌ Error processing brand file ${brandFile}: ${error.message}`);
            }
        }

        console.log('\n🎉 === ALTERNATIVE SCRAPING COMPLETE ===');
        console.log('📊 Summary:');
        results.forEach(result => {
            console.log(`  ${result.brand}: ${result.successCount} models, ${result.totalImages} images`);
        });

        const totalModels = results.reduce((sum, r) => sum + r.successCount, 0);
        const totalImages = results.reduce((sum, r) => sum + r.totalImages, 0);
        console.log(`\n🏆 Total: ${totalModels} models processed, ${totalImages} images downloaded`);

        console.log('\n💡 Tips to get more images:');
        console.log('  1. Get API keys for Unsplash and Pexels');
        console.log('  2. Configure Pixabay API key');
        console.log('  3. Use VPN for better access to car sites');
        console.log('  4. Consider paid image APIs for higher quality');
    }
}

// Run the alternative scraper
async function main() {
    const scraper = new AlternativeImageScraper();

    try {
        await scraper.scrapeAllBrands();
        console.log('\n🎉 Alternative image scraping completed successfully!');
    } catch (error) {
        console.error('❌ Error during alternative scraping:', error);
        process.exit(1);
    }
}

main();
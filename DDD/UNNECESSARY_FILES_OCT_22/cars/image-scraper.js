import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CarImageScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.imagesDir = path.join(__dirname, 'car_images');
        this.ensureImagesDir();

        // Multiple user agents to rotate
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        ];

        // Free proxy list (you can add more)
        this.proxies = [
            'http://proxy1.example.com:8080',
            'http://proxy2.example.com:8080',
            // Add real proxies here or use proxy services
        ];

        this.useProxy = false;
        this.useVpn = false;
        this.currentProxyIndex = 0;
    }

    ensureImagesDir() {
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    getNextProxy() {
        if (!this.useProxy || this.proxies.length === 0) return null;
        const proxy = this.proxies[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        return proxy;
    }

    async connectToVpn() {
        if (!this.useVpn) return;

        console.log('🔗 Connecting to VPN...');
        try {
            // This is a placeholder - you need to implement based on your VPN client
            // For example, if using OpenVPN:
            // const vpnProcess = spawn('openvpn', ['--config', 'path/to/config.ovpn'], { stdio: 'inherit' });

            // For ProtonVPN CLI (if installed):
            const vpnProcess = spawn('protonvpn', ['connect', '--fastest'], { stdio: 'inherit' });

            return new Promise((resolve, reject) => {
                vpnProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ VPN connected successfully');
                        resolve();
                    } else {
                        console.log('❌ VPN connection failed');
                        reject(new Error('VPN connection failed'));
                    }
                });

                // Timeout after 30 seconds
                setTimeout(() => {
                    vpnProcess.kill();
                    reject(new Error('VPN connection timeout'));
                }, 30000);
            });
        } catch (error) {
            console.log('⚠️  VPN connection failed, continuing without VPN');
            this.useVpn = false;
        }
    }

    async fetchPage(url, retries = 5) {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`Fetching: ${url} (attempt ${i + 1}/${retries})`);

                const config = {
                    timeout: 45000, // Increased timeout
                    headers: {
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                    }
                };

                // Add proxy if enabled
                const proxy = this.getNextProxy();
                if (proxy) {
                    config.proxy = {
                        host: proxy.split(':')[0],
                        port: parseInt(proxy.split(':')[1])
                    };
                    console.log(`Using proxy: ${proxy}`);
                }

                const response = await axios.get(url, config);
                return response.data;

            } catch (error) {
                console.log(`❌ Attempt ${i + 1} failed for ${url}: ${error.message}`);

                if (error.response) {
                    if (error.response.status === 403) {
                        console.log('🚫 403 Forbidden - Possible blocking detected');
                        // Try with different proxy/user agent
                        continue;
                    } else if (error.response.status === 429) {
                        console.log('⏱️  429 Too Many Requests - Rate limited');
                        await this.delay(30000); // Wait 30 seconds
                        continue;
                    }
                }

                if (i < retries - 1) {
                    // Exponential backoff with longer delays
                    const delayTime = 10000 * (i + 1) + Math.random() * 5000;
                    console.log(`⏳ Waiting ${Math.round(delayTime/1000)}s before retry...`);
                    await this.delay(delayTime);
                }
            }
        }
        throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
    }

    async downloadImage(imageUrl, filePath) {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': this.baseUrl
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

    buildModelUrl(brand, year, model) {
        // Convert brand to URL format (e.g., "BMW" -> "bmw")
        const brandUrl = brand.toLowerCase().replace(/\s+/g, '-');

        // Clean model name for URL
        const modelUrl = model.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Remove multiple hyphens
            .trim();

        return `${this.baseUrl}/${brandUrl}/${year}-${brandUrl}-${modelUrl}/`;
    }

    async extractImagesFromModelPage(modelUrl, brand, model, year) {
        try {
            const html = await this.fetchPage(modelUrl);
            const $ = cheerio.load(html);

            const images = [];

            // Find all images in the page
            $('img').each((i, elem) => {
                const $img = $(elem);
                const src = $img.attr('src');
                const alt = $img.attr('alt') || '';

                if (src) {
                    // Convert relative URLs to absolute
                    const absoluteUrl = src.startsWith('http') ? src : (src.startsWith('/') ? this.baseUrl + src : modelUrl + src);

                    // Filter for car images (skip logos, icons, etc.)
                    if (this.isCarImage(absoluteUrl, alt)) {
                        images.push({
                            url: absoluteUrl,
                            alt: alt
                        });
                    }
                }
            });

            return images;
        } catch (error) {
            console.error(`Error extracting images from ${modelUrl}: ${error.message}`);
            return [];
        }
    }

    isCarImage(url, alt) {
        // Filter criteria for car images
        const carKeywords = ['car', 'auto', 'vehicle', 'bmw', 'mercedes', 'audi', 'toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'volkswagen', 'porsche', 'ferrari', 'lamborghini', 'bugatti', 'koenigsegg', 'pagani'];
        const urlLower = url.toLowerCase();
        const altLower = alt.toLowerCase();

        // Skip small images, icons, logos
        if (urlLower.includes('logo') || urlLower.includes('icon') || urlLower.includes('button') || urlLower.includes('thumb') && urlLower.includes('small')) {
            return false;
        }

        // Check if URL contains car-related keywords or is a large image
        return carKeywords.some(keyword => urlLower.includes(keyword) || altLower.includes(keyword)) ||
               urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') ||
               urlLower.includes('photo') || urlLower.includes('image');
    }

    sanitizeFileName(name) {
        return name.replace(/[^a-z0-9\-_\.]/gi, '_').toLowerCase();
    }

    async searchAlternativeSources(brand, model, year) {
        console.log(`🔍 Searching alternative sources for ${year} ${brand} ${model}...`);

        const alternativeApis = [
            {
                name: 'CarQuery API',
                url: `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${encodeURIComponent(brand)}&year=${year}`,
                type: 'api'
            },
            {
                name: 'Unsplash',
                url: `https://api.unsplash.com/search/photos?query=${encodeURIComponent(`${brand} ${model} car`)}&client_id=YOUR_UNSPLASH_API_KEY`,
                type: 'api'
            },
            {
                name: 'Pexels',
                url: `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${brand} ${model} car`)}&per_page=5`,
                headers: { 'Authorization': 'YOUR_PEXELS_API_KEY' },
                type: 'api'
            }
        ];

        const foundImages = [];

        for (const api of alternativeApis) {
            try {
                if (api.type === 'api') {
                    const config = {
                        timeout: 10000,
                        headers: api.headers || {}
                    };

                    const response = await axios.get(api.url, config);

                    if (api.name === 'CarQuery API' && response.data) {
                        // Parse CarQuery response
                        const data = typeof response.data === 'string' ?
                            JSON.parse(response.data.replace(/^\?\(|\)$/g, '')) :
                            response.data;

                        if (data.Models && Array.isArray(data.Models)) {
                            // This API provides model info, not images
                            console.log(`📋 ${api.name}: Found ${data.Models.length} models`);
                        }
                    } else if (api.name === 'Unsplash' && response.data.results) {
                        for (const photo of response.data.results.slice(0, 3)) {
                            foundImages.push({
                                url: photo.urls.regular,
                                source: 'Unsplash',
                                description: photo.description || `${brand} ${model}`
                            });
                        }
                    } else if (api.name === 'Pexels' && response.data.photos) {
                        for (const photo of response.data.photos.slice(0, 3)) {
                            foundImages.push({
                                url: photo.src.large,
                                source: 'Pexels',
                                description: photo.alt || `${brand} ${model}`
                            });
                        }
                    }
                }
            } catch (error) {
                console.log(`⚠️  ${api.name} failed: ${error.message}`);
            }
        }

        return foundImages;
    }

    async scrapeImagesForBrand(brandFile) {
        const brandName = path.basename(brandFile, '.txt');
        console.log(`\n=== Starting image scraping for ${brandName} ===`);

        const cars = this.parseCarDataFromFile(brandFile);
        console.log(`Found ${cars.length} car models in ${brandName}.txt`);

        const brandDir = path.join(this.imagesDir, this.sanitizeFileName(brandName));
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }

        let successCount = 0;
        let totalImages = 0;

        for (const car of cars) {
            try {
                const modelUrl = this.buildModelUrl(brandName, car.year, car.model);
                console.log(`\nProcessing: ${car.year} ${car.model}`);
                console.log(`URL: ${modelUrl}`);

                const images = await this.extractImagesFromModelPage(modelUrl, brandName, car.model, car.year);

                if (images.length > 0) {
                    console.log(`✅ Found ${images.length} images for ${car.model} from NetCarShow`);

                    const modelDir = path.join(brandDir, `${car.year}_${this.sanitizeFileName(car.model)}`);
                    if (!fs.existsSync(modelDir)) {
                        fs.mkdirSync(modelDir, { recursive: true });
                    }

                    for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        const ext = path.extname(image.url) || '.jpg';
                        const fileName = `${i + 1}_netcarshow${ext}`;
                        const filePath = path.join(modelDir, fileName);

                        try {
                            await this.downloadImage(image.url, filePath);
                            console.log(`📥 Downloaded: ${fileName}`);
                            totalImages++;
                        } catch (error) {
                            console.log(`❌ Failed to download ${fileName}`);
                        }
                    }

                    successCount++;
                } else {
                    console.log(`⚠️  No images found for ${car.model} on NetCarShow, trying alternatives...`);

                    // Try alternative sources
                    const altImages = await this.searchAlternativeSources(brandName, car.model, car.year);

                    if (altImages.length > 0) {
                        console.log(`🔄 Found ${altImages.length} images from alternative sources`);

                        const modelDir = path.join(brandDir, `${car.year}_${this.sanitizeFileName(car.model)}`);
                        if (!fs.existsSync(modelDir)) {
                            fs.mkdirSync(modelDir, { recursive: true });
                        }

                        for (let i = 0; i < altImages.length; i++) {
                            const image = altImages[i];
                            const ext = path.extname(image.url) || '.jpg';
                            const fileName = `${i + 1}_${image.source.toLowerCase()}${ext}`;
                            const filePath = path.join(modelDir, fileName);

                            try {
                                await this.downloadImage(image.url, filePath);
                                console.log(`📥 Downloaded from ${image.source}: ${fileName}`);
                                totalImages++;
                            } catch (error) {
                                console.log(`❌ Failed to download from ${image.source}: ${fileName}`);
                            }
                        }

                        successCount++;
                    } else {
                        console.log(`❌ No images found from any source for ${car.model}`);
                    }
                }

                // Longer delay between models to avoid being blocked
                const delayTime = 5000 + Math.random() * 3000; // 5-8 seconds
                console.log(`⏳ Waiting ${Math.round(delayTime/1000)}s before next model...`);
                await this.delay(delayTime);

            } catch (error) {
                console.error(`Error processing ${car.model}: ${error.message}`);
            }
        }

        console.log(`\n=== Completed ${brandName} ===`);
        console.log(`Processed ${successCount}/${cars.length} models`);
        console.log(`Downloaded ${totalImages} images`);

        return { successCount, totalImages };
    }

    async scrapeAllBrands() {
        console.log('🚀 Starting comprehensive car image scraping...\n');

        // Try to connect to VPN first
        await this.connectToVpn();

        const carsDir = __dirname;
        const brandFiles = fs.readdirSync(carsDir)
            .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md')
            .map(file => path.join(carsDir, file));

        console.log(`📁 Found ${brandFiles.length} brand files to process\n`);

        // Test access first
        console.log('🧪 Testing website access...');
        try {
            await this.fetchPage(this.baseUrl);
            console.log('✅ Website access successful\n');
        } catch (error) {
            console.log('⚠️  Website access failed, but continuing...\n');
        }

        const results = [];

        for (const brandFile of brandFiles) {
            try {
                const result = await this.scrapeImagesForBrand(brandFile);
                results.push({
                    brand: path.basename(brandFile, '.txt'),
                    ...result
                });

                // Very long delay between brands to avoid blocking
                const delayTime = 15000 + Math.random() * 10000; // 15-25 seconds
                console.log(`⏳ Waiting ${Math.round(delayTime/1000)}s before next brand...\n`);
                await this.delay(delayTime);

            } catch (error) {
                console.error(`❌ Error processing brand file ${brandFile}: ${error.message}`);
            }
        }

        console.log('\n🎉 === SCRAPING COMPLETE ===');
        console.log('📊 Summary:');
        results.forEach(result => {
            console.log(`  ${result.brand}: ${result.successCount} models, ${result.totalImages} images`);
        });

        const totalModels = results.reduce((sum, r) => sum + r.successCount, 0);
        const totalImages = results.reduce((sum, r) => sum + r.totalImages, 0);
        console.log(`\n🏆 Total: ${totalModels} models processed, ${totalImages} images downloaded`);

        // Alternative sources suggestion
        if (totalImages === 0) {
            console.log('\n💡 No images downloaded. Consider these alternatives:');
            console.log('  1. Use a VPN service');
            console.log('  2. Try different proxy servers');
            console.log('  3. Use alternative car image APIs:');
            console.log('     - CarQuery API (carqueryapi.com)');
            console.log('     - Edmunds API (edmunds.com)');
            console.log('     - AutoTrader API (autotrader.com)');
            console.log('  4. Download from free stock photo sites:');
            console.log('     - Unsplash.com (search for car models)');
            console.log('     - Pexels.com (car photography)');
            console.log('     - Pixabay.com (automotive images)');
        }
    }
}

// Run the scraper
async function main() {
    const scraper = new CarImageScraper();

    try {
        await scraper.scrapeAllBrands();
        console.log('\n🎉 Image scraping completed successfully!');
    } catch (error) {
        console.error('❌ Error during scraping:', error);
        process.exit(1);
    }
}

main();
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createWriteStream } from 'fs';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ⚡ FAST DOWNLOAD CONFIGURATION
const CONFIG = {
    maxBrands: 20,
    maxModelsPerBrand: 15,
    maxImagesPerModel: 25,
    smartDelayMin: 800,
    smartDelayMax: 2000,
    simulationMode: false,
    verboseMode: true,
    downloadImages: true,
    concurrentDownloads: 5,
    timeout: 15000,
    retryAttempts: 3
};

let STATS = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    brandsProcessed: 0,
    modelsProcessed: 0,
    imagesDownloaded: 0,
    totalSize: 0,
    startTime: Date.now(),
    errors: []
};

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
];

const axiosInstance = axios.create({
    timeout: CONFIG.timeout,
    maxRedirects: 3,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'User-Agent': USER_AGENTS[0]
    }
});

function smartDelay(min = CONFIG.smartDelayMin, max = CONFIG.smartDelayMax) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

function randomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function protectedRequest(url, retries = CONFIG.retryAttempts) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            STATS.totalRequests++;
            axiosInstance.defaults.headers['User-Agent'] = randomUserAgent();
            
            if (CONFIG.verboseMode && attempt === 1) {
                console.log(`⏳ Requesting: ${url.split('/').slice(-2).join('/')}`);
            }
            
            await smartDelay();
            const response = await axiosInstance.get(url);
            
            if (response.status === 200) {
                STATS.successfulRequests++;
                return response.data;
            }
        } catch (error) {
            STATS.failedRequests++;
            if (attempt === retries) {
                STATS.errors.push({ url, error: error.message });
                return null;
            }
            await smartDelay(2000, 4000);
        }
    }
    return null;
}

async function downloadImage(imageUrl, savePath) {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            timeout: 20000,
            headers: {
                'User-Agent': randomUserAgent(),
                'Referer': 'https://www.netcarshow.com/'
            }
        });

        if (response.status === 200) {
            await fs.mkdir(path.dirname(savePath), { recursive: true });
            const writer = createWriteStream(savePath);
            response.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', async () => {
                    try {
                        const stats = await fs.stat(savePath);
                        STATS.totalSize += stats.size;
                        STATS.imagesDownloaded++;
                        resolve(savePath);
                    } catch (err) {
                        reject(err);
                    }
                });
                writer.on('error', reject);
            });
        }
    } catch (error) {
        return null;
    }
}

function reportProgress() {
    const runtime = Math.floor((Date.now() - STATS.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;
    
    console.log('\n📊 ══════════════ PROGRESS REPORT ══════════════');
    console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
    console.log(`🌐 Requests: ${STATS.successfulRequests}/${STATS.totalRequests}`);
    console.log(`🏭 Brands: ${STATS.brandsProcessed}`);
    console.log(`🚗 Models: ${STATS.modelsProcessed}`);
    console.log(`📸 Images: ${STATS.imagesDownloaded}`);
    console.log(`💾 Size: ${(STATS.totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log('═══════════════════════════════════════════════\n');
}

// Set progress reporter
setInterval(reportProgress, 60000); // Every minute

async function fastDownload() {
    console.log('⚡ FAST DOWNLOAD MODE - NETCARSHOW SCRAPER');
    console.log('🚀 Optimized for speed with protection');
    console.log();
    
    console.log('📊 Configuration:');
    console.log(`   🏭 Max brands: ${CONFIG.maxBrands}`);
    console.log(`   🚗 Max models per brand: ${CONFIG.maxModelsPerBrand}`);
    console.log(`   📸 Max images per model: ${CONFIG.maxImagesPerModel}`);
    console.log(`   ⚡ Delays: ${CONFIG.smartDelayMin}-${CONFIG.smartDelayMax}ms`);
    console.log();
    
    // Get all brand directories that already exist
    const brandDirsPath = path.join(__dirname, 'brand_directories');
    await fs.mkdir(brandDirsPath, { recursive: true });
    
    const existingBrands = await fs.readdir(brandDirsPath);
    const validBrands = [];
    
    for (const brandName of existingBrands.slice(0, CONFIG.maxBrands)) {
        const brandPath = path.join(brandDirsPath, brandName);
        const stats = await fs.stat(brandPath);
        if (stats.isDirectory() && brandName !== 'BMW_Test' && brandName !== 'Test_Brand') {
            validBrands.push({
                name: brandName,
                slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                url: `https://www.netcarshow.com/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}/`,
                path: brandPath
            });
        }
    }
    
    console.log(`✅ Found ${validBrands.length} existing brand directories`);
    console.log('🎯 Processing existing brands for complete image download...');
    console.log();
    
    // Process each brand
    for (let i = 0; i < validBrands.length; i++) {
        const brand = validBrands[i];
        
        console.log(`[${i + 1}/${validBrands.length}] Starting: ${brand.name}`);
        
        try {
            await processBrandFast(brand);
            STATS.brandsProcessed++;
            
            if (i < validBrands.length - 1) {
                console.log('   ⏳ Brand completed. Brief delay...');
                await smartDelay(3000, 6000);
            }
            
        } catch (error) {
            console.log(`   ❌ Error processing ${brand.name}: ${error.message}`);
            STATS.errors.push({ brand: brand.name, error: error.message });
        }
        
        console.log();
    }
    
    console.log('🎉 ══════════════ FAST DOWNLOAD COMPLETED! ══════════════');
    reportProgress();
    
    if (STATS.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        STATS.errors.slice(0, 5).forEach((error, i) => {
            console.log(`   ${i + 1}. ${error.brand || error.url}: ${error.error}`);
        });
    }
    
    console.log('🧹 Session completed.');
}

async function processBrandFast(brand) {
    console.log(`   🏭 Processing brand: ${brand.name}`);
    
    const brandData = await protectedRequest(brand.url);
    if (!brandData) {
        console.log(`   ❌ Failed to load brand page`);
        return;
    }
    
    // Use cheerio for better HTML parsing
    const $ = cheerio.load(brandData);
    const models = [];
    
    // Extract model links
    $('a[href*="/' + brand.slug + '/"]').each((i, element) => {
        if (models.length >= CONFIG.maxModelsPerBrand) return false;
        
        const href = $(element).attr('href');
        const title = $(element).attr('title') || $(element).text().trim();
        
        if (href && title && href.split('/').length >= 4) {
            const modelSlug = href.split('/')[2];
            if (modelSlug && modelSlug !== brand.slug) {
                models.push({
                    name: title,
                    slug: modelSlug,
                    url: `https://www.netcarshow.com${href}`
                });
            }
        }
    });
    
    console.log(`   ✅ Found ${models.length} models`);
    
    let brandImageCount = 0;
    
    // Process models in batches
    for (let j = 0; j < models.length; j++) {
        const model = models[j];
        console.log(`   [${j + 1}/${models.length}] ${model.name.substring(0, 40)}...`);
        
        try {
            const imageCount = await processModelFast(model, brand.path);
            brandImageCount += imageCount;
            STATS.modelsProcessed++;
            
            if (j < models.length - 1) {
                await smartDelay(1000, 2000);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log(`   ✅ ${brand.name} completed: ${brandImageCount} images`);
}

async function processModelFast(model, brandPath) {
    const modelData = await protectedRequest(model.url);
    if (!modelData) return 0;
    
    const $ = cheerio.load(modelData);
    const images = [];
    
    // Extract images using cheerio
    $('img').each((i, element) => {
        if (images.length >= CONFIG.maxImagesPerModel) return false;
        
        const src = $(element).attr('src') || $(element).attr('data-src');
        if (src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
            let imageUrl = src;
            
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
                imageUrl = 'https://www.netcarshow.com' + imageUrl;
            }
            
            if (imageUrl.startsWith('http') && !images.includes(imageUrl)) {
                // Skip thumbnails and small images
                if (!imageUrl.includes('_thumb') && !imageUrl.includes('_small')) {
                    images.push(imageUrl);
                }
            }
        }
    });
    
    if (images.length === 0) return 0;
    
    console.log(`     📸 Found ${images.length} images`);
    
    // Create model directory
    const modelDir = path.join(brandPath, model.name.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_'));
    await fs.mkdir(modelDir, { recursive: true });
    
    let downloadCount = 0;
    
    // Download images in batches
    for (let i = 0; i < images.length; i += CONFIG.concurrentDownloads) {
        const batch = images.slice(i, i + CONFIG.concurrentDownloads);
        
        const downloadPromises = batch.map(async (imageUrl, batchIndex) => {
            const imageIndex = i + batchIndex + 1;
            const extension = imageUrl.includes('.png') ? '.png' : '.jpg';
            const filename = `image_${imageIndex.toString().padStart(3, '0')}${extension}`;
            const savePath = path.join(modelDir, filename);
            
            // Skip if already downloaded
            try {
                await fs.access(savePath);
                return true; // File exists
            } catch {
                // File doesn't exist, download it
            }
            
            const result = await downloadImage(imageUrl, savePath);
            if (result) {
                downloadCount++;
                return true;
            }
            return false;
        });
        
        await Promise.all(downloadPromises);
        
        if (i + CONFIG.concurrentDownloads < images.length) {
            await smartDelay(500, 1500);
        }
    }
    
    console.log(`     ✅ Downloaded: ${downloadCount}/${images.length}`);
    return downloadCount;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  DOWNLOAD INTERRUPTED BY USER');
    reportProgress();
    console.log('💾 All downloaded images are preserved.');
    process.exit(0);
});

// Start fast download
fastDownload().catch(error => {
    console.error('💥 Fatal error:', error);
    reportProgress();
    process.exit(1);
});
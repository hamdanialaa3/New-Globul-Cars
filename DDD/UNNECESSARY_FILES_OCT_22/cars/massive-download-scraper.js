import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🚀 MASSIVE DOWNLOAD CONFIGURATION
const CONFIG = {
    maxBrands: 50,  // تحميل 50 ماركة
    maxModelsPerBrand: 100,  // 100 موديل لكل ماركة
    maxImagesPerModel: 200,  // 200 صورة لكل موديل
    smartDelayMin: 1500,  // تأخير أسرع
    smartDelayMax: 4000,
    simulationMode: false,  // تحميل حقيقي
    verboseMode: true,
    resumeMode: true,
    downloadImages: true,
    maxFileSize: 50 * 1024 * 1024,  // 50MB max per image
    timeout: 30000,
    concurrentDownloads: 3,
    retryAttempts: 5
};

// 🛡️ ENHANCED USER AGENTS
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// 📊 GLOBAL STATISTICS
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

// 🔧 AXIOS INSTANCE WITH ENHANCED PROTECTION
const axiosInstance = axios.create({
    timeout: CONFIG.timeout,
    maxRedirects: 5,
    validateStatus: (status) => status < 500,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
});

// 🛡️ SMART DELAY FUNCTION
function smartDelay(min = CONFIG.smartDelayMin, max = CONFIG.smartDelayMax) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// 🎭 RANDOM USER AGENT
function randomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 🔍 ENHANCED REQUEST WITH PROTECTION
async function protectedRequest(url, retries = CONFIG.retryAttempts) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            STATS.totalRequests++;
            
            // 🎭 Rotate User-Agent and headers
            axiosInstance.defaults.headers['User-Agent'] = randomUserAgent();
            axiosInstance.defaults.headers['Referer'] = attempt > 1 ? 'https://www.google.com/' : 'https://www.netcarshow.com/';
            
            if (CONFIG.verboseMode) {
                console.log(`⏳ Smart delay: ${Math.ceil((CONFIG.smartDelayMax - CONFIG.smartDelayMin) / 1000)}s (attempt ${attempt})`);
            }
            
            await smartDelay();
            
            const response = await axiosInstance.get(url);
            
            if (response.status === 200 && response.data.length > 1000) {
                STATS.successfulRequests++;
                console.log(`✅ Request successful: ${url}`);
                return response.data;
            } else if (response.status === 403 || response.status === 429) {
                console.log(`🚫 Blocked (${response.status}). Extended delay...`);
                await smartDelay(10000, 20000); // Extended delay
                continue;
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }
            
        } catch (error) {
            STATS.failedRequests++;
            console.log(`⚠️  Attempt ${attempt}/${retries} failed: ${error.message}`);
            
            if (attempt < retries) {
                const retryDelay = Math.pow(2, attempt) * 2000; // Exponential backoff
                console.log(`⏳ Retry in ${retryDelay/1000}s...`);
                await smartDelay(retryDelay, retryDelay + 3000);
            } else {
                STATS.errors.push({ url, error: error.message });
                console.log(`❌ All attempts failed for: ${url}`);
                return null;
            }
        }
    }
    return null;
}

// 📥 IMAGE DOWNLOAD FUNCTION
async function downloadImage(imageUrl, savePath) {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': randomUserAgent(),
                'Referer': 'https://www.netcarshow.com/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
            }
        });

        if (response.status === 200) {
            // Create directory if it doesn't exist
            await fs.mkdir(path.dirname(savePath), { recursive: true });
            
            const writer = createWriteStream(savePath);
            response.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    STATS.imagesDownloaded++;
                    resolve(savePath);
                });
                writer.on('error', reject);
            });
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Image download failed: ${error.message}`);
        return null;
    }
}

// 📊 PROGRESS REPORTER
function reportProgress() {
    const runtime = Math.floor((Date.now() - STATS.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;
    
    console.log('\n📊 ═══════════════════ PROGRESS REPORT ═══════════════════');
    console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
    console.log(`🌐 Requests: ${STATS.successfulRequests}/${STATS.totalRequests} (${STATS.failedRequests} failed)`);
    console.log(`🏭 Brands processed: ${STATS.brandsProcessed}`);
    console.log(`🚗 Models processed: ${STATS.modelsProcessed}`);
    console.log(`📸 Images downloaded: ${STATS.imagesDownloaded}`);
    console.log(`💾 Total size: ${(STATS.totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log('═══════════════════════════════════════════════════════════\n');
}

// Set progress reporter
setInterval(reportProgress, 300000); // Every 5 minutes

// 🚀 MAIN SCRAPING FUNCTION
async function massiveDownload() {
    console.log('🚀 ULTIMATE MASSIVE DOWNLOAD MODE');
    console.log('📸 Ready to download ALL car images from NetCarShow.com');
    console.log('🛡️  Protection: Smart delays + Anti-blocking + Real downloads');
    console.log();
    
    console.log('🛡️  ══════════════════════════════════════════════════════════════════');
    console.log('🚗 ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER - MASSIVE DOWNLOAD');
    console.log('🛡️  ══════════════════════════════════════════════════════════════════');
    console.log(`📁 Target directory: ${path.join(__dirname, 'brand_directories')}`);
    console.log(`⚙️  Max brands: ${CONFIG.maxBrands}`);
    console.log(`⚙️  Max models per brand: ${CONFIG.maxModelsPerBrand}`);
    console.log(`⚙️  Max images per model: ${CONFIG.maxImagesPerModel}`);
    console.log(`💾 Real download: ${CONFIG.downloadImages ? 'ENABLED' : 'DISABLED'}`);
    console.log('🛡️  ══════════════════════════════════════════════════════════════════');
    console.log();
    
    console.log('🚀 STARTING MASSIVE DOWNLOAD WITH ULTIMATE PROTECTION');
    console.log();
    
    // 🔍 Discover all brands
    console.log('🔍 Discovering car brands from NetCarShow...');
    const brandData = await protectedRequest('https://www.netcarshow.com/');
    
    if (!brandData) {
        console.log('❌ Failed to load main page. Exiting...');
        return;
    }
    
    // Extract brand links - improved regex
    const brandRegex = /<a href="\/([a-z_]+)\/" title="([^"]+)"/gi;
    const brands = [];
    let match;
    
    while ((match = brandRegex.exec(brandData)) !== null) {
        if (!brands.some(b => b.slug === match[1])) {
            brands.push({
                slug: match[1],
                name: match[2].replace(/ Cars?$/i, '').trim(),
                url: `https://www.netcarshow.com/${match[1]}/`
            });
        }
    }
    
    // Alternative extraction method if first fails
    if (brands.length === 0) {
        const altRegex = /href="\/([a-zA-Z0-9_-]+)\/"[^>]*>([^<]+)</gi;
        while ((match = altRegex.exec(brandData)) !== null) {
            const slug = match[1].toLowerCase();
            const name = match[2].replace(/\s+cars?$/i, '').trim();
            if (slug.length > 1 && name.length > 1 && !brands.some(b => b.slug === slug)) {
                brands.push({
                    slug: slug,
                    name: name,
                    url: `https://www.netcarshow.com/${slug}/`
                });
            }
        }
    }
    
    console.log(`✅ Found ${brands.length} car brands`);
    brands.slice(0, 10).forEach((brand, i) => {
        console.log(`   ${i + 1}. ${brand.name}`);
    });
    if (brands.length > 10) {
        console.log(`   ... and ${brands.length - 10} more brands`);
    }
    
    console.log();
    console.log(`🎯 Starting massive download: ${Math.min(CONFIG.maxBrands, brands.length)} brands`);
    console.log(`📱 Estimated total: ${CONFIG.maxBrands * CONFIG.maxModelsPerBrand * CONFIG.maxImagesPerModel} images max`);
    console.log();
    
    // Process each brand
    for (let i = 0; i < Math.min(CONFIG.maxBrands, brands.length); i++) {
        const brand = brands[i];
        
        console.log(`[${i + 1}/${Math.min(CONFIG.maxBrands, brands.length)}] Starting: ${brand.name}`);
        console.log();
        
        try {
            await processBrand(brand);
            STATS.brandsProcessed++;
            
            if (i < Math.min(CONFIG.maxBrands, brands.length) - 1) {
                console.log('⏳ Inter-brand delay: 10s');
                await smartDelay(8000, 12000);
            }
            
        } catch (error) {
            console.log(`❌ Error processing ${brand.name}: ${error.message}`);
            STATS.errors.push({ brand: brand.name, error: error.message });
        }
        
        console.log();
    }
    
    // Final report
    console.log('🎉 ══════════════ MASSIVE DOWNLOAD COMPLETED! ══════════════');
    console.log();
    reportProgress();
    
    if (STATS.errors.length > 0) {
        console.log('⚠️  ERRORS ENCOUNTERED:');
        STATS.errors.slice(0, 10).forEach((error, i) => {
            console.log(`   ${i + 1}. ${error.brand || error.url}: ${error.error}`);
        });
        if (STATS.errors.length > 10) {
            console.log(`   ... and ${STATS.errors.length - 10} more errors`);
        }
    }
    
    console.log('🧹 Massive download session completed.');
}

// 🏭 PROCESS INDIVIDUAL BRAND
async function processBrand(brand) {
    console.log(`🏭 Processing brand: ${brand.name}`);
    console.log(`   🔍 Discovering models for ${brand.name}...`);
    
    const brandData = await protectedRequest(brand.url);
    if (!brandData) {
        console.log(`   ❌ Failed to load brand page for ${brand.name}`);
        return;
    }
    
    // Extract model information
    const modelRegex = /<a href="\/([^\/]+)\/([^\/]+)\/" title="([^"]+)"/g;
    const models = [];
    let match;
    
    while ((match = modelRegex.exec(brandData)) !== null && models.length < CONFIG.maxModelsPerBrand) {
        if (match[1] === brand.slug) {
            models.push({
                slug: match[2],
                name: match[3],
                url: `https://www.netcarshow.com/${match[1]}/${match[2]}/`
            });
        }
    }
    
    console.log(`   ✅ Found ${models.length} models for ${brand.name}`);
    
    // Create brand directory
    const brandDir = path.join(__dirname, 'brand_directories', brand.name.replace(/[^a-zA-Z0-9]/g, '_'));
    await fs.mkdir(brandDir, { recursive: true });
    
    let brandImageCount = 0;
    
    // Process each model
    for (let j = 0; j < models.length; j++) {
        const model = models[j];
        console.log(`   [${j + 1}/${models.length}] Processing: ${model.name}`);
        
        try {
            const imageCount = await processModel(model, brandDir);
            brandImageCount += imageCount;
            STATS.modelsProcessed++;
            
            await smartDelay(2000, 5000); // Delay between models
            
        } catch (error) {
            console.log(`   ❌ Error processing model ${model.name}: ${error.message}`);
        }
    }
    
    console.log(`   ✅ ${brand.name} completed: ${brandImageCount} images processed`);
}

// 🚗 PROCESS INDIVIDUAL MODEL
async function processModel(model, brandDir) {
    console.log(`     🚗 Processing model: ${model.name}`);
    
    const modelData = await protectedRequest(model.url);
    if (!modelData) {
        console.log(`     ❌ Failed to load model page for ${model.name}`);
        return 0;
    }
    
    // Extract image URLs - improved method
    const imageRegex = /<img[^>]+src="([^"]*\.jpg[^"]*)"[^>]*>/gi;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(modelData)) !== null && images.length < CONFIG.maxImagesPerModel) {
        let imageUrl = match[1];
        if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png')) {
            // Convert relative URLs to absolute
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
                imageUrl = 'https://www.netcarshow.com' + imageUrl;
            } else if (!imageUrl.startsWith('http')) {
                continue; // Skip invalid URLs
            }
            
            // Only include high-quality images
            if (!images.includes(imageUrl) && (imageUrl.includes('netcarshow') || imageUrl.includes('carphoto'))) {
                images.push(imageUrl);
            }
        }
    }
    
    // Alternative extraction for different image formats
    if (images.length < 5) {
        const altImageRegex = /src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"[^>]*>/gi;
        while ((match = altImageRegex.exec(modelData)) !== null && images.length < CONFIG.maxImagesPerModel) {
            let imageUrl = match[1];
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
                imageUrl = 'https://www.netcarshow.com' + imageUrl;
            }
            
            if (imageUrl.startsWith('http') && !images.includes(imageUrl)) {
                images.push(imageUrl);
            }
        }
    }
    
    console.log(`       📸 Found ${images.length} images`);
    
    if (!CONFIG.downloadImages) {
        console.log(`       🎭 Simulation mode: skipping actual download`);
        return images.length;
    }
    
    // Create model directory
    const modelDir = path.join(brandDir, model.name.replace(/[^a-zA-Z0-9]/g, '_'));
    await fs.mkdir(modelDir, { recursive: true });
    
    let downloadCount = 0;
    
    // Download images with concurrency limit
    for (let i = 0; i < images.length; i += CONFIG.concurrentDownloads) {
        const batch = images.slice(i, i + CONFIG.concurrentDownloads);
        const downloadPromises = batch.map(async (imageUrl, batchIndex) => {
            const imageIndex = i + batchIndex + 1;
            const filename = `image_${imageIndex.toString().padStart(3, '0')}.jpg`;
            const savePath = path.join(modelDir, filename);
            
            console.log(`       ⬇️  Downloading image ${imageIndex}/${images.length}...`);
            
            try {
                const result = await downloadImage(imageUrl, savePath);
                if (result) {
                    const stats = await fs.stat(savePath);
                    STATS.totalSize += stats.size;
                    downloadCount++;
                    return true;
                }
            } catch (error) {
                console.log(`       ❌ Failed to download image ${imageIndex}: ${error.message}`);
            }
            return false;
        });
        
        await Promise.all(downloadPromises);
        
        // Small delay between batches
        if (i + CONFIG.concurrentDownloads < images.length) {
            await smartDelay(1000, 2000);
        }
    }
    
    console.log(`     ✅ ${model.name} completed: ${downloadCount}/${images.length} images downloaded`);
    return downloadCount;
}

// 🚀 START MASSIVE DOWNLOAD
massiveDownload().catch(error => {
    console.error('💥 Fatal error:', error);
    reportProgress();
    process.exit(1);
});
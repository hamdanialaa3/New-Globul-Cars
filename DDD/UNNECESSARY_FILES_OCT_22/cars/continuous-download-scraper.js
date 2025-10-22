import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔥 CONTINUOUS DOWNLOAD CONFIGURATION
const CONFIG = {
    maxBrands: 100,
    maxImagesPerBrand: 500,
    smartDelayMin: 500,
    smartDelayMax: 2000,
    downloadImages: true,
    timeout: 15000,
    concurrentDownloads: 10,
    retryAttempts: 3,
    resumeFromBrand: 0 // للاستمرار من علامة معينة
};

let STATS = {
    requests: 0,
    successful: 0,
    failed: 0,
    imagesDownloaded: 0,
    totalSize: 0,
    startTime: Date.now(),
    currentBrand: '',
    errors: []
};

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const axiosInstance = axios.create({
    timeout: CONFIG.timeout,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'User-Agent': USER_AGENTS[0]
    }
});

function delay(min = CONFIG.smartDelayMin, max = CONFIG.smartDelayMax) {
    const ms = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function safeRequest(url, retries = CONFIG.retryAttempts) {
    for (let i = 0; i < retries; i++) {
        try {
            STATS.requests++;
            axiosInstance.defaults.headers['User-Agent'] = randomUserAgent();
            
            await delay();
            const response = await axiosInstance.get(url);
            
            if (response.status === 200) {
                STATS.successful++;
                return response.data;
            }
        } catch (error) {
            STATS.failed++;
            if (i === retries - 1) {
                STATS.errors.push({ url, error: error.message });
                return null;
            }
            await delay(2000, 5000);
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
    const imagesPerMinute = Math.floor(STATS.imagesDownloaded / (runtime / 60));
    
    console.log('\n🔥 ══════════════ CONTINUOUS DOWNLOAD PROGRESS ══════════════');
    console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
    console.log(`🏭 Current brand: ${STATS.currentBrand}`);
    console.log(`🌐 Requests: ${STATS.successful}/${STATS.requests} (${STATS.failed} failed)`);
    console.log(`📸 Images downloaded: ${STATS.imagesDownloaded}`);
    console.log(`⚡ Speed: ${imagesPerMinute} images/minute`);
    console.log(`💾 Total size: ${(STATS.totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log('═════════════════════════════════════════════════════════════\n');
}

// Report every 2 minutes
setInterval(reportProgress, 120000);

async function continuousDownload() {
    console.log('🔥 CONTINUOUS DOWNLOAD - NetCarShow Mega Scraper');
    console.log('🚀 Download ALL images continuously with maximum speed!');
    console.log();
    
    console.log('📊 Configuration:');
    console.log(`   🏭 Max brands: ${CONFIG.maxBrands}`);
    console.log(`   📸 Max images per brand: ${CONFIG.maxImagesPerBrand}`);
    console.log(`   ⚡ Delays: ${CONFIG.smartDelayMin}-${CONFIG.smartDelayMax}ms`);
    console.log(`   🔄 Concurrent downloads: ${CONFIG.concurrentDownloads}`);
    console.log();
    
    // Get all known car brands
    const brands = [
        'BMW', 'Mercedes-Benz', 'Audi', 'Ferrari', 'Lamborghini', 'Porsche', 'McLaren',
        'Bugatti', 'Bentley', 'Rolls-Royce', 'Maserati', 'Aston-Martin', 'Jaguar',
        'Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Volkswagen', 'Hyundai',
        'Kia', 'Mazda', 'Subaru', 'Lexus', 'Infiniti', 'Acura', 'Genesis', 'Volvo',
        'Peugeot', 'Renault', 'Citroen', 'Fiat', 'Alfa-Romeo', 'Lancia', 'Jeep',
        'Dodge', 'Chrysler', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Ram', 'Tesla',
        'Lucid', 'Rivian', 'Polestar', 'Mini', 'Land-Rover', 'Range-Rover', 'Lotus',
        'Morgan', 'Caterham', 'TVR', 'Noble', 'Koenigsegg', 'Pagani', 'Zenvo',
        'Rimac', 'Pininfarina', 'Italdesign', 'Bertone', 'Giugiaro', 'Zagato',
        'Alpine', 'DS', 'Seat', 'Skoda', 'Opel', 'Vauxhall', 'Holden', 'HSV',
        'Saab', 'Spyker', 'Donkervoort', 'Gumpert', 'Wiesmann', 'Artega', 'Melkus',
        'Bitter', 'Isdera', 'Carlsson', 'Brabus', 'AMG', 'Alpina', 'Hamann',
        'Mansory', 'Techart', 'Gemballa', 'RUF', 'Singer', 'ICON', 'Restomod',
        'Hennessey', 'Shelby', 'Roush', 'Saleen', 'Callaway', 'Lingenfelter',
        'Pratt-Miller', 'Rezvani', 'SSC', 'Mosler', 'Panoz', 'Vector', 'Rossion',
        'Factory-Five', 'Superformance', 'Backdraft', 'ERA', 'Kirkham', 'Lonestar'
    ];
    
    console.log(`🎯 Processing ${Math.min(CONFIG.maxBrands, brands.length)} car brands`);
    console.log('🔥 CONTINUOUS DOWNLOAD STARTING NOW!');
    console.log();
    
    let totalImages = 0;
    
    // Process brands starting from resume point
    for (let i = CONFIG.resumeFromBrand; i < Math.min(CONFIG.maxBrands, brands.length); i++) {
        const brand = brands[i];
        STATS.currentBrand = brand;
        
        console.log(`[${i + 1}/${Math.min(CONFIG.maxBrands, brands.length)}] 🔥 ${brand.toUpperCase()}`);
        
        try {
            const brandImages = await processBrandContinuous(brand, i);
            totalImages += brandImages;
            
            console.log(`   ✅ ${brand}: ${brandImages} images downloaded`);
            
            // Brief pause between brands
            if (i < Math.min(CONFIG.maxBrands, brands.length) - 1) {
                await delay(1000, 3000);
            }
            
        } catch (error) {
            console.log(`   ❌ ${brand} error: ${error.message}`);
            STATS.errors.push({ brand, error: error.message });
        }
        
        console.log();
    }
    
    // Final report
    const runtime = Math.floor((Date.now() - STATS.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;
    
    console.log('🎉 ══════════════ CONTINUOUS DOWNLOAD COMPLETED! ══════════════');
    console.log(`⏱️  Total runtime: ${minutes}m ${seconds}s`);
    console.log(`📸 Total images downloaded: ${STATS.imagesDownloaded}`);
    console.log(`💾 Total size: ${(STATS.totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log(`🌐 Total requests: ${STATS.successful}/${STATS.requests}`);
    console.log(`⚡ Average speed: ${Math.floor(STATS.imagesDownloaded / (runtime / 60))} images/minute`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (STATS.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        STATS.errors.slice(0, 10).forEach((error, i) => {
            console.log(`   ${i + 1}. ${error.brand || error.url}: ${error.error}`);
        });
    }
}

async function processBrandContinuous(brand, brandIndex) {
    const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const brandUrl = `https://www.netcarshow.com/${brandSlug}/`;
    
    console.log(`   🔍 Loading ${brand} page...`);
    
    const brandData = await safeRequest(brandUrl);
    if (!brandData) {
        console.log(`   ❌ Failed to load ${brand}`);
        return 0;
    }
    
    // Extract all image URLs from brand page and sub-pages
    const imageUrls = [];
    
    // Extract images from main brand page
    const imageRegex = /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|webp))"[^>]*>/gi;
    let match;
    
    while ((match = imageRegex.exec(brandData)) !== null) {
        let imageUrl = match[1];
        
        if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://www.netcarshow.com' + imageUrl;
        }
        
        if (imageUrl.startsWith('https://') && 
            !imageUrl.includes('_thumb') && 
            !imageUrl.includes('_small') &&
            !imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
        }
        
        if (imageUrls.length >= CONFIG.maxImagesPerBrand) break;
    }
    
    // Extract model pages and get more images
    const modelRegex = /<a href="\/([^"]+)\/"[^>]*>/gi;
    const modelUrls = [];
    
    while ((match = modelRegex.exec(brandData)) !== null && modelUrls.length < 20) {
        const modelPath = match[1];
        if (modelPath.includes(brandSlug) && modelPath !== brandSlug) {
            modelUrls.push(`https://www.netcarshow.com/${modelPath}/`);
        }
    }
    
    // Get images from model pages
    for (const modelUrl of modelUrls) {
        if (imageUrls.length >= CONFIG.maxImagesPerBrand) break;
        
        const modelData = await safeRequest(modelUrl);
        if (modelData) {
            let modelMatch;
            while ((modelMatch = imageRegex.exec(modelData)) !== null) {
                let imageUrl = modelMatch[1];
                
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                } else if (imageUrl.startsWith('/')) {
                    imageUrl = 'https://www.netcarshow.com' + imageUrl;
                }
                
                if (imageUrl.startsWith('https://') && 
                    !imageUrl.includes('_thumb') && 
                    !imageUrls.includes(imageUrl)) {
                    imageUrls.push(imageUrl);
                }
                
                if (imageUrls.length >= CONFIG.maxImagesPerBrand) break;
            }
        }
    }
    
    console.log(`   📸 Found ${imageUrls.length} images`);
    
    if (imageUrls.length === 0) {
        console.log(`   ⚠️  No images found for ${brand}`);
        return 0;
    }
    
    // Create brand directory
    const brandDir = path.join(__dirname, 'brand_directories', brand.replace(/[^a-zA-Z0-9]/g, '_'));
    await fs.mkdir(brandDir, { recursive: true });
    
    let downloadCount = 0;
    
    // Download images in batches
    for (let j = 0; j < imageUrls.length; j += CONFIG.concurrentDownloads) {
        const batch = imageUrls.slice(j, j + CONFIG.concurrentDownloads);
        
        const downloadPromises = batch.map(async (imageUrl, batchIndex) => {
            const imageIndex = j + batchIndex + 1;
            const extension = imageUrl.includes('.png') ? '.png' : 
                             imageUrl.includes('.webp') ? '.webp' : '.jpg';
            const filename = `${brand}_${imageIndex.toString().padStart(4, '0')}${extension}`;
            const savePath = path.join(brandDir, filename);
            
            // Skip if already exists
            try {
                await fs.access(savePath);
                return false;
            } catch {}
            
            const result = await downloadImage(imageUrl, savePath);
            if (result) {
                downloadCount++;
                if (downloadCount % 10 === 0) {
                    console.log(`   ⬇️  Downloaded: ${downloadCount}/${imageUrls.length}`);
                }
                return true;
            }
            return false;
        });
        
        await Promise.all(downloadPromises);
        
        // Small delay between batches
        if (j + CONFIG.concurrentDownloads < imageUrls.length) {
            await delay(200, 800);
        }
    }
    
    return downloadCount;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  CONTINUOUS DOWNLOAD STOPPED BY USER');
    reportProgress();
    console.log('💾 All downloaded images are preserved.');
    console.log(`🔄 To resume, set resumeFromBrand to current brand index.`);
    process.exit(0);
});

// Start continuous download
console.log('🔥 Starting Continuous Download...');
continuousDownload().catch(error => {
    console.error('💥 Fatal error:', error.message);
    reportProgress();
    process.exit(1);
});
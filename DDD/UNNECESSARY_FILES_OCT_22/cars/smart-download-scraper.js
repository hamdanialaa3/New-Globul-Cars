import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🎯 SMART DOWNLOAD CONFIGURATION
const CONFIG = {
    maxBrands: 15,
    maxImagesPerBrand: 100,
    smartDelayMin: 1000,
    smartDelayMax: 3000,
    downloadImages: true,
    timeout: 20000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

let STATS = {
    requests: 0,
    successful: 0,
    failed: 0,
    imagesDownloaded: 0,
    totalSize: 0,
    startTime: Date.now()
};

const axiosInstance = axios.create({
    timeout: CONFIG.timeout,
    headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Referer': 'https://www.netcarshow.com/'
    }
});

function delay(min = CONFIG.smartDelayMin, max = CONFIG.smartDelayMax) {
    const ms = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeRequest(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            STATS.requests++;
            await delay();
            
            const response = await axiosInstance.get(url);
            if (response.status === 200) {
                STATS.successful++;
                return response.data;
            }
        } catch (error) {
            STATS.failed++;
            if (i === retries - 1) {
                console.log(`❌ Failed after ${retries} attempts: ${url}`);
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
            timeout: 30000
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

async function smartDownload() {
    console.log('🎯 SMART DOWNLOAD - NetCarShow Image Scraper');
    console.log('⚡ Fast & Protected Image Download');
    console.log();
    
    // Define popular car brands with their URLs
    const brands = [
        { name: 'BMW', url: 'https://www.netcarshow.com/bmw/' },
        { name: 'Mercedes-Benz', url: 'https://www.netcarshow.com/mercedes-benz/' },
        { name: 'Audi', url: 'https://www.netcarshow.com/audi/' },
        { name: 'Ferrari', url: 'https://www.netcarshow.com/ferrari/' },
        { name: 'Lamborghini', url: 'https://www.netcarshow.com/lamborghini/' },
        { name: 'Porsche', url: 'https://www.netcarshow.com/porsche/' },
        { name: 'McLaren', url: 'https://www.netcarshow.com/mclaren/' },
        { name: 'Bugatti', url: 'https://www.netcarshow.com/bugatti/' },
        { name: 'Bentley', url: 'https://www.netcarshow.com/bentley/' },
        { name: 'Rolls-Royce', url: 'https://www.netcarshow.com/rolls-royce/' },
        { name: 'Toyota', url: 'https://www.netcarshow.com/toyota/' },
        { name: 'Honda', url: 'https://www.netcarshow.com/honda/' },
        { name: 'Ford', url: 'https://www.netcarshow.com/ford/' },
        { name: 'Chevrolet', url: 'https://www.netcarshow.com/chevrolet/' },
        { name: 'Nissan', url: 'https://www.netcarshow.com/nissan/' }
    ];
    
    console.log(`🎯 Processing ${Math.min(CONFIG.maxBrands, brands.length)} top car brands`);
    console.log();
    
    for (let i = 0; i < Math.min(CONFIG.maxBrands, brands.length); i++) {
        const brand = brands[i];
        
        console.log(`[${i + 1}/${Math.min(CONFIG.maxBrands, brands.length)}] 🏭 ${brand.name}`);
        
        try {
            await processBrandSmart(brand);
            
            if (i < Math.min(CONFIG.maxBrands, brands.length) - 1) {
                console.log('   ⏳ Moving to next brand...');
                await delay(3000, 6000);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log();
    }
    
    // Final report
    const runtime = Math.floor((Date.now() - STATS.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;
    
    console.log('🎉 ══════════════ DOWNLOAD COMPLETED! ══════════════');
    console.log(`⏱️  Runtime: ${minutes}m ${seconds}s`);
    console.log(`🌐 Requests: ${STATS.successful}/${STATS.requests} successful`);
    console.log(`📸 Images downloaded: ${STATS.imagesDownloaded}`);
    console.log(`💾 Total size: ${(STATS.totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log('═══════════════════════════════════════════════════');
}

async function processBrandSmart(brand) {
    console.log(`   🔍 Loading ${brand.name} page...`);
    
    const brandData = await safeRequest(brand.url);
    if (!brandData) {
        console.log(`   ❌ Failed to load ${brand.name}`);
        return;
    }
    
    // Extract all image URLs from the brand page
    const imageUrls = [];
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
    
    console.log(`   📸 Found ${imageUrls.length} images`);
    
    if (imageUrls.length === 0) {
        console.log(`   ⚠️  No images found for ${brand.name}`);
        return;
    }
    
    // Create brand directory
    const brandDir = path.join(__dirname, 'brand_directories', brand.name.replace(/[^a-zA-Z0-9]/g, '_'));
    await fs.mkdir(brandDir, { recursive: true });
    
    let downloadCount = 0;
    
    // Download images
    for (let j = 0; j < imageUrls.length; j++) {
        const imageUrl = imageUrls[j];
        const extension = imageUrl.includes('.png') ? '.png' : 
                         imageUrl.includes('.webp') ? '.webp' : '.jpg';
        const filename = `${brand.name}_${(j + 1).toString().padStart(3, '0')}${extension}`;
        const savePath = path.join(brandDir, filename);
        
        // Skip if already exists
        try {
            await fs.access(savePath);
            continue;
        } catch {}
        
        console.log(`   ⬇️  [${j + 1}/${imageUrls.length}] Downloading...`);
        
        const result = await downloadImage(imageUrl, savePath);
        if (result) {
            downloadCount++;
        }
        
        // Small delay between downloads
        if (j < imageUrls.length - 1) {
            await delay(500, 1500);
        }
    }
    
    console.log(`   ✅ ${brand.name}: ${downloadCount} images downloaded`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  DOWNLOAD STOPPED BY USER');
    const runtime = Math.floor((Date.now() - STATS.startTime) / 1000);
    console.log(`📊 Downloaded: ${STATS.imagesDownloaded} images in ${runtime}s`);
    console.log('💾 All images are saved.');
    process.exit(0);
});

// Start smart download
console.log('🚀 Starting Smart Download...');
smartDownload().catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});
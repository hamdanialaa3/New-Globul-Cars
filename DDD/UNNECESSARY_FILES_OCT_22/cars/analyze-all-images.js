import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔍 COMPREHENSIVE IMAGE ANALYZER
async function analyzeImages() {
    console.log('🔍 COMPREHENSIVE IMAGE ANALYZER - NetCarShow');
    console.log('🎯 Analyzing all downloaded images for quality and content');
    console.log();
    
    const brandDirsPath = path.join(__dirname, 'brand_directories');
    
    const analysis = {
        totalImages: 0,
        sizeGroups: new Map(),
        hashGroups: new Map(),
        suspiciousImages: [],
        validImages: [],
        brandStats: new Map(),
        fileExtensions: new Map(),
        corruptedImages: [],
        duplicateHashes: new Map()
    };
    
    console.log('📊 Starting comprehensive scan...');
    
    async function scanDirectory(dirPath, currentBrand = '') {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    const brandName = currentBrand || item.name;
                    await scanDirectory(fullPath, brandName);
                } else if (item.isFile() && item.name.toLowerCase().endsWith('.jpg')) {
                    await analyzeImage(fullPath, currentBrand);
                }
            }
        } catch (error) {
            console.log(`⚠️  Cannot read directory: ${dirPath}`);
        }
    }
    
    async function analyzeImage(imagePath, brandName) {
        try {
            const stats = await fs.stat(imagePath);
            const size = stats.size;
            const relativePath = path.relative(brandDirsPath, imagePath);
            
            analysis.totalImages++;
            
            // Update brand stats
            if (!analysis.brandStats.has(brandName)) {
                analysis.brandStats.set(brandName, { count: 0, totalSize: 0 });
            }
            const brandStat = analysis.brandStats.get(brandName);
            brandStat.count++;
            brandStat.totalSize += size;
            
            // Group by size
            const sizeRange = getSizeRange(size);
            analysis.sizeGroups.set(sizeRange, (analysis.sizeGroups.get(sizeRange) || 0) + 1);
            
            // Check if image is suspicious
            const suspicious = await checkSuspiciousImage(imagePath, size);
            
            if (suspicious.isSuspicious) {
                analysis.suspiciousImages.push({
                    path: relativePath,
                    size: size,
                    reason: suspicious.reason,
                    brand: brandName
                });
            } else {
                analysis.validImages.push({
                    path: relativePath,
                    size: size,
                    brand: brandName
                });
            }
            
            // Create hash to detect exact duplicates
            try {
                const buffer = await fs.readFile(imagePath);
                const hash = createHash('md5').update(buffer).digest('hex');
                
                if (!analysis.hashGroups.has(hash)) {
                    analysis.hashGroups.set(hash, []);
                }
                analysis.hashGroups.get(hash).push(relativePath);
                
                if (analysis.hashGroups.get(hash).length > 1) {
                    analysis.duplicateHashes.set(hash, analysis.hashGroups.get(hash));
                }
            } catch (error) {
                analysis.corruptedImages.push({
                    path: relativePath,
                    error: error.message
                });
            }
            
            // Progress indicator
            if (analysis.totalImages % 50 === 0) {
                console.log(`   🔍 Analyzed ${analysis.totalImages} images...`);
            }
            
        } catch (error) {
            analysis.corruptedImages.push({
                path: path.relative(brandDirsPath, imagePath),
                error: error.message
            });
        }
    }
    
    await scanDirectory(brandDirsPath);
    
    // Generate comprehensive report
    console.log('\n📊 ══════════════ COMPREHENSIVE ANALYSIS REPORT ══════════════');
    console.log(`🔍 Total images analyzed: ${analysis.totalImages}`);
    console.log(`✅ Valid images: ${analysis.validImages.length} (${((analysis.validImages.length / analysis.totalImages) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Suspicious images: ${analysis.suspiciousImages.length} (${((analysis.suspiciousImages.length / analysis.totalImages) * 100).toFixed(1)}%)`);
    console.log(`💥 Corrupted images: ${analysis.corruptedImages.length}`);
    console.log(`🔄 Exact duplicates: ${analysis.duplicateHashes.size} groups`);
    
    console.log('\n📋 SIZE DISTRIBUTION:');
    for (const [range, count] of Array.from(analysis.sizeGroups.entries()).sort((a, b) => b[1] - a[1])) {
        const percentage = ((count / analysis.totalImages) * 100).toFixed(1);
        console.log(`   ${range}: ${count} images (${percentage}%)`);
    }
    
    console.log('\n🏭 BRAND STATISTICS:');
    const sortedBrands = Array.from(analysis.brandStats.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);
        
    for (const [brand, stats] of sortedBrands) {
        const avgSize = (stats.totalSize / stats.count / 1024).toFixed(1);
        console.log(`   ${brand}: ${stats.count} images (avg: ${avgSize} KB)`);
    }
    
    if (analysis.suspiciousImages.length > 0) {
        console.log('\n⚠️  SUSPICIOUS IMAGES ANALYSIS:');
        
        // Group suspicious by reason
        const suspiciousGroups = {};
        analysis.suspiciousImages.forEach(img => {
            if (!suspiciousGroups[img.reason]) {
                suspiciousGroups[img.reason] = [];
            }
            suspiciousGroups[img.reason].push(img);
        });
        
        for (const [reason, images] of Object.entries(suspiciousGroups)) {
            console.log(`\n   📋 ${reason} (${images.length} files):`);
            images.slice(0, 5).forEach(img => {
                console.log(`      📁 ${img.path} (${(img.size / 1024).toFixed(1)} KB)`);
            });
            if (images.length > 5) {
                console.log(`      ... and ${images.length - 5} more files`);
            }
        }
    }
    
    if (analysis.duplicateHashes.size > 0) {
        console.log('\n🔄 EXACT DUPLICATE GROUPS:');
        let duplicateCount = 0;
        for (const [hash, files] of Array.from(analysis.duplicateHashes.entries()).slice(0, 10)) {
            duplicateCount++;
            console.log(`\n   📋 Duplicate Group ${duplicateCount} (${files.length} identical files):`);
            files.forEach(file => {
                console.log(`      📁 ${file}`);
            });
        }
        
        if (analysis.duplicateHashes.size > 10) {
            console.log(`   ... and ${analysis.duplicateHashes.size - 10} more duplicate groups`);
        }
    }
    
    if (analysis.corruptedImages.length > 0) {
        console.log('\n💥 CORRUPTED/UNREADABLE IMAGES:');
        analysis.corruptedImages.slice(0, 10).forEach(img => {
            console.log(`   ❌ ${img.path}: ${img.error}`);
        });
        if (analysis.corruptedImages.length > 10) {
            console.log(`   ... and ${analysis.corruptedImages.length - 10} more corrupted files`);
        }
    }
    
    // Sample valid images
    if (analysis.validImages.length > 0) {
        console.log('\n✅ SAMPLE VALID IMAGES:');
        const sampleValid = analysis.validImages
            .sort((a, b) => b.size - a.size)
            .slice(0, 10);
            
        sampleValid.forEach(img => {
            console.log(`   🎯 ${img.path} (${(img.size / 1024).toFixed(1)} KB)`);
        });
    }
    
    console.log('\n📈 QUALITY ASSESSMENT:');
    const qualityScore = ((analysis.validImages.length / analysis.totalImages) * 100).toFixed(1);
    const avgValidSize = analysis.validImages.length > 0 ? 
        analysis.validImages.reduce((sum, img) => sum + img.size, 0) / analysis.validImages.length / 1024 : 0;
    
    console.log(`   🎯 Quality Score: ${qualityScore}% (valid images ratio)`);
    console.log(`   📊 Average valid image size: ${avgValidSize.toFixed(1)} KB`);
    
    if (qualityScore < 70) {
        console.log('   ⚠️  WARNING: Low quality ratio detected!');
    } else if (qualityScore > 90) {
        console.log('   🏆 EXCELLENT: High quality image collection!');
    } else {
        console.log('   ✅ GOOD: Acceptable quality ratio');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (analysis.suspiciousImages.length > 0) {
        console.log('   🧹 Run image cleaner to remove suspicious images');
    }
    if (analysis.duplicateHashes.size > 0) {
        console.log('   🔄 Remove exact duplicates to save space');
    }
    if (analysis.corruptedImages.length > 0) {
        console.log('   💥 Remove or re-download corrupted images');
    }
    if (avgValidSize < 50) {
        console.log('   📈 Consider downloading higher quality images');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    
    return analysis;
}

function getSizeRange(size) {
    if (size < 5000) return 'Tiny (<5KB)';
    if (size < 10000) return 'Very small (5-10KB)';
    if (size < 25000) return 'Small (10-25KB)';
    if (size < 50000) return 'Medium-small (25-50KB)';
    if (size < 100000) return 'Medium (50-100KB)';
    if (size < 250000) return 'Medium-large (100-250KB)';
    if (size < 500000) return 'Large (250-500KB)';
    if (size < 1000000) return 'Very large (500KB-1MB)';
    if (size < 2000000) return 'Huge (1-2MB)';
    return 'Massive (>2MB)';
}

async function checkSuspiciousImage(imagePath, size) {
    // Common suspicious patterns
    const suspiciousSizes = [
        204125, 6428, 45898, 39254, 204126, 6429,
        1234, 2048, 4096, 8192, 16384  // Common placeholder sizes
    ];
    
    if (suspiciousSizes.includes(size)) {
        return { isSuspicious: true, reason: 'Known placeholder/404 image size' };
    }
    
    if (size < 5000) {
        return { isSuspicious: true, reason: 'Too small - likely icon/thumbnail' };
    }
    
    if (size > 10000000) { // 10MB
        return { isSuspicious: true, reason: 'Unusually large - possible corruption' };
    }
    
    // Check filename patterns
    const filename = path.basename(imagePath);
    if (filename.includes('404') || filename.includes('error') || filename.includes('notfound')) {
        return { isSuspicious: true, reason: 'Filename suggests error image' };
    }
    
    return { isSuspicious: false, reason: 'Appears valid' };
}

// Start analysis
console.log('🔍 Starting comprehensive image analysis...');
analyzeImages().catch(error => {
    console.error('💥 Analysis error:', error.message);
    process.exit(1);
});
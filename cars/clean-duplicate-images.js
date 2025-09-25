import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🧹 DUPLICATE CLEANER CONFIGURATION
const SUSPICIOUS_SIZES = [
    204125,  // Placeholder/404 images
    6428,    // Small placeholder images
    45898,   // Repeated ad/logo images
    39254,   // Banner images
    204126,  // Similar to 204125
    6429     // Similar to 6428
];

const MIN_VALID_SIZE = 10000;  // 10KB minimum for real car images
const MAX_DUPLICATES_ALLOWED = 5; // Max images of same size allowed

async function cleanDuplicateImages() {
    console.log('🧹 DUPLICATE IMAGE CLEANER - NetCarShow');
    console.log('🔍 Scanning for suspicious duplicate images...');
    console.log();
    
    const brandDirsPath = path.join(__dirname, 'brand_directories');
    
    let totalScanned = 0;
    let totalRemoved = 0;
    let totalPreserved = 0;
    const sizeMap = new Map();
    const filesToRemove = [];
    
    // Scan all images
    async function scanDirectory(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (item.isFile() && item.name.toLowerCase().endsWith('.jpg')) {
                    try {
                        const stats = await fs.stat(fullPath);
                        const size = stats.size;
                        totalScanned++;
                        
                        // Track file sizes
                        if (!sizeMap.has(size)) {
                            sizeMap.set(size, []);
                        }
                        sizeMap.get(size).push(fullPath);
                        
                        // Mark suspicious files
                        if (SUSPICIOUS_SIZES.includes(size)) {
                            filesToRemove.push({
                                path: fullPath,
                                size: size,
                                reason: 'Suspicious size (likely placeholder/404)'
                            });
                        } else if (size < MIN_VALID_SIZE) {
                            filesToRemove.push({
                                path: fullPath,
                                size: size,
                                reason: `Too small (${size} bytes) - likely icon/thumbnail`
                            });
                        }
                        
                    } catch (error) {
                        console.log(`⚠️  Cannot stat: ${fullPath}`);
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️  Cannot read directory: ${dirPath}`);
        }
    }
    
    await scanDirectory(brandDirsPath);
    
    // Find excessive duplicates
    for (const [size, files] of sizeMap.entries()) {
        if (files.length > MAX_DUPLICATES_ALLOWED && !SUSPICIOUS_SIZES.includes(size)) {
            // Keep first few, mark rest for removal
            const filesToMark = files.slice(MAX_DUPLICATES_ALLOWED);
            filesToMark.forEach(filePath => {
                filesToRemove.push({
                    path: filePath,
                    size: size,
                    reason: `Excessive duplicates (${files.length} files of same size)`
                });
            });
        }
    }
    
    console.log('📊 ══════════════ SCAN RESULTS ══════════════');
    console.log(`🔍 Total images scanned: ${totalScanned}`);
    console.log(`⚠️  Suspicious images found: ${filesToRemove.length}`);
    console.log();
    
    // Group by reason
    const reasonGroups = {};
    filesToRemove.forEach(file => {
        const reason = file.reason;
        if (!reasonGroups[reason]) {
            reasonGroups[reason] = [];
        }
        reasonGroups[reason].push(file);
    });
    
    // Display findings
    for (const [reason, files] of Object.entries(reasonGroups)) {
        console.log(`📋 ${reason}:`);
        console.log(`   Count: ${files.length} files`);
        
        // Show examples
        const examples = files.slice(0, 3);
        examples.forEach(file => {
            const relativePath = path.relative(brandDirsPath, file.path);
            console.log(`   📁 ${relativePath} (${file.size} bytes)`);
        });
        
        if (files.length > 3) {
            console.log(`   ... and ${files.length - 3} more files`);
        }
        console.log();
    }
    
    // Ask for confirmation
    console.log('🗑️  CLEANUP OPTIONS:');
    console.log('   [1] Remove ALL suspicious images (recommended)');
    console.log('   [2] Remove only placeholder/404 images');
    console.log('   [3] Create backup and remove all');
    console.log('   [4] Just show statistics (no removal)');
    console.log();
    
    // For now, just remove the most obvious duplicates
    const toRemove = filesToRemove.filter(file => 
        SUSPICIOUS_SIZES.includes(file.size) || file.size < MIN_VALID_SIZE
    );
    
    console.log(`🧹 Removing ${toRemove.length} obviously suspicious images...`);
    
    for (const file of toRemove) {
        try {
            await fs.unlink(file.path);
            totalRemoved++;
            const relativePath = path.relative(brandDirsPath, file.path);
            console.log(`🗑️  Removed: ${relativePath}`);
        } catch (error) {
            console.log(`❌ Failed to remove: ${file.path}`);
        }
    }
    
    totalPreserved = totalScanned - totalRemoved;
    
    console.log();
    console.log('✅ ══════════════ CLEANUP COMPLETED ══════════════');
    console.log(`🗑️  Removed: ${totalRemoved} suspicious images`);
    console.log(`✅ Preserved: ${totalPreserved} valid images`);
    console.log(`📊 Cleanup ratio: ${((totalRemoved / totalScanned) * 100).toFixed(1)}%`);
    console.log();
    
    // Show remaining size distribution
    console.log('📊 Remaining image size distribution:');
    const remainingSizes = new Map();
    
    async function countRemaining(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    await countRemaining(fullPath);
                } else if (item.isFile() && item.name.toLowerCase().endsWith('.jpg')) {
                    try {
                        const stats = await fs.stat(fullPath);
                        const sizeRange = getSizeRange(stats.size);
                        remainingSizes.set(sizeRange, (remainingSizes.get(sizeRange) || 0) + 1);
                    } catch (error) {
                        // Ignore
                    }
                }
            }
        } catch (error) {
            // Ignore
        }
    }
    
    await countRemaining(brandDirsPath);
    
    for (const [range, count] of Array.from(remainingSizes.entries()).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${range}: ${count} images`);
    }
}

function getSizeRange(size) {
    if (size < 10000) return 'Very small (<10KB)';
    if (size < 50000) return 'Small (10-50KB)';
    if (size < 100000) return 'Medium (50-100KB)';
    if (size < 500000) return 'Large (100-500KB)';
    if (size < 1000000) return 'Very large (500KB-1MB)';
    return 'Huge (>1MB)';
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  CLEANUP INTERRUPTED');
    console.log('💾 Partial cleanup completed.');
    process.exit(0);
});

// Start cleanup
cleanDuplicateImages().catch(error => {
    console.error('💥 Cleanup error:', error.message);
    process.exit(1);
});
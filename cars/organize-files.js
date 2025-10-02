import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileOrganizer {
    constructor() {
        this.carsDir = __dirname;
        this.brandDirectoriesDir = path.join(__dirname, 'brand_directories');
    }

    organizeFiles() {
        console.log('📂 Organizing car data files into brand directories...\n');

        // Check if brand directories exist
        if (!fs.existsSync(this.brandDirectoriesDir)) {
            console.log('❌ Brand directories folder does not exist. Please run create-brand-directories.js first.');
            return;
        }

        // Get all .txt files in the cars directory
        const txtFiles = fs.readdirSync(this.carsDir)
            .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md')
            .sort();

        console.log(`📋 Found ${txtFiles.length} files to organize:\n`);

        let movedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const txtFile of txtFiles) {
            try {
                // Remove .txt extension to get brand name
                const brandName = txtFile.replace('.txt', '');

                // Clean brand name for directory (same logic as create-brand-directories.js)
                const cleanBrandName = this.sanitizeDirectoryName(brandName);

                const brandDirPath = path.join(this.brandDirectoriesDir, cleanBrandName);
                const sourcePath = path.join(this.carsDir, txtFile);
                const destPath = path.join(brandDirPath, txtFile);

                // Check if brand directory exists
                if (!fs.existsSync(brandDirPath)) {
                    console.log(`⚠️  Directory not found for ${brandName}, skipping...`);
                    errorCount++;
                    continue;
                }

                // Check if file already exists in destination
                if (fs.existsSync(destPath)) {
                    console.log(`⏭️  File already exists: ${txtFile} in ${cleanBrandName}/`);
                    skippedCount++;
                    continue;
                }

                // Move the file
                fs.renameSync(sourcePath, destPath);
                console.log(`✅ Moved: ${txtFile} → ${cleanBrandName}/`);
                movedCount++;

            } catch (error) {
                console.log(`❌ Error moving ${txtFile}: ${error.message}`);
                errorCount++;
            }
        }

        console.log(`\n🎉 File organization completed!`);
        console.log(`📊 Summary:`);
        console.log(`   ✅ Moved: ${movedCount} files`);
        console.log(`   ⏭️  Skipped: ${skippedCount} files (already existed)`);
        console.log(`   ❌ Errors: ${errorCount} files`);
        console.log(`   📁 Total: ${txtFiles.length} files processed`);

        // Show final structure
        this.showFinalStructure();
    }

    sanitizeDirectoryName(name) {
        // Same logic as create-brand-directories.js
        return name
            .replace(/\s+/g, '_')           // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace special chars with underscores
            .replace(/_+/g, '_')            // Replace multiple underscores with single
            .replace(/^_+|_+$/g, '');       // Remove leading/trailing underscores
    }

    showFinalStructure() {
        console.log(`\n📂 Final Structure:`);
        console.log(`brand_directories/`);

        try {
            const directories = fs.readdirSync(this.brandDirectoriesDir)
                .filter(item => fs.statSync(path.join(this.brandDirectoriesDir, item)).isDirectory())
                .sort()
                .slice(0, 10); // Show first 10

            for (const dir of directories) {
                const dirPath = path.join(this.brandDirectoriesDir, dir);
                const files = fs.readdirSync(dirPath)
                    .filter(file => file.endsWith('.txt'));

                console.log(`  📁 ${dir}/`);
                if (files.length > 0) {
                    console.log(`    📄 ${files[0]}${files.length > 1 ? ` (+${files.length - 1} more)` : ''}`);
                } else {
                    console.log(`    📄 (empty)`);
                }
            }

            const totalDirs = fs.readdirSync(this.brandDirectoriesDir)
                .filter(item => fs.statSync(path.join(this.brandDirectoriesDir, item)).isDirectory()).length;

            if (totalDirs > 10) {
                console.log(`  ... and ${totalDirs - 10} more directories`);
            }

        } catch (error) {
            console.log(`❌ Error reading final structure: ${error.message}`);
        }
    }

    verifyOrganization() {
        console.log('\n🔍 Verifying file organization...\n');

        let totalFiles = 0;
        let organizedFiles = 0;
        let emptyDirs = 0;

        try {
            const directories = fs.readdirSync(this.brandDirectoriesDir)
                .filter(item => fs.statSync(path.join(this.brandDirectoriesDir, item)).isDirectory());

            for (const dir of directories) {
                const dirPath = path.join(this.brandDirectoriesDir, dir);
                const files = fs.readdirSync(dirPath)
                    .filter(file => file.endsWith('.txt'));

                totalFiles += files.length;
                if (files.length > 0) {
                    organizedFiles += files.length;
                } else {
                    emptyDirs++;
                }
            }

            console.log(`📊 Verification Results:`);
            console.log(`   📁 Total directories: ${directories.length}`);
            console.log(`   📄 Total files organized: ${organizedFiles}`);
            console.log(`   📂 Empty directories: ${emptyDirs}`);

            // Check if any .txt files remain in root
            const remainingTxtFiles = fs.readdirSync(this.carsDir)
                .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md');

            if (remainingTxtFiles.length > 0) {
                console.log(`⚠️  Warning: ${remainingTxtFiles.length} .txt files still in root directory:`);
                remainingTxtFiles.forEach(file => {
                    console.log(`     📄 ${file}`);
                });
            } else {
                console.log(`✅ All .txt files have been organized successfully!`);
            }

        } catch (error) {
            console.log(`❌ Error during verification: ${error.message}`);
        }
    }
}

// Main execution
function main() {
    const organizer = new FileOrganizer();

    try {
        organizer.organizeFiles();
        console.log('\n' + '='.repeat(50));
        organizer.verifyOrganization();
        console.log('\n🎉 File organization completed successfully!');

    } catch (error) {
        console.error('❌ Error during file organization:', error);
        process.exit(1);
    }
}

main();
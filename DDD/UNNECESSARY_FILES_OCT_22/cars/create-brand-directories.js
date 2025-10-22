import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrandDirectoriesCreator {
    constructor() {
        this.carsDir = __dirname;
        this.brandDirectoriesDir = path.join(__dirname, 'brand_directories');
    }

    createBrandDirectories() {
        console.log('🚗 Creating brand directories from car data files...\n');

        // Ensure the main brand directories folder exists
        if (!fs.existsSync(this.brandDirectoriesDir)) {
            fs.mkdirSync(this.brandDirectoriesDir, { recursive: true });
            console.log(`📁 Created main directory: ${this.brandDirectoriesDir}\n`);
        }

        // Get all .txt files
        const txtFiles = fs.readdirSync(this.carsDir)
            .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md')
            .sort();

        console.log(`📋 Found ${txtFiles.length} brand files to process:\n`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const txtFile of txtFiles) {
            // Remove .txt extension to get brand name
            const brandName = txtFile.replace('.txt', '');

            // Clean brand name for directory (replace spaces and special chars)
            const cleanBrandName = this.sanitizeDirectoryName(brandName);

            const brandDirPath = path.join(this.brandDirectoriesDir, cleanBrandName);

            try {
                if (!fs.existsSync(brandDirPath)) {
                    fs.mkdirSync(brandDirPath, { recursive: true });
                    console.log(`✅ Created: ${cleanBrandName}/ (from ${txtFile})`);
                    createdCount++;
                } else {
                    console.log(`⏭️  Skipped: ${cleanBrandName}/ (already exists)`);
                    skippedCount++;
                }
            } catch (error) {
                console.log(`❌ Error creating directory for ${brandName}: ${error.message}`);
            }
        }

        console.log(`\n🎉 Directory creation completed!`);
        console.log(`📊 Summary:`);
        console.log(`   ✅ Created: ${createdCount} directories`);
        console.log(`   ⏭️  Skipped: ${skippedCount} directories (already existed)`);
        console.log(`   📁 Total: ${txtFiles.length} brand files processed`);
        console.log(`\n📂 All brand directories are located in: ${this.brandDirectoriesDir}`);

        // List all created directories
        console.log(`\n📋 Created directories:`);
        const createdDirs = fs.readdirSync(this.brandDirectoriesDir)
            .filter(item => fs.statSync(path.join(this.brandDirectoriesDir, item)).isDirectory())
            .sort();

        createdDirs.forEach(dir => {
            console.log(`   📁 ${dir}/`);
        });
    }

    sanitizeDirectoryName(name) {
        // Replace spaces with underscores and remove/replace special characters
        return name
            .replace(/\s+/g, '_')           // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace special chars with underscores
            .replace(/_+/g, '_')            // Replace multiple underscores with single
            .replace(/^_+|_+$/g, '');       // Remove leading/trailing underscores
    }

    showStatistics() {
        console.log('\n📊 Brand Directory Statistics:\n');

        const txtFiles = fs.readdirSync(this.carsDir)
            .filter(file => file.endsWith('.txt') && file !== 'SCRAPER_README.md');

        console.log(`📄 Total brand files: ${txtFiles.length}`);

        if (fs.existsSync(this.brandDirectoriesDir)) {
            const directories = fs.readdirSync(this.brandDirectoriesDir)
                .filter(item => fs.statSync(path.join(this.brandDirectoriesDir, item)).isDirectory());

            console.log(`📁 Total brand directories: ${directories.length}`);

            // Show some examples
            console.log('\n📋 Sample brand directories:');
            directories.slice(0, 10).forEach(dir => {
                console.log(`   📁 ${dir}/`);
            });

            if (directories.length > 10) {
                console.log(`   ... and ${directories.length - 10} more`);
            }
        } else {
            console.log('❌ Brand directories folder does not exist yet');
        }
    }
}

// Main execution
function main() {
    const creator = new BrandDirectoriesCreator();

    try {
        creator.createBrandDirectories();
        console.log('\n' + '='.repeat(50));
        creator.showStatistics();
        console.log('\n🎉 Brand directories creation completed successfully!');

    } catch (error) {
        console.error('❌ Error during directory creation:', error);
        process.exit(1);
    }
}

main();

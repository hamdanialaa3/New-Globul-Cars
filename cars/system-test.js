import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemTester {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }

    log(type, message, details = '') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, type, message, details };
        this.testResults.details.push(logEntry);
        
        const icons = {
            'PASS': '✅',
            'FAIL': '❌', 
            'WARN': '⚠️',
            'INFO': 'ℹ️'
        };
        
        console.log(`${icons[type]} ${message}`);
        if (details) console.log(`   ${details}`);
        
        if (type === 'PASS') this.testResults.passed++;
        else if (type === 'FAIL') this.testResults.failed++;
        else if (type === 'WARN') this.testResults.warnings++;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async testNetworkConnectivity() {
        console.log(`\n🌐 NETWORK CONNECTIVITY TESTS`);
        console.log(`════════════════════════════════════════`);

        try {
            // Test basic internet
            const response = await axios.get('https://httpbin.org/ip', { timeout: 10000 });
            this.log('PASS', 'Internet connectivity', 'Basic internet access working');
        } catch (error) {
            this.log('FAIL', 'Internet connectivity', `No internet access: ${error.message}`);
            return false;
        }

        try {
            // Test NetCarShow access
            const response = await axios.get(this.baseUrl, { 
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            this.log('PASS', 'NetCarShow.com access', `HTTP ${response.status}`);
        } catch (error) {
            this.log('FAIL', 'NetCarShow.com access', `Cannot reach NetCarShow: ${error.message}`);
            return false;
        }

        return true;
    }

    testDirectoryStructure() {
        console.log(`\n📁 DIRECTORY STRUCTURE TESTS`);
        console.log(`════════════════════════════════════════`);

        // Test main directories folder
        if (!fs.existsSync(this.brandDirectoriesPath)) {
            this.log('FAIL', 'Brand directories folder', `Missing: ${this.brandDirectoriesPath}`);
            return false;
        }
        this.log('PASS', 'Brand directories folder', 'Exists and accessible');

        // Count and validate brand directories
        try {
            const brandDirs = fs.readdirSync(this.brandDirectoriesPath)
                .filter(item => fs.statSync(path.join(this.brandDirectoriesPath, item)).isDirectory());

            if (brandDirs.length === 0) {
                this.log('FAIL', 'Brand subdirectories', 'No brand directories found');
                return false;
            } else if (brandDirs.length < 50) {
                this.log('WARN', 'Brand subdirectories', `Only ${brandDirs.length} found (expected 150+)`);
            } else {
                this.log('PASS', 'Brand subdirectories', `${brandDirs.length} directories found`);
            }

            // Test write permissions
            const testDir = brandDirs[0];
            const testFile = path.join(this.brandDirectoriesPath, testDir, 'test_write.tmp');
            
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            this.log('PASS', 'Write permissions', 'Can write to brand directories');

            // Show sample directories
            console.log(`   📋 Sample directories: ${brandDirs.slice(0, 10).join(', ')}`);

        } catch (error) {
            this.log('FAIL', 'Directory operations', error.message);
            return false;
        }

        return true;
    }

    testNodeDependencies() {
        console.log(`\n📦 NODE.JS DEPENDENCIES TESTS`);
        console.log(`════════════════════════════════════════`);

        // Test Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion >= 18) {
            this.log('PASS', 'Node.js version', `${nodeVersion} (compatible)`);
        } else {
            this.log('WARN', 'Node.js version', `${nodeVersion} (recommend 18+)`);
        }

        // Test axios
        try {
            require('axios');
            this.log('PASS', 'axios dependency', 'Module loaded successfully');
        } catch (error) {
            this.log('FAIL', 'axios dependency', 'Not installed or corrupted');
        }

        // Test cheerio
        try {
            require('cheerio');
            this.log('PASS', 'cheerio dependency', 'Module loaded successfully');
        } catch (error) {
            this.log('FAIL', 'cheerio dependency', 'Not installed or corrupted');
        }

        return true;
    }

    async testScraperFunctions() {
        console.log(`\n🔧 SCRAPER FUNCTIONALITY TESTS`);
        console.log(`════════════════════════════════════════`);

        try {
            // Test brand discovery (sample)
            console.log(`   🔍 Testing brand discovery...`);
            const response = await axios.get(`${this.baseUrl}/`, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            
            // Look for brand links
            let brandCount = 0;
            $('#Makes, .makes, [class*="brand"]').find('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/)) {
                    brandCount++;
                }
            });

            if (brandCount > 0) {
                this.log('PASS', 'Brand discovery', `Found ${brandCount} potential brand links`);
            } else {
                this.log('WARN', 'Brand discovery', 'No brand links found in expected format');
            }

            // Test image detection
            const imageCount = $('img').length;
            this.log('PASS', 'Image detection', `${imageCount} images found on homepage`);

        } catch (error) {
            this.log('FAIL', 'Scraper functionality', `Error: ${error.message}`);
        }
    }

    async testSampleImageDownload() {
        console.log(`\n📸 SAMPLE IMAGE DOWNLOAD TEST`);
        console.log(`════════════════════════════════════════`);

        try {
            // Test with a small sample image
            const testImageUrl = 'https://httpbin.org/image/jpeg';
            const testDir = path.join(__dirname, 'test_download');
            const testFile = path.join(testDir, 'test_image.jpg');

            // Create test directory
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }

            console.log(`   🔄 Downloading test image...`);
            const response = await axios.get(testImageUrl, {
                responseType: 'stream',
                timeout: 10000
            });

            const writer = fs.createWriteStream(testFile);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(testFile);
            if (stats.size > 0) {
                this.log('PASS', 'Image download', `Downloaded ${Math.round(stats.size/1024)}KB test image`);
                
                // Cleanup
                fs.unlinkSync(testFile);
                fs.rmdirSync(testDir);
                
            } else {
                this.log('FAIL', 'Image download', 'Downloaded file is empty');
            }

        } catch (error) {
            this.log('FAIL', 'Image download', `Download failed: ${error.message}`);
        }
    }

    testSystemResources() {
        console.log(`\n💻 SYSTEM RESOURCES TEST`);
        console.log(`════════════════════════════════════════`);

        // Memory usage
        const memUsage = process.memoryUsage();
        const totalMemMB = Math.round(memUsage.rss / 1024 / 1024);
        
        if (totalMemMB < 100) {
            this.log('PASS', 'Memory usage', `${totalMemMB}MB (efficient)`);
        } else {
            this.log('WARN', 'Memory usage', `${totalMemMB}MB (may need optimization)`);
        }

        // Platform info
        this.log('INFO', 'Platform', `${process.platform} ${process.arch}`);
        this.log('INFO', 'Node.js version', process.version);
    }

    displaySummary() {
        console.log(`\n📊 TEST RESULTS SUMMARY`);
        console.log(`════════════════════════════════════════`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
        console.log(`📋 Total tests: ${this.testResults.details.length}`);

        if (this.testResults.failed === 0) {
            console.log(`\n🎉 ALL CRITICAL TESTS PASSED!`);
            console.log(`✅ System is ready for comprehensive image scraping`);
            console.log(`🚀 You can now run: Run-Advanced-Image-Scraper.bat`);
        } else {
            console.log(`\n⚠️  CRITICAL ISSUES DETECTED`);
            console.log(`❌ Please fix the failed tests before running the scraper`);
            
            console.log(`\n📋 Failed tests:`);
            this.testResults.details
                .filter(test => test.type === 'FAIL')
                .forEach(test => console.log(`   • ${test.message}: ${test.details}`));
        }

        if (this.testResults.warnings > 0) {
            console.log(`\n⚠️  Warnings (non-critical):`);
            this.testResults.details
                .filter(test => test.type === 'WARN')
                .forEach(test => console.log(`   • ${test.message}: ${test.details}`));
        }
    }

    async runAllTests() {
        console.log(`🧪 NetCarShow Image Scraper - System Test Suite`);
        console.log(`═══════════════════════════════════════════════════════════════`);

        const startTime = Date.now();

        // Run all tests
        await this.testNodeDependencies();
        await this.testDirectoryStructure();
        await this.testNetworkConnectivity();
        await this.testScraperFunctions();
        await this.testSampleImageDownload();
        await this.testSystemResources();

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        console.log(`\n⏱️  Tests completed in ${duration} seconds`);
        this.displaySummary();

        // Save test report
        const reportPath = path.join(__dirname, 'system-test-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            summary: {
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                warnings: this.testResults.warnings
            },
            details: this.testResults.details,
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memory: process.memoryUsage()
            }
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved: system-test-report.json`);
    }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SystemTester();
    tester.runAllTests().catch(error => {
        console.error(`❌ Test suite failed: ${error.message}`);
        process.exit(1);
    });
}

export default SystemTester;
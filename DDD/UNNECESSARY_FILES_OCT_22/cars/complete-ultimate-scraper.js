// تحديث UltimateAntiBlockScraper مع دمج وحدة استخراج الصور

import UltimateAntiBlockScraper from './ultimate-anti-block-scraper.js';
import ImageExtractionModule from './complete-image-extraction.js';

class CompleteUltimateProtectedScraper extends UltimateAntiBlockScraper {
    constructor() {
        super();
        this.imageExtractor = new ImageExtractionModule();
    }

    // النسخة الكاملة من بدء العملية مع استخراج الصور
    async startCompleteUltimateProtectedScraping() {
        console.log(`\n🚀 STARTING COMPLETE ULTIMATE ANTI-BLOCK PROTECTED SCRAPING`);
        console.log(`🛡️  Maximum protection enabled against all blocking methods`);
        console.log(`📸 Complete image extraction from NetCarShow.com\n`);
        
        try {
            // التهيئة الأولية
            const initialized = await this.initializeUltimateProtection();
            if (!initialized) {
                console.log(`❌ Failed to initialize protection systems`);
                return;
            }

            // اكتشاف العلامات التجارية مع الحماية
            const brands = await this.discoverBrandsWithUltimateProtection();
            if (brands.length === 0) {
                console.log(`❌ No brands discovered with ultimate protection`);
                return;
            }

            console.log(`\n🎯 Will process ${brands.length} brands with ultimate protection`);
            console.log(`📊 Progress statistics will be displayed every 15 minutes`);
            
            // عرض الإحصائيات دورياً
            const statsInterval = setInterval(() => {
                this.displayUltimateProtectionStats();
            }, 900000); // كل 15 دقيقة

            let totalImagesDownloaded = 0;
            let successfulBrands = 0;

            // معالجة جميع العلامات التجارية
            for (let i = 0; i < brands.length; i++) {
                const brand = brands[i];
                console.log(`\n🏭 [${i + 1}/${brands.length}] Starting ${brand.displayName} with ultimate protection...`);
                
                try {
                    const brandImagesDownloaded = await this.imageExtractor.processBrandWithUltimateProtection(this, brand);
                    totalImagesDownloaded += brandImagesDownloaded;
                    
                    if (brandImagesDownloaded > 0) {
                        successfulBrands++;
                    }

                    // تأخير بين العلامات التجارية مع محاكاة السلوك البشري
                    const brandDelay = this.calculateIntelligentDelay();
                    console.log(`⏳ Inter-brand delay: ${Math.round(brandDelay/1000)}s`);
                    await this.delay(brandDelay);

                    // تدوير VPN كل 20 علامة تجارية
                    if ((i + 1) % 20 === 0) {
                        console.log(`🔄 Scheduled VPN rotation after ${i + 1} brands...`);
                        await this.rotateVpnConnection();
                    }

                    // عرض تقرير تقدم كل 10 علامات
                    if ((i + 1) % 10 === 0) {
                        console.log(`\n📊 PROGRESS REPORT: ${i + 1}/${brands.length} brands processed`);
                        console.log(`   ✅ Successful brands: ${successfulBrands}`);
                        console.log(`   📸 Total images downloaded: ${totalImagesDownloaded}`);
                        console.log(`   🛡️  Protection effectiveness: ${((this.stats.requests.successful / this.stats.requests.total) * 100).toFixed(1)}%`);
                    }

                } catch (error) {
                    console.error(`❌ Critical error processing ${brand.displayName}: ${error.message}`);
                    
                    // في حالة خطأ حرج، تفعيل وضع الطوارئ
                    if (this.stats.requests.failed > this.stats.requests.successful) {
                        await this.activateEmergencyMode();
                    }
                    continue;
                }
            }

            clearInterval(statsInterval);

            // النتائج النهائية الشاملة
            console.log(`\n🎉 ══════════════ COMPLETE ULTIMATE PROTECTED SCRAPING COMPLETED! ══════════════`);
            console.log(`📈 FINAL RESULTS:`);
            console.log(`   🏭 Brands processed: ${this.stats.brands.processed}/${brands.length}`);
            console.log(`   ✅ Successful brands: ${successfulBrands}`);
            console.log(`   🚗 Models processed: ${this.stats.models.processed}`);
            console.log(`   📸 Total images downloaded: ${totalImagesDownloaded}`);
            console.log(`   💾 Total data downloaded: ${Math.round(this.stats.performance.totalDataSize / (1024 * 1024))} MB`);
            console.log(`   ⏱️  Total runtime: ${Math.round((Date.now() - this.stats.session.startTime) / 1000 / 60)} minutes`);
            console.log(`   🛡️  Protection effectiveness: ${((this.stats.requests.successful / this.stats.requests.total) * 100).toFixed(1)}%`);
            console.log(`══════════════════════════════════════════════════════════════════════════════════`);
            
            this.displayUltimateProtectionStats();

            // إنشاء تقرير نهائي
            await this.generateFinalReport(totalImagesDownloaded, successfulBrands);

        } catch (error) {
            console.error(`❌ Critical error in complete ultimate protected scraping: ${error.message}`);
            console.error(`Stack trace:`, error.stack);
            this.displayUltimateProtectionStats();
        } finally {
            // تنظيف الموارد
            if (this.isVpnConnected) {
                console.log(`🔓 Disconnecting VPN...`);
                await this.disconnectCurrentVpn();
            }
            
            console.log(`\n🧹 Resources cleaned up. Session ended safely.`);
        }
    }

    // إنشاء تقرير نهائي شامل
    async generateFinalReport(totalImages, successfulBrands) {
        try {
            const reportPath = path.join(__dirname, `scraping_report_${Date.now()}.json`);
            
            const report = {
                sessionInfo: {
                    startTime: new Date(this.stats.session.startTime).toISOString(),
                    endTime: new Date().toISOString(),
                    totalRuntime: Date.now() - this.stats.session.startTime,
                    scriptVersion: '4.0 Ultimate'
                },
                results: {
                    totalBrandsProcessed: this.stats.brands.processed,
                    successfulBrands: successfulBrands,
                    totalModelsProcessed: this.stats.models.processed,
                    totalImagesDownloaded: totalImages,
                    totalDataDownloaded: this.stats.performance.totalDataSize,
                    averageImageSize: this.stats.images.downloaded > 0 ? 
                        Math.round(this.stats.performance.totalDataSize / this.stats.images.downloaded) : 0
                },
                protection: {
                    totalBlocks: this.stats.session.totalBlocks,
                    emergencyModeActivations: this.stats.session.emergencyModeActivations,
                    vpnChanges: this.stats.session.vpnChanges,
                    proxyChanges: this.stats.session.proxyChanges,
                    userAgentChanges: this.stats.session.userAgentChanges,
                    protectionEffectiveness: ((this.stats.requests.successful / this.stats.requests.total) * 100).toFixed(2)
                },
                performance: {
                    totalRequests: this.stats.requests.total,
                    successfulRequests: this.stats.requests.successful,
                    failedRequests: this.stats.requests.failed,
                    averageResponseTime: Math.round(this.stats.performance.avgResponseTime),
                    requestsPerHour: Math.round(this.stats.requests.total / ((Date.now() - this.stats.session.startTime) / 3600000))
                },
                events: {
                    blockingEvents: this.stats.protection.blockingEvents.slice(-10), // آخر 10 أحداث
                    vpnConnections: this.stats.protection.vpnConnections.slice(-5), // آخر 5 اتصالات
                    emergencyActivations: this.stats.protection.emergencyActivations
                }
            };

            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Final report generated: ${reportPath}`);

        } catch (error) {
            console.error(`❌ Failed to generate final report: ${error.message}`);
        }
    }
}

// تشغيل النظام الكامل
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(`\n🛡️  INITIALIZING COMPLETE ULTIMATE ANTI-BLOCK SCRAPER v4.0`);
    console.log(`🔧 Loading all protection modules...`);
    
    const completeScraper = new CompleteUltimateProtectedScraper();
    
    // معالجة إشارات النظام المحسنة
    const gracefulShutdown = async (signal) => {
        console.log(`\n\n⏹️  COMPLETE SCRAPER INTERRUPTED BY ${signal}`);
        console.log(`💾 Saving current progress...`);
        
        completeScraper.displayUltimateProtectionStats();
        
        if (completeScraper.isVpnConnected) {
            console.log(`🔓 Emergency VPN disconnection...`);
            await completeScraper.disconnectCurrentVpn();
        }
        
        await completeScraper.generateFinalReport(
            completeScraper.stats.images.downloaded,
            completeScraper.stats.brands.successful
        );
        
        console.log(`\n💾 All data preserved. Session ended safely.`);
        process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    process.on('uncaughtException', async (error) => {
        console.error(`\n❌ CRITICAL UNCAUGHT EXCEPTION: ${error.message}`);
        console.error(`Stack trace:`, error.stack);
        
        completeScraper.displayUltimateProtectionStats();
        
        if (completeScraper.isVpnConnected) {
            await completeScraper.disconnectCurrentVpn();
        }
        
        await completeScraper.generateFinalReport(
            completeScraper.stats.images.downloaded,
            completeScraper.stats.brands.successful
        );
        
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        console.error(`\n❌ UNHANDLED PROMISE REJECTION at:`, promise, `reason:`, reason);
        
        // لا نخرج من البرنامج، بل نسجل الخطأ ونتابع
        completeScraper.stats.requests.failed++;
    });

    // بدء النظام الكامل
    completeScraper.startCompleteUltimateProtectedScraping().catch(async error => {
        console.error(`❌ Complete ultimate scraper failed to start: ${error.message}`);
        console.error(`Stack trace:`, error.stack);
        
        completeScraper.displayUltimateProtectionStats();
        
        if (completeScraper.isVpnConnected) {
            await completeScraper.disconnectCurrentVpn();
        }
        
        await completeScraper.generateFinalReport(
            completeScraper.stats.images.downloaded,
            completeScraper.stats.brands.successful
        );
        
        process.exit(1);
    });
}

export default CompleteUltimateProtectedScraper;
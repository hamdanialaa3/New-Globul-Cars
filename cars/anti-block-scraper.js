import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AntiBlockNetCarShowScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.downloadedUrls = new Set();
        this.failedUrls = new Set();
        this.currentProxyIndex = 0;
        this.currentUserAgentIndex = 0;
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.isVpnConnected = false;
        
        // نظام البروكسي المتقدم
        this.proxyList = [
            // Free proxies - يجب تحديثها دورياً
            'http://proxy1.example.com:8080',
            'http://proxy2.example.com:8080',
            // يمكن إضافة المزيد من البروكسيات المجانية أو المدفوعة
        ];

        // قائمة User Agents متنوعة ومحدثة
        this.userAgents = [
            // Chrome Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            
            // Chrome Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            
            // Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0',
            
            // Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            
            // Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            
            // Mobile Chrome
            'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        ];

        // قائمة VPN providers
        this.vpnProviders = [
            'protonvpn',
            'nordvpn', 
            'expressvpn',
            'surfshark',
            'windscribe'
        ];

        // إعدادات الحماية من الحظر
        this.antiBlockSettings = {
            minDelay: 3000,        // 3 ثوانٍ كحد أدنى
            maxDelay: 12000,       // 12 ثانية كحد أقصى
            proxyRotationInterval: 10,  // تغيير البروكسي كل 10 طلبات
            userAgentRotationInterval: 5, // تغيير User Agent كل 5 طلبات
            maxRequestsPerHour: 300,    // حد أقصى 300 طلب في الساعة
            vpnRotationInterval: 100,   // تغيير VPN كل 100 طلب
            useRandomHeaders: true,     // استخدام headers عشوائية
            simulateHumanBehavior: true // محاكاة السلوك البشري
        };

        // إحصائيات متقدمة
        this.stats = {
            session: {
                startTime: Date.now(),
                currentBrand: '',
                currentModel: '',
                currentOperation: 'التهيئة',
                blockedAttempts: 0,
                proxyChanges: 0,
                vpnChanges: 0,
                userAgentChanges: 0
            },
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                blocked: 0,
                retried: 0
            },
            brands: { total: 0, processed: 0, successful: 0, failed: 0 },
            models: { total: 0, processed: 0, successful: 0, failed: 0 },
            images: { found: 0, downloaded: 0, skipped: 0, failed: 0, duplicate: 0 },
            performance: {
                avgResponseTime: 0,
                totalDataSize: 0,
                avgImageSize: 0,
                requestsPerHour: 0
            }
        };

        console.log(`\n🛡️  ═══════════════════════════════════════════════════════════════`);
        console.log(`🚗 NetCarShow Anti-Block Advanced Scraper v3.0`);
        console.log(`🛡️  ═══════════════════════════════════════════════════════════════`);
        console.log(`🔒 Multi-layer protection against IP/MAC blocking`);
        console.log(`🔄 Proxy rotation, VPN integration, smart delays`);
        console.log(`🎭 Advanced user agent and header randomization`);
        console.log(`🧠 Human behavior simulation`);
        console.log(`🛡️  ═══════════════════════════════════════════════════════════════\n`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // حساب تأخير ذكي يحاكي السلوك البشري
    calculateSmartDelay() {
        const baseDelay = Math.random() * (this.antiBlockSettings.maxDelay - this.antiBlockSettings.minDelay) + this.antiBlockSettings.minDelay;
        
        // إضافة تأخير إضافي بناءً على عدد الطلبات
        const requestFactor = Math.min(this.requestCount / 100, 2); // زيادة تدريجية
        const adaptiveDelay = baseDelay * (1 + requestFactor);
        
        // محاكاة فترات راحة عشوائية (مثل المستخدم الحقيقي)
        if (Math.random() < 0.1) { // 10% احتمال راحة طويلة
            return adaptiveDelay + Math.random() * 30000; // راحة إضافية حتى 30 ثانية
        }
        
        return Math.round(adaptiveDelay);
    }

    // الحصول على البروكسي التالي
    getNextProxy() {
        if (this.proxyList.length === 0) return null;
        
        if (this.requestCount % this.antiBlockSettings.proxyRotationInterval === 0) {
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
            this.stats.session.proxyChanges++;
            console.log(`🔄 Proxy rotation: Using proxy ${this.currentProxyIndex + 1}/${this.proxyList.length}`);
        }
        
        return this.proxyList[this.currentProxyIndex];
    }

    // الحصول على User Agent التالي
    getNextUserAgent() {
        if (this.requestCount % this.antiBlockSettings.userAgentRotationInterval === 0) {
            this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % this.userAgents.length;
            this.stats.session.userAgentChanges++;
            console.log(`🎭 User Agent rotation: ${this.currentUserAgentIndex + 1}/${this.userAgents.length}`);
        }
        
        return this.userAgents[this.currentUserAgentIndex];
    }

    // توليد headers عشوائية لمحاكاة المتصفحات المختلفة
    generateRandomHeaders() {
        const acceptLanguages = [
            'en-US,en;q=0.9',
            'en-US,en;q=0.9,ar;q=0.8',
            'en-GB,en;q=0.9,en-US;q=0.8',
            'en-US,en;q=0.8,ar;q=0.7',
            'en,ar;q=0.9,fr;q=0.8'
        ];

        const acceptEncodings = [
            'gzip, deflate, br',
            'gzip, deflate',
            'br, gzip, deflate'
        ];

        const connections = ['keep-alive', 'close'];
        const cacheControls = ['no-cache', 'max-age=0', 'no-store'];

        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
            'Accept-Encoding': acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)],
            'Cache-Control': cacheControls[Math.floor(Math.random() * cacheControls.length)],
            'Connection': connections[Math.floor(Math.random() * connections.length)],
            'DNT': Math.random() > 0.5 ? '1' : '0',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': Math.random() > 0.5 ? 'none' : 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    // فحص تواجد VPN providers
    async checkAvailableVpnProviders() {
        const availableProviders = [];
        
        for (const provider of this.vpnProviders) {
            try {
                await execAsync(`where ${provider}`, { timeout: 5000 });
                availableProviders.push(provider);
                console.log(`✅ VPN Provider found: ${provider}`);
            } catch (error) {
                console.log(`⚠️  VPN Provider not found: ${provider}`);
            }
        }
        
        return availableProviders;
    }

    // الاتصال بـ VPN
    async connectToVpn(provider = 'protonvpn') {
        try {
            console.log(`🔐 Attempting to connect to ${provider}...`);
            
            let connectCommand;
            switch (provider) {
                case 'protonvpn':
                    connectCommand = 'protonvpn connect --fastest';
                    break;
                case 'nordvpn':
                    connectCommand = 'nordvpn connect';
                    break;
                case 'expressvpn':
                    connectCommand = 'expressvpn connect smart';
                    break;
                case 'windscribe':
                    connectCommand = 'windscribe connect';
                    break;
                default:
                    throw new Error(`Unsupported VPN provider: ${provider}`);
            }

            const { stdout, stderr } = await execAsync(connectCommand, { timeout: 30000 });
            
            if (stdout.toLowerCase().includes('connect') || stdout.toLowerCase().includes('success')) {
                this.isVpnConnected = true;
                this.stats.session.vpnChanges++;
                console.log(`✅ Successfully connected to ${provider}`);
                
                // تأخير للسماح للاتصال بالاستقرار
                await this.delay(5000);
                return true;
            } else {
                throw new Error(`VPN connection failed: ${stderr}`);
            }

        } catch (error) {
            console.log(`❌ VPN connection failed: ${error.message}`);
            return false;
        }
    }

    // قطع الاتصال من VPN
    async disconnectVpn(provider = 'protonvpn') {
        try {
            let disconnectCommand;
            switch (provider) {
                case 'protonvpn':
                    disconnectCommand = 'protonvpn disconnect';
                    break;
                case 'nordvpn':
                    disconnectCommand = 'nordvpn disconnect';
                    break;
                case 'expressvpn':
                    disconnectCommand = 'expressvpn disconnect';
                    break;
                case 'windscribe':
                    disconnectCommand = 'windscribe disconnect';
                    break;
                default:
                    throw new Error(`Unsupported VPN provider: ${provider}`);
            }

            await execAsync(disconnectCommand, { timeout: 10000 });
            this.isVpnConnected = false;
            console.log(`🔓 Disconnected from ${provider}`);

        } catch (error) {
            console.log(`⚠️  VPN disconnection warning: ${error.message}`);
        }
    }

    // تدوير VPN (قطع واتصال بخادم جديد)
    async rotateVpn() {
        const availableProviders = await this.checkAvailableVpnProviders();
        if (availableProviders.length === 0) {
            console.log(`⚠️  No VPN providers available for rotation`);
            return false;
        }

        const randomProvider = availableProviders[Math.floor(Math.random() * availableProviders.length)];
        
        if (this.isVpnConnected) {
            await this.disconnectVpn();
            await this.delay(3000); // انتظار قليل قبل الاتصال الجديد
        }

        return await this.connectToVpn(randomProvider);
    }

    // كشف الحظر من خلال تحليل الاستجابة
    detectBlocking(response, responseText = '') {
        const blockingSignals = [
            // HTTP status codes
            response.status === 403,
            response.status === 429,
            response.status === 503,
            
            // Response headers
            response.headers['x-rate-limit-remaining'] === '0',
            response.headers['retry-after'],
            
            // Response content (common blocking pages)
            responseText.toLowerCase().includes('blocked'),
            responseText.toLowerCase().includes('rate limit'),
            responseText.toLowerCase().includes('too many requests'),
            responseText.toLowerCase().includes('access denied'),
            responseText.toLowerCase().includes('cloudflare'),
            responseText.includes('captcha'),
            
            // Suspicious redirects
            response.status >= 300 && response.status < 400 && 
            !response.headers.location?.includes('netcarshow.com')
        ];

        return blockingSignals.some(signal => signal);
    }

    // طلب HTTP محسن مع حماية من الحظر
    async makeProtectedRequest(url, options = {}) {
        const maxRetries = 8;
        const maxBlockingRetries = 3;
        let blockingRetries = 0;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.requestCount++;
                this.stats.requests.total++;
                const startTime = Date.now();

                // تطبيق تأخير ذكي
                const smartDelay = this.calculateSmartDelay();
                const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                
                if (timeSinceLastRequest < smartDelay) {
                    const waitTime = smartDelay - timeSinceLastRequest;
                    console.log(`⏳ Smart delay: ${Math.round(waitTime/1000)}s`);
                    await this.delay(waitTime);
                }

                // دوران البروكسي والـ User Agent
                const currentProxy = this.getNextProxy();
                const currentUserAgent = this.getNextUserAgent();

                // تكوين الطلب
                const config = {
                    timeout: 45000,
                    headers: {
                        'User-Agent': currentUserAgent,
                        ...(this.antiBlockSettings.useRandomHeaders ? this.generateRandomHeaders() : {}),
                        'Referer': this.baseUrl + '/',
                        ...options.headers
                    },
                    ...options
                };

                // إضافة البروكسي إذا كان متاحاً
                if (currentProxy && !options.skipProxy) {
                    try {
                        const proxyUrl = new URL(currentProxy);
                        config.proxy = {
                            protocol: proxyUrl.protocol.replace(':', ''),
                            host: proxyUrl.hostname,
                            port: parseInt(proxyUrl.port),
                            auth: proxyUrl.username && proxyUrl.password ? {
                                username: proxyUrl.username,
                                password: proxyUrl.password
                            } : undefined
                        };
                    } catch (proxyError) {
                        console.log(`⚠️  Invalid proxy format: ${currentProxy}`);
                    }
                }

                // تنفيذ الطلب
                const response = await axios.get(url, config);
                const responseTime = Date.now() - startTime;
                this.lastRequestTime = Date.now();

                // فحص الحظر
                const isBlocked = this.detectBlocking(response, response.data);
                
                if (isBlocked) {
                    this.stats.requests.blocked++;
                    blockingRetries++;
                    
                    console.log(`🚫 Blocking detected (attempt ${blockingRetries}/${maxBlockingRetries})`);
                    
                    if (blockingRetries >= maxBlockingRetries) {
                        console.log(`🔄 Implementing anti-blocking measures...`);
                        
                        // تدوير VPN كإجراء قوي ضد الحظر
                        if (this.requestCount % this.antiBlockSettings.vpnRotationInterval === 0) {
                            await this.rotateVpn();
                        }
                        
                        // تأخير أطول بعد الحظر
                        const blockingDelay = 60000 + Math.random() * 120000; // 1-3 دقائق
                        console.log(`⏰ Extended delay after blocking: ${Math.round(blockingDelay/1000)}s`);
                        await this.delay(blockingDelay);
                        
                        blockingRetries = 0; // إعادة تعيين العداد
                    }
                    
                    continue; // إعادة المحاولة
                }

                // نجح الطلب
                this.stats.requests.successful++;
                this.stats.performance.avgResponseTime = 
                    (this.stats.performance.avgResponseTime + responseTime) / 2;

                console.log(`✅ Request successful: ${url.substring(0, 60)}... (${responseTime}ms)`);
                return response;

            } catch (error) {
                console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
                this.stats.requests.failed++;

                if (attempt === maxRetries) {
                    this.stats.requests.retried++;
                    throw error;
                }

                // تأخير متزايد مع عشوائية
                const retryDelay = 2000 * Math.pow(2, attempt - 1) + Math.random() * 3000;
                console.log(`⏳ Retry delay: ${Math.round(retryDelay/1000)}s`);
                await this.delay(retryDelay);
            }
        }
    }

    // باقي الدوال (مثل اكتشاف العلامات التجارية واستخراج الصور) تستخدم makeProtectedRequest
    // بدلاً من الطلبات العادية...

    async getAllBrandsProtected() {
        try {
            console.log(`\n🔍 Protected brand discovery...`);
            this.stats.session.currentOperation = 'Protected Brand Discovery';

            const response = await this.makeProtectedRequest(`${this.baseUrl}/`);
            const $ = cheerio.load(response.data);
            
            const brands = [];
            
            $('#Makes, .makes, [class*="brand"]').find('a[href]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                const text = $link.text().trim();

                if (href && href.match(/^\/[a-zA-Z][a-zA-Z0-9_-]*\/$/) && text) {
                    const brandName = this.extractBrandName(href);
                    const brandDirectory = this.findBrandDirectory(brandName);
                    
                    if (brandDirectory) {
                        brands.push({
                            name: brandName,
                            displayName: text,
                            url: `${this.baseUrl}${href}`,
                            directory: brandDirectory
                        });
                    }
                }
            });

            this.stats.brands.total = brands.length;
            console.log(`✅ Protected discovery found ${brands.length} valid brands`);
            
            return brands;

        } catch (error) {
            console.error(`❌ Protected brand discovery failed: ${error.message}`);
            return [];
        }
    }

    // عرض إحصائيات الحماية من الحظر
    displayAntiBlockStats() {
        const runtime = Date.now() - this.stats.session.startTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`\n🛡️  ═══════════════ ANTI-BLOCK PROTECTION STATS ═══════════════`);
        console.log(`⏱️  Runtime: ${hours}h ${minutes}m`);
        console.log(`🔄 Current Operation: ${this.stats.session.currentOperation}`);
        console.log(`\n🌐 REQUEST STATISTICS:`);
        console.log(`   Total Requests: ${this.stats.requests.total}`);
        console.log(`   Successful: ${this.stats.requests.successful}`);
        console.log(`   Failed: ${this.stats.requests.failed}`);
        console.log(`   Blocked: ${this.stats.requests.blocked}`);
        console.log(`   Retried: ${this.stats.requests.retried}`);
        console.log(`\n🛡️  PROTECTION MEASURES:`);
        console.log(`   Proxy Changes: ${this.stats.session.proxyChanges}`);
        console.log(`   VPN Changes: ${this.stats.session.vpnChanges}`);
        console.log(`   User Agent Changes: ${this.stats.session.userAgentChanges}`);
        console.log(`   VPN Status: ${this.isVpnConnected ? '🔐 Connected' : '🔓 Disconnected'}`);
        console.log(`\n⚡ PERFORMANCE:`);
        console.log(`   Avg Response Time: ${Math.round(this.stats.performance.avgResponseTime)}ms`);
        console.log(`   Requests/Hour: ${Math.round(this.stats.requests.total / (runtime / 3600000))}`);
        console.log(`═══════════════════════════════════════════════════════════════`);
    }

    // نسخ جميع الدوال الأخرى من النظام الأساسي...
    extractBrandName(url) {
        const match = url.match(/\/([a-zA-Z][a-zA-Z0-9_-]*)\//);
        return match ? match[1].toLowerCase().replace(/-/g, '_') : 'unknown';
    }

    findBrandDirectory(brandName) {
        try {
            if (!fs.existsSync(this.brandDirectoriesPath)) {
                return null;
            }

            const availableDirs = fs.readdirSync(this.brandDirectoriesPath);
            const normalizedBrandName = brandName.toLowerCase().replace(/[-_\s]/g, '');

            const matchingStrategies = [
                (dir) => dir.toLowerCase().replace(/[-_\s]/g, '') === normalizedBrandName,
                (dir) => normalizedBrandName.includes(dir.toLowerCase().replace(/[-_\s]/g, '')) && dir.length > 2,
                (dir) => dir.toLowerCase().replace(/[-_\s]/g, '').includes(normalizedBrandName) && normalizedBrandName.length > 2,
            ];

            for (const strategy of matchingStrategies) {
                const matchedDir = availableDirs.find(strategy);
                if (matchedDir) {
                    return path.join(this.brandDirectoriesPath, matchedDir);
                }
            }

            return null;

        } catch (error) {
            console.error(`❌ Error finding directory for ${brandName}: ${error.message}`);
            return null;
        }
    }

    // بدء العملية مع الحماية الكاملة
    async startProtectedScraping() {
        console.log(`\n🚀 Starting Anti-Block Protected NetCarShow Scraping...`);
        console.log(`🛡️  Full protection enabled against IP/MAC blocking`);
        
        try {
            // محاولة الاتصال بـ VPN في البداية
            const availableVpnProviders = await this.checkAvailableVpnProviders();
            if (availableVpnProviders.length > 0) {
                await this.connectToVpn(availableVpnProviders[0]);
            } else {
                console.log(`⚠️  No VPN providers found. Continuing with other protection measures.`);
            }

            // اكتشاف العلامات التجارية بحماية
            const brands = await this.getAllBrandsProtected();
            if (brands.length === 0) {
                console.log(`❌ No brands discovered with protection`);
                return;
            }

            console.log(`\n🎯 Will process ${brands.length} brands with full protection`);
            
            // عرض الإحصائيات كل 15 دقيقة
            const statsInterval = setInterval(() => {
                this.displayAntiBlockStats();
            }, 900000);

            // معالجة العلامات التجارية (يجب تنفيذ باقي الدوال...)
            // هنا نضع باقي منطق معالجة العلامات التجارية والصور

            clearInterval(statsInterval);

            // النتائج النهائية
            console.log(`\n🎉 ═════════════ PROTECTED SCRAPING COMPLETED! ═════════════`);
            this.displayAntiBlockStats();

        } catch (error) {
            console.error(`❌ Critical error in protected scraping: ${error.message}`);
            this.displayAntiBlockStats();
        } finally {
            // قطع اتصال VPN في النهاية
            if (this.isVpnConnected) {
                await this.disconnectVpn();
            }
        }
    }
}

export default AntiBlockNetCarShowScraper;
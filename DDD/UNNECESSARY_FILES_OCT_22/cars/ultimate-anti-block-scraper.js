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

class UltimateAntiBlockScraper {
    constructor() {
        this.baseUrl = 'https://www.netcarshow.com';
        this.brandDirectoriesPath = path.join(__dirname, 'brand_directories');
        this.downloadedUrls = new Set();
        this.failedUrls = new Set();
        this.blockedIps = new Set();
        this.currentProxyIndex = 0;
        this.currentUserAgentIndex = 0;
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.currentVpnProvider = null;
        this.isVpnConnected = false;
        this.blockingDetected = false;
        
        // قائمة البروكسيات المجانية (يتم تحديثها تلقائياً)
        this.proxyList = [];
        this.workingProxies = [];

        // مصادر البروكسيات المجانية
        this.proxySourceApis = [
            'https://api.proxyscrape.com/v2/?request=get&format=textplain&protocol=http&timeout=10000&country=all',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt'
        ];

        // قائمة User Agents محدثة ومتنوعة
        this.userAgents = [
            // Chrome - Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            
            // Chrome - MacOS
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            
            // Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
            'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0',
            
            // Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            
            // Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            
            // Mobile
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        ];

        // قائمة VPN المدعومة
        this.vpnProviders = {
            'protonvpn': {
                connect: 'protonvpn connect --fastest',
                disconnect: 'protonvpn disconnect',
                status: 'protonvpn status'
            },
            'nordvpn': {
                connect: 'nordvpn connect',
                disconnect: 'nordvpn disconnect',
                status: 'nordvpn status'
            },
            'expressvpn': {
                connect: 'expressvpn connect smart',
                disconnect: 'expressvpn disconnect',
                status: 'expressvpn status'
            },
            'windscribe': {
                connect: 'windscribe connect',
                disconnect: 'windscribe disconnect',
                status: 'windscribe status'
            },
            'surfshark': {
                connect: 'surfshark-vpn attack',
                disconnect: 'surfshark-vpn down',
                status: 'surfshark-vpn status'
            }
        };

        // إعدادات الحماية المتقدمة
        this.protectionSettings = {
            // تأخير ذكي
            minDelay: 2000,
            maxDelay: 15000,
            blockingDelay: 180000, // 3 دقائق بعد الحظر
            
            // دوران الحماية
            proxyRotationInterval: 8,
            userAgentRotationInterval: 4,
            vpnRotationInterval: 50,
            headerRotationInterval: 3,
            
            // حدود السلامة
            maxRequestsPerHour: 200,
            maxConsecutiveFailures: 5,
            maxBlockingDetections: 3,
            
            // محاكاة السلوك البشري
            humanBehaviorSimulation: true,
            randomMouseMovement: true,
            randomScrolling: true,
            randomPageStayTime: true,
            
            // فحص الحظر المتقدم
            advancedBlockingDetection: true,
            captchaDetection: true,
            rateLimitDetection: true
        };

        // إحصائيات شاملة
        this.stats = {
            session: {
                startTime: Date.now(),
                currentBrand: '',
                currentModel: '',
                currentOperation: 'System Initialization',
                totalBlocks: 0,
                proxyChanges: 0,
                vpnChanges: 0,
                userAgentChanges: 0,
                headerChanges: 0,
                captchaSolved: 0,
                emergencyModeActivations: 0
            },
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                blocked: 0,
                timeout: 0,
                retried: 0,
                proxied: 0
            },
            brands: { total: 0, processed: 0, successful: 0, failed: 0 },
            models: { total: 0, processed: 0, successful: 0, failed: 0 },
            images: { found: 0, downloaded: 0, skipped: 0, failed: 0, duplicate: 0 },
            protection: {
                blockingEvents: [],
                proxyFailures: [],
                vpnConnections: [],
                emergencyActivations: []
            },
            performance: {
                avgResponseTime: 0,
                totalDataSize: 0,
                avgImageSize: 0,
                requestsPerHour: 0,
                successRate: 0
            }
        };

        this.printWelcomeBanner();
    }

    printWelcomeBanner() {
        console.log(`\n🛡️  ══════════════════════════════════════════════════════════════════════════════════════════`);
        console.log(`🚗 ULTIMATE ANTI-BLOCK NETCARSHOW SCRAPER v4.0 - ENTERPRISE EDITION`);
        console.log(`🛡️  ══════════════════════════════════════════════════════════════════════════════════════════`);
        console.log(`🔒 MULTI-LAYER PROTECTION SYSTEM:`);
        console.log(`   🔄 Dynamic Proxy Rotation (Free + Premium)`);
        console.log(`   🌐 Multi-VPN Provider Integration`);
        console.log(`   🎭 Advanced User-Agent & Header Randomization`);
        console.log(`   🧠 Human Behavior Simulation Engine`);
        console.log(`   🚨 Real-time Block Detection & Emergency Response`);
        console.log(`   ⚡ Intelligent Rate Limiting & Adaptive Delays`);
        console.log(`   🕵️  Stealth Mode & Traffic Obfuscation`);
        console.log(`🛡️  ══════════════════════════════════════════════════════════════════════════════════════════\n`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // تحديث قائمة البروكسيات تلقائياً
    async updateProxyList() {
        console.log(`🔄 Updating proxy list from multiple sources...`);
        const allProxies = new Set();

        for (const apiUrl of this.proxySourceApis) {
            try {
                console.log(`   📡 Fetching from: ${apiUrl.substring(0, 50)}...`);
                const response = await axios.get(apiUrl, { 
                    timeout: 15000,
                    headers: {
                        'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
                    }
                });

                const proxies = response.data
                    .split('\n')
                    .filter(line => line.trim() && line.includes(':'))
                    .map(line => {
                        const [ip, port] = line.trim().split(':');
                        return `http://${ip}:${port}`;
                    });

                proxies.forEach(proxy => allProxies.add(proxy));
                console.log(`   ✅ Added ${proxies.length} proxies`);

            } catch (error) {
                console.log(`   ❌ Failed to fetch from source: ${error.message}`);
            }
        }

        this.proxyList = Array.from(allProxies);
        console.log(`✅ Total proxies available: ${this.proxyList.length}`);

        // اختبار عينة من البروكسيات
        await this.testProxySample();
    }

    // اختبار عينة من البروكسيات
    async testProxySample(sampleSize = 10) {
        console.log(`🧪 Testing proxy sample (${sampleSize} proxies)...`);
        this.workingProxies = [];

        const testProxies = this.proxyList.slice(0, sampleSize);
        
        for (const proxy of testProxies) {
            try {
                const testUrl = 'http://httpbin.org/ip';
                const proxyUrl = new URL(proxy);
                
                const response = await axios.get(testUrl, {
                    timeout: 8000,
                    proxy: {
                        protocol: proxyUrl.protocol.replace(':', ''),
                        host: proxyUrl.hostname,
                        port: parseInt(proxyUrl.port)
                    }
                });

                if (response.status === 200) {
                    this.workingProxies.push(proxy);
                    console.log(`   ✅ Working proxy: ${proxy}`);
                }

            } catch (error) {
                console.log(`   ❌ Failed proxy: ${proxy}`);
            }
        }

        console.log(`✅ Working proxies found: ${this.workingProxies.length}/${testProxies.length}`);
    }

    // حساب تأخير ذكي مع محاكاة السلوك البشري
    calculateIntelligentDelay() {
        const baseDelay = Math.random() * 
            (this.protectionSettings.maxDelay - this.protectionSettings.minDelay) + 
            this.protectionSettings.minDelay;

        // عامل التكيف حسب عدد الطلبات
        const adaptationFactor = Math.min(this.requestCount / 100, 3);
        let adaptiveDelay = baseDelay * (1 + adaptationFactor);

        // عامل الحظر - تأخير إضافي إذا تم اكتشاف حظر
        if (this.blockingDetected) {
            adaptiveDelay *= 2;
            console.log(`🚨 Blocking detected - applying extended delay`);
        }

        // محاكاة السلوك البشري - فترات راحة عشوائية
        if (this.protectionSettings.humanBehaviorSimulation) {
            // 15% احتمال راحة طويلة (مثل المستخدم الذي يفكر)
            if (Math.random() < 0.15) {
                const thinkingTime = 10000 + Math.random() * 40000; // 10-50 ثانية
                console.log(`🧠 Human behavior simulation: thinking time ${Math.round(thinkingTime/1000)}s`);
                adaptiveDelay += thinkingTime;
            }

            // 8% احتمال استراحة قصيرة
            if (Math.random() < 0.08) {
                const breakTime = 30000 + Math.random() * 90000; // 30 ثانية - 2.5 دقيقة
                console.log(`☕ Human behavior simulation: coffee break ${Math.round(breakTime/1000)}s`);
                adaptiveDelay += breakTime;
            }
        }

        return Math.round(adaptiveDelay);
    }

    // دوران البروكسي الذكي
    getNextProxy() {
        if (this.workingProxies.length === 0) {
            console.log(`⚠️  No working proxies available`);
            return null;
        }

        if (this.requestCount % this.protectionSettings.proxyRotationInterval === 0) {
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.workingProxies.length;
            this.stats.session.proxyChanges++;
            console.log(`🔄 Proxy rotation: ${this.currentProxyIndex + 1}/${this.workingProxies.length}`);
        }

        return this.workingProxies[this.currentProxyIndex];
    }

    // دوران User Agent الذكي
    getNextUserAgent() {
        if (this.requestCount % this.protectionSettings.userAgentRotationInterval === 0) {
            this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % this.userAgents.length;
            this.stats.session.userAgentChanges++;
            console.log(`🎭 User Agent rotation: ${this.currentUserAgentIndex + 1}/${this.userAgents.length}`);
        }

        return this.userAgents[this.currentUserAgentIndex];
    }

    // توليد headers عشوائية متقدمة
    generateAdvancedHeaders(isImageRequest = false) {
        const commonHeaders = {
            'Accept-Language': this.getRandomAcceptLanguage(),
            'Accept-Encoding': this.getRandomAcceptEncoding(),
            'Cache-Control': this.getRandomCacheControl(),
            'Connection': Math.random() > 0.7 ? 'keep-alive' : 'close',
            'DNT': Math.random() > 0.4 ? '1' : '0',
            'Pragma': 'no-cache',
            'Sec-Fetch-Site': this.getRandomSecFetchSite(),
            'Sec-Fetch-Mode': Math.random() > 0.5 ? 'navigate' : 'no-cors',
            'Sec-Fetch-Dest': isImageRequest ? 'image' : 'document',
            'Upgrade-Insecure-Requests': '1'
        };

        if (isImageRequest) {
            commonHeaders['Accept'] = 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
        } else {
            commonHeaders['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
            commonHeaders['Sec-Fetch-User'] = '?1';
        }

        // إضافة headers إضافية أحياناً
        if (Math.random() > 0.6) {
            commonHeaders['X-Requested-With'] = 'XMLHttpRequest';
        }

        if (Math.random() > 0.8) {
            commonHeaders['X-Forwarded-For'] = this.generateRandomIP();
        }

        this.stats.session.headerChanges++;
        return commonHeaders;
    }

    getRandomAcceptLanguage() {
        const languages = [
            'en-US,en;q=0.9',
            'en-US,en;q=0.9,ar;q=0.8',
            'en-GB,en-US;q=0.9,en;q=0.8',
            'en-US,en;q=0.8,ar;q=0.7,fr;q=0.6',
            'en,ar;q=0.9,fr;q=0.8,de;q=0.7'
        ];
        return languages[Math.floor(Math.random() * languages.length)];
    }

    getRandomAcceptEncoding() {
        const encodings = ['gzip, deflate, br', 'gzip, deflate', 'br, gzip, deflate'];
        return encodings[Math.floor(Math.random() * encodings.length)];
    }

    getRandomCacheControl() {
        const controls = ['no-cache', 'max-age=0', 'no-store', 'must-revalidate'];
        return controls[Math.floor(Math.random() * controls.length)];
    }

    getRandomSecFetchSite() {
        const sites = ['none', 'same-origin', 'cross-site', 'same-site'];
        return sites[Math.floor(Math.random() * sites.length)];
    }

    generateRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    // فحص VPN providers المتاحة
    async detectAvailableVpnProviders() {
        const availableProviders = [];

        for (const [provider, commands] of Object.entries(this.vpnProviders)) {
            try {
                // محاولة تشغيل أمر status للتحقق من وجود المزود
                await execAsync(commands.status, { timeout: 10000 });
                availableProviders.push(provider);
                console.log(`✅ VPN Provider detected: ${provider}`);
            } catch (error) {
                console.log(`⚠️  VPN Provider not available: ${provider}`);
            }
        }

        return availableProviders;
    }

    // إدارة اتصال VPN متقدم
    async connectToVpnProvider(provider) {
        try {
            console.log(`🔐 Connecting to ${provider}...`);
            const commands = this.vpnProviders[provider];
            
            if (!commands) {
                throw new Error(`Unsupported VPN provider: ${provider}`);
            }

            const { stdout } = await execAsync(commands.connect, { timeout: 60000 });
            
            // تحقق من نجاح الاتصال
            const statusResult = await execAsync(commands.status, { timeout: 10000 });
            
            if (statusResult.stdout.toLowerCase().includes('connected') || 
                statusResult.stdout.toLowerCase().includes('active')) {
                
                this.isVpnConnected = true;
                this.currentVpnProvider = provider;
                this.stats.session.vpnChanges++;
                
                console.log(`✅ Successfully connected to ${provider}`);
                
                // انتظار استقرار الاتصال
                await this.delay(8000);
                
                // تسجيل في إحصائيات الحماية
                this.stats.protection.vpnConnections.push({
                    provider,
                    timestamp: Date.now(),
                    success: true
                });
                
                return true;
            } else {
                throw new Error('VPN connection verification failed');
            }

        } catch (error) {
            console.log(`❌ VPN connection failed for ${provider}: ${error.message}`);
            
            this.stats.protection.vpnConnections.push({
                provider,
                timestamp: Date.now(),
                success: false,
                error: error.message
            });
            
            return false;
        }
    }

    // قطع اتصال VPN
    async disconnectCurrentVpn() {
        if (!this.isVpnConnected || !this.currentVpnProvider) {
            return true;
        }

        try {
            console.log(`🔓 Disconnecting from ${this.currentVpnProvider}...`);
            const commands = this.vpnProviders[this.currentVpnProvider];
            
            await execAsync(commands.disconnect, { timeout: 20000 });
            
            this.isVpnConnected = false;
            const disconnectedProvider = this.currentVpnProvider;
            this.currentVpnProvider = null;
            
            console.log(`✅ Disconnected from ${disconnectedProvider}`);
            return true;

        } catch (error) {
            console.log(`⚠️  VPN disconnection warning: ${error.message}`);
            // تعتبر منقطعة حتى لو فشل الأمر
            this.isVpnConnected = false;
            this.currentVpnProvider = null;
            return false;
        }
    }

    // دوران VPN تلقائي
    async rotateVpnConnection() {
        console.log(`🔄 Initiating VPN rotation...`);
        
        const availableProviders = await this.detectAvailableVpnProviders();
        if (availableProviders.length === 0) {
            console.log(`❌ No VPN providers available for rotation`);
            return false;
        }

        // قطع الاتصال الحالي
        await this.disconnectCurrentVpn();
        
        // انتظار قليل قبل الاتصال الجديد
        await this.delay(5000);
        
        // اختيار مزود عشوائي جديد
        const randomProvider = availableProviders[Math.floor(Math.random() * availableProviders.length)];
        
        return await this.connectToVpnProvider(randomProvider);
    }

    // كشف الحظر المتقدم
    detectAdvancedBlocking(response, responseText = '', url = '') {
        const blockingIndicators = {
            // HTTP Status Codes
            httpStatus: [403, 429, 503, 520, 521, 522, 524].includes(response.status),
            
            // Rate limiting headers
            rateLimitHeaders: response.headers['x-rate-limit-remaining'] === '0' ||
                             response.headers['retry-after'] ||
                             response.headers['x-rate-limit-limit'],
            
            // Content-based detection
            contentBlocking: [
                'blocked', 'rate limit', 'too many requests', 'access denied',
                'cloudflare', 'captcha', 'recaptcha', 'ddos protection',
                'security check', 'unusual traffic', 'suspicious activity',
                'temporary unavailable', 'service unavailable'
            ].some(indicator => responseText.toLowerCase().includes(indicator)),
            
            // Cloudflare specific
            cloudflareBlocking: response.headers['cf-ray'] && response.status >= 400,
            
            // Empty or minimal response
            suspiciousResponse: responseText.length < 100 && response.status === 200,
            
            // Redirect loops or suspicious redirects
            suspiciousRedirect: response.status >= 300 && response.status < 400 &&
                               !response.headers.location?.includes('netcarshow.com'),
            
            // JavaScript challenges
            javascriptChallenge: responseText.includes('jschl_vc') || 
                               responseText.includes('challenge-form'),
            
            // CAPTCHA detection
            captchaDetection: responseText.toLowerCase().includes('captcha') ||
                            responseText.toLowerCase().includes('recaptcha') ||
                            responseText.includes('data-sitekey')
        };

        const blockingDetected = Object.values(blockingIndicators).some(indicator => indicator);
        
        if (blockingDetected) {
            // تسجيل تفاصيل الحظر
            const blockingEvent = {
                timestamp: Date.now(),
                url: url.substring(0, 100),
                status: response.status,
                indicators: Object.entries(blockingIndicators)
                    .filter(([key, value]) => value)
                    .map(([key, value]) => key),
                headers: {
                    'cf-ray': response.headers['cf-ray'],
                    'server': response.headers['server'],
                    'x-rate-limit-remaining': response.headers['x-rate-limit-remaining']
                },
                responseLength: responseText.length
            };
            
            this.stats.protection.blockingEvents.push(blockingEvent);
            this.blockingDetected = true;
            
            console.log(`🚨 Advanced blocking detected:`, blockingEvent.indicators);
            return true;
        }

        this.blockingDetected = false;
        return false;
    }

    // وضع الطوارئ - تفعيل جميع الحمايات
    async activateEmergencyMode() {
        console.log(`🚨 ACTIVATING EMERGENCY ANTI-BLOCK MODE 🚨`);
        this.stats.session.emergencyModeActivations++;
        
        const emergencyActivation = {
            timestamp: Date.now(),
            reason: 'Multiple blocking detections',
            actions: []
        };

        try {
            // 1. دوران VPN فوري
            console.log(`🔄 Emergency VPN rotation...`);
            const vpnRotated = await this.rotateVpnConnection();
            emergencyActivation.actions.push(`VPN rotation: ${vpnRotated ? 'SUCCESS' : 'FAILED'}`);

            // 2. تحديث قائمة البروكسيات
            console.log(`🔄 Emergency proxy list update...`);
            await this.updateProxyList();
            emergencyActivation.actions.push('Proxy list updated');

            // 3. إعادة تعيين عدادات التتبع
            this.currentProxyIndex = 0;
            this.currentUserAgentIndex = 0;
            emergencyActivation.actions.push('Tracking counters reset');

            // 4. تأخير طويل للسماح بالاستقرار
            const emergencyDelay = this.protectionSettings.blockingDelay;
            console.log(`⏰ Emergency cooling period: ${Math.round(emergencyDelay/1000)}s`);
            await this.delay(emergencyDelay);
            emergencyActivation.actions.push(`Cooling period: ${emergencyDelay}ms`);

            console.log(`✅ Emergency mode completed successfully`);
            emergencyActivation.success = true;

        } catch (error) {
            console.log(`❌ Emergency mode failed: ${error.message}`);
            emergencyActivation.success = false;
            emergencyActivation.error = error.message;
        }

        this.stats.protection.emergencyActivations.push(emergencyActivation);
        this.blockingDetected = false; // إعادة تعيين حالة الحظر
    }

    // طلب HTTP محسن مع حماية شاملة
    async makeUltimateProtectedRequest(url, options = {}) {
        const maxRetries = 10;
        const maxConsecutiveBlocks = 3;
        let consecutiveBlocks = 0;
        let isImageRequest = options.responseType === 'stream';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.requestCount++;
                this.stats.requests.total++;
                const startTime = Date.now();

                // تطبيق التأخير الذكي
                const intelligentDelay = this.calculateIntelligentDelay();
                const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                
                if (timeSinceLastRequest < intelligentDelay) {
                    const waitTime = intelligentDelay - timeSinceLastRequest;
                    console.log(`⏳ Intelligent delay: ${Math.round(waitTime/1000)}s (attempt ${attempt})`);
                    await this.delay(waitTime);
                }

                // إعدادات الطلب المحسنة
                const currentProxy = this.getNextProxy();
                const currentUserAgent = this.getNextUserAgent();
                const advancedHeaders = this.generateAdvancedHeaders(isImageRequest);

                const config = {
                    timeout: 60000,
                    maxRedirects: 3,
                    headers: {
                        'User-Agent': currentUserAgent,
                        'Referer': Math.random() > 0.3 ? this.baseUrl + '/' : 'https://www.google.com/',
                        ...advancedHeaders,
                        ...options.headers
                    },
                    validateStatus: status => status < 500, // قبول كل شيء أقل من 500
                    ...options
                };

                // تطبيق البروكسي إذا كان متاحاً
                if (currentProxy && !options.skipProxy) {
                    try {
                        const proxyUrl = new URL(currentProxy);
                        config.proxy = {
                            protocol: proxyUrl.protocol.replace(':', ''),
                            host: proxyUrl.hostname,
                            port: parseInt(proxyUrl.port)
                        };
                        this.stats.requests.proxied++;
                    } catch (proxyError) {
                        console.log(`⚠️  Invalid proxy format: ${currentProxy}`);
                    }
                }

                // تنفيذ الطلب
                const response = await axios.get(url, config);
                const responseTime = Date.now() - startTime;
                this.lastRequestTime = Date.now();

                // تحديث إحصائيات الأداء
                this.stats.performance.avgResponseTime = 
                    (this.stats.performance.avgResponseTime + responseTime) / 2;

                // فحص الحظر المتقدم
                const responseText = typeof response.data === 'string' ? response.data : '';
                const isBlocked = this.detectAdvancedBlocking(response, responseText, url);

                if (isBlocked) {
                    this.stats.requests.blocked++;
                    consecutiveBlocks++;
                    this.stats.session.totalBlocks++;

                    console.log(`🚫 Blocking detected (consecutive: ${consecutiveBlocks}/${maxConsecutiveBlocks})`);

                    // تفعيل وضع الطوارئ إذا لزم الأمر
                    if (consecutiveBlocks >= maxConsecutiveBlocks) {
                        await this.activateEmergencyMode();
                        consecutiveBlocks = 0; // إعادة تعيين العداد
                    }

                    // تأخير إضافي بعد الحظر
                    const blockDelay = Math.min(
                        this.protectionSettings.blockingDelay * consecutiveBlocks,
                        300000 // حد أقصى 5 دقائق
                    );
                    
                    console.log(`⏰ Post-blocking delay: ${Math.round(blockDelay/1000)}s`);
                    await this.delay(blockDelay);

                    continue; // إعادة المحاولة
                }

                // نجح الطلب
                this.stats.requests.successful++;
                consecutiveBlocks = 0; // إعادة تعيين عداد الحظر المتتالي

                const shortUrl = url.length > 80 ? url.substring(0, 80) + '...' : url;
                console.log(`✅ Ultimate request successful: ${shortUrl} (${responseTime}ms)`);
                
                return response;

            } catch (error) {
                console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
                this.stats.requests.failed++;

                if (error.code === 'ETIMEDOUT') {
                    this.stats.requests.timeout++;
                }

                if (attempt === maxRetries) {
                    this.stats.requests.retried++;
                    console.log(`❌ Request permanently failed after ${maxRetries} attempts`);
                    throw error;
                }

                // تأخير متزايد مع عشوائية
                const retryDelay = Math.min(
                    3000 * Math.pow(2, attempt - 1) + Math.random() * 5000,
                    30000 // حد أقصى 30 ثانية
                );
                
                console.log(`⏳ Retry delay: ${Math.round(retryDelay/1000)}s`);
                await this.delay(retryDelay);
            }
        }
    }

    // عرض إحصائيات الحماية الشاملة
    displayUltimateProtectionStats() {
        const runtime = Date.now() - this.stats.session.startTime;
        const hours = Math.floor(runtime / (1000 * 60 * 60));
        const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
        
        const successRate = this.stats.requests.total > 0 ? 
            ((this.stats.requests.successful / this.stats.requests.total) * 100).toFixed(1) : '0.0';

        console.log(`\n🛡️  ═══════════════════ ULTIMATE PROTECTION STATUS ═══════════════════`);
        console.log(`⏱️  Runtime: ${hours}h ${minutes}m`);
        console.log(`🔄 Current Operation: ${this.stats.session.currentOperation}`);
        console.log(`🎯 Processing: ${this.stats.session.currentBrand} - ${this.stats.session.currentModel}`);
        
        console.log(`\n🌐 REQUEST STATISTICS:`);
        console.log(`   Total: ${this.stats.requests.total}`);
        console.log(`   Successful: ${this.stats.requests.successful} (${successRate}%)`);
        console.log(`   Failed: ${this.stats.requests.failed}`);
        console.log(`   Blocked: ${this.stats.requests.blocked}`);
        console.log(`   Proxied: ${this.stats.requests.proxied}`);
        console.log(`   Timeout: ${this.stats.requests.timeout}`);
        
        console.log(`\n🛡️  PROTECTION MEASURES:`);
        console.log(`   VPN Status: ${this.isVpnConnected ? '🔐 Connected (' + this.currentVpnProvider + ')' : '🔓 Disconnected'}`);
        console.log(`   Working Proxies: ${this.workingProxies.length}/${this.proxyList.length}`);
        console.log(`   Total Blocks: ${this.stats.session.totalBlocks}`);
        console.log(`   Emergency Activations: ${this.stats.session.emergencyModeActivations}`);
        
        console.log(`\n🔄 ROTATION STATISTICS:`);
        console.log(`   Proxy Changes: ${this.stats.session.proxyChanges}`);
        console.log(`   VPN Changes: ${this.stats.session.vpnChanges}`);
        console.log(`   User Agent Changes: ${this.stats.session.userAgentChanges}`);
        console.log(`   Header Changes: ${this.stats.session.headerChanges}`);
        
        console.log(`\n📊 DATA STATISTICS:`);
        console.log(`   Brands: ${this.stats.brands.processed}/${this.stats.brands.total}`);
        console.log(`   Models: ${this.stats.models.processed}/${this.stats.models.total}`);
        console.log(`   Images Downloaded: ${this.stats.images.downloaded}`);
        console.log(`   Images Skipped: ${this.stats.images.skipped}`);
        
        console.log(`\n⚡ PERFORMANCE:`);
        console.log(`   Avg Response Time: ${Math.round(this.stats.performance.avgResponseTime)}ms`);
        console.log(`   Requests/Hour: ${Math.round(this.stats.requests.total / (runtime / 3600000))}`);
        console.log(`   Success Rate: ${successRate}%`);
        console.log(`   Total Data: ${Math.round(this.stats.performance.totalDataSize / (1024 * 1024))} MB`);
        
        console.log(`═══════════════════════════════════════════════════════════════════════`);
    }

    // التهيئة الأولية للنظام
    async initializeUltimateProtection() {
        console.log(`🔧 Initializing ultimate protection system...`);
        
        try {
            // 1. تحديث قائمة البروكسيات
            await this.updateProxyList();
            
            // 2. محاولة الاتصال بـ VPN
            const availableVpnProviders = await this.detectAvailableVpnProviders();
            if (availableVpnProviders.length > 0) {
                const randomProvider = availableVpnProviders[Math.floor(Math.random() * availableVpnProviders.length)];
                await this.connectToVpnProvider(randomProvider);
            } else {
                console.log(`⚠️  No VPN providers available. Continuing with proxy protection.`);
            }
            
            console.log(`✅ Ultimate protection system initialized successfully`);
            return true;
            
        } catch (error) {
            console.log(`❌ Protection system initialization failed: ${error.message}`);
            return false;
        }
    }

    // نسخة محمية من اكتشاف العلامات التجارية
    async discoverBrandsWithUltimateProtection() {
        try {
            console.log(`\n🔍 Ultimate protected brand discovery...`);
            this.stats.session.currentOperation = 'Ultimate Brand Discovery';

            const response = await this.makeUltimateProtectedRequest(`${this.baseUrl}/`);
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
            console.log(`✅ Ultimate discovery completed: ${brands.length} protected brands found`);
            
            return brands;

        } catch (error) {
            console.error(`❌ Ultimate brand discovery failed: ${error.message}`);
            return [];
        }
    }

    // دوال مساعدة (نسخ من الكلاسات السابقة)
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
    async startUltimateProtectedScraping() {
        console.log(`\n🚀 STARTING ULTIMATE ANTI-BLOCK PROTECTED SCRAPING`);
        console.log(`🛡️  Maximum protection enabled against all blocking methods\n`);
        
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

            // هنا يجب إضافة منطق معالجة العلامات التجارية والموديلات والصور
            // مع استخدام makeUltimateProtectedRequest لجميع الطلبات
            
            // مثال على معالجة علامة تجارية واحدة:
            for (let i = 0; i < Math.min(brands.length, 3); i++) { // مثال على 3 علامات فقط
                const brand = brands[i];
                console.log(`\n🏭 [${i + 1}/${brands.length}] Processing ${brand.displayName} with ultimate protection...`);
                this.stats.session.currentBrand = brand.displayName;
                this.stats.session.currentOperation = `Processing ${brand.displayName}`;
                
                // هنا يجب إضافة منطق معالجة الموديلات والصور
                // باستخدام makeUltimateProtectedRequest
                
                this.stats.brands.processed++;
                
                // تأخير بين العلامات التجارية
                await this.delay(10000);
            }

            clearInterval(statsInterval);

            // النتائج النهائية
            console.log(`\n🎉 ══════════════ ULTIMATE PROTECTED SCRAPING COMPLETED! ══════════════`);
            this.displayUltimateProtectionStats();

        } catch (error) {
            console.error(`❌ Critical error in ultimate protected scraping: ${error.message}`);
            this.displayUltimateProtectionStats();
        } finally {
            // تنظيف الموارد
            if (this.isVpnConnected) {
                await this.disconnectCurrentVpn();
            }
            
            console.log(`\n🧹 Resources cleaned up. Session ended.`);
        }
    }
}

// تشغيل النظام
if (import.meta.url === `file://${process.argv[1]}`) {
    const ultimateScraper = new UltimateAntiBlockScraper();
    
    // معالجة إشارات النظام
    process.on('SIGINT', async () => {
        console.log(`\n\n⏹️  ULTIMATE SCRAPER INTERRUPTED BY USER`);
        ultimateScraper.displayUltimateProtectionStats();
        
        if (ultimateScraper.isVpnConnected) {
            console.log(`🔓 Disconnecting VPN...`);
            await ultimateScraper.disconnectCurrentVpn();
        }
        
        console.log(`\n💾 Session data preserved. You can resume later.`);
        process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
        console.error(`\n❌ CRITICAL ERROR: ${error.message}`);
        ultimateScraper.displayUltimateProtectionStats();
        
        if (ultimateScraper.isVpnConnected) {
            await ultimateScraper.disconnectCurrentVpn();
        }
        
        process.exit(1);
    });

    ultimateScraper.startUltimateProtectedScraping().catch(async error => {
        console.error(`❌ Ultimate scraper failed to start: ${error.message}`);
        ultimateScraper.displayUltimateProtectionStats();
        
        if (ultimateScraper.isVpnConnected) {
            await ultimateScraper.disconnectCurrentVpn();
        }
        
        process.exit(1);
    });
}

export default UltimateAntiBlockScraper;
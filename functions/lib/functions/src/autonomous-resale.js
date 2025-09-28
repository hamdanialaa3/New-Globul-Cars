"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredStrategies = exports.weeklyPriceOptimization = exports.dailyMarketAnalysis = exports.onSaleOfferCreated = exports.onSaleStrategyCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_2 = require("firebase/firestore");
const firebase_functions_1 = require("firebase-functions");
const db = (0, firestore_2.getFirestore)();
/**
 * معالجة إنشاء استراتيجية بيع جديدة
 */
exports.onSaleStrategyCreated = (0, firestore_1.onDocumentCreated)('saleStrategies/{strategyId}', async (event) => {
    var _a;
    try {
        const strategy = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!strategy)
            return;
        firebase_functions_1.logger.info(`استراتيجية بيع جديدة: ${strategy.strategyId}`);
        // إنشاء جدولة لمراقبة السوق
        await scheduleMarketMonitoring(strategy.strategyId);
        // تحليل السوق الأولي
        await performMarketAnalysis(strategy.vin);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة إنشاء استراتيجية البيع:', error);
    }
});
/**
 * معالجة عروض الشراء الجديدة
 */
exports.onSaleOfferCreated = (0, firestore_1.onDocumentCreated)('saleOffers/{offerId}', async (event) => {
    var _a;
    try {
        const offer = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!offer)
            return;
        firebase_functions_1.logger.info(`عرض شراء جديد: ${offer.amount} EUR`);
        // العثور على الاستراتيجية المرتبطة
        const strategyQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('vin', '==', offer.vin || ''), // افتراض وجود vin في العرض
        (0, firestore_2.where)('status', '==', 'active'));
        const strategySnapshot = await (0, firestore_2.getDocs)(strategyQuery);
        if (strategySnapshot.empty)
            return;
        const strategy = strategySnapshot.docs[0].data();
        // تطبيق منطق الذكاء الاصطناعي
        await applyAIStrategyLogic(strategy.strategyId, offer);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة عرض الشراء:', error);
    }
});
/**
 * تحديث تحليل السوق اليومي
 */
exports.dailyMarketAnalysis = (0, scheduler_1.onSchedule)({
    schedule: '0 6 * * *', // كل يوم الساعة 6 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء التحليل اليومي للسوق');
        // الحصول على جميع الاستراتيجيات النشطة
        const strategiesSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('status', '==', 'active')));
        for (const strategyDoc of strategiesSnapshot.docs) {
            const strategy = strategyDoc.data();
            // تحديث تحليل السوق
            await performMarketAnalysis(strategy.vin);
            // التحقق من الحاجة لتعديل الاستراتيجية
            await checkStrategyAdjustment(strategy.strategyId);
        }
        firebase_functions_1.logger.info('تم التحليل اليومي للسوق بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحليل اليومي للسوق:', error);
    }
});
/**
 * تحسين الأسعار الأسبوعي
 */
exports.weeklyPriceOptimization = (0, scheduler_1.onSchedule)({
    schedule: '0 7 * * 1', // كل يوم اثنين الساعة 7 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء تحسين الأسعار الأسبوعي');
        const strategiesSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('status', '==', 'active')));
        for (const strategyDoc of strategiesSnapshot.docs) {
            const strategy = strategyDoc.data();
            // تحسين الأسعار بناءً على الأداء
            await optimizeStrategyPrices(strategy.strategyId);
        }
        firebase_functions_1.logger.info('تم تحسين الأسعار الأسبوعي بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحسين الأسعار الأسبوعي:', error);
    }
});
/**
 * تنظيف الاستراتيجيات المنتهية الصلاحية
 */
exports.cleanupExpiredStrategies = (0, scheduler_1.onSchedule)({
    schedule: '0 3 * * *', // كل يوم الساعة 3 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    var _a;
    try {
        firebase_functions_1.logger.info('بدء تنظيف الاستراتيجيات المنتهية');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const expiredStrategies = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('status', '==', 'active'), (0, firestore_2.where)('startDate', '<', firestore_2.Timestamp.fromDate(thirtyDaysAgo))));
        for (const strategyDoc of expiredStrategies.docs) {
            const strategy = strategyDoc.data();
            // إنهاء الاستراتيجية إذا لم تكن هناك عروض نشطة
            const activeOffers = ((_a = strategy.currentOffers) === null || _a === void 0 ? void 0 : _a.filter((offer) => offer.status === 'pending' || offer.status === 'counter_offered')) || [];
            if (activeOffers.length === 0) {
                await (0, firestore_2.updateDoc)(strategyDoc.ref, {
                    status: 'completed',
                    endDate: firestore_2.Timestamp.now()
                });
                // إشعار المستخدم
                await notifyStrategyCompletion(strategy.userId, strategy.strategyId);
                firebase_functions_1.logger.info(`تم إنهاء استراتيجية البيع: ${strategy.strategyId}`);
            }
        }
        firebase_functions_1.logger.info('تم تنظيف الاستراتيجيات المنتهية بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تنظيف الاستراتيجيات المنتهية:', error);
    }
});
/**
 * إجراء تحليل السوق لسيارة محددة
 */
async function performMarketAnalysis(vin) {
    try {
        // الحصول على بيانات السيارة
        const carDoc = await getDoc((0, firestore_2.doc)(db, 'cars', vin));
        if (!carDoc.exists())
            return;
        const car = carDoc.data();
        // البحث عن صفقات مشابهة
        const comparableSales = await findComparableSales(car);
        // حساب القيمة السوقية
        const marketValue = calculateMarketValue(car, comparableSales);
        // تحديث تحليل السوق
        const analysis = {
            vin,
            marketValue,
            comparableSales: comparableSales.slice(0, 5),
            confidence: calculateConfidence(comparableSales),
            lastUpdated: firestore_2.Timestamp.now(),
            trend: await analyzeMarketTrend(car.make, car.model)
        };
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'marketAnalysis', vin), analysis);
        firebase_functions_1.logger.info(`تم تحديث تحليل السوق للسيارة ${vin}: ${marketValue} EUR`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إجراء تحليل السوق:', error);
    }
}
/**
 * البحث عن صفقات مشابهة
 */
async function findComparableSales(car) {
    try {
        const comparableQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'soldCars'), (0, firestore_2.where)('make', '==', car.make), (0, firestore_2.where)('model', '==', car.model), (0, firestore_2.orderBy)('saleDate', 'desc'), (0, firestore_2.limit)(20));
        const snapshot = await (0, firestore_2.getDocs)(comparableQuery);
        const comparables = [];
        snapshot.forEach((doc) => {
            const soldCar = doc.data();
            const similarity = calculateSimilarity(car, soldCar);
            if (similarity > 60) {
                comparables.push(Object.assign(Object.assign({}, soldCar), { similarity, id: doc.id }));
            }
        });
        return comparables.sort((a, b) => b.similarity - a.similarity);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في البحث عن صفقات مشابهة:', error);
        return [];
    }
}
/**
 * حساب القيمة السوقية
 */
function calculateMarketValue(car, comparables) {
    if (comparables.length === 0) {
        return calculateBaseValue(car);
    }
    // حساب متوسط مرجح
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    comparables.slice(0, 5).forEach((comp) => {
        const weight = comp.similarity / 100;
        totalWeightedPrice += comp.salePrice * weight;
        totalWeight += weight;
    });
    const averagePrice = totalWeightedPrice / totalWeight;
    // تعديلات العمر والكيلومترات
    const ageAdjustment = calculateAgeAdjustment(car.year);
    const mileageAdjustment = calculateMileageAdjustment(car.mileage);
    return averagePrice * ageAdjustment * mileageAdjustment;
}
/**
 * حساب القيمة الأساسية
 */
function calculateBaseValue(car) {
    const baseValues = {
        'VW Golf': 15000,
        'BMW 3 Series': 25000,
        'Mercedes C-Class': 28000,
        'Audi A4': 22000,
        'Skoda Octavia': 12000,
        'Opel Astra': 10000,
        'Ford Focus': 11000,
        'Toyota Corolla': 13000
    };
    const key = `${car.make} ${car.model}`;
    return baseValues[key] || 15000;
}
/**
 * حساب التشابه
 */
function calculateSimilarity(car1, car2) {
    let similarity = 100;
    const yearDiff = Math.abs(car1.year - car2.year);
    similarity -= yearDiff * 10;
    const mileageDiff = Math.abs(car1.mileage - car2.mileage) / 10000;
    similarity -= mileageDiff * 5;
    return Math.max(0, Math.min(100, similarity));
}
/**
 * حساب الثقة
 */
function calculateConfidence(comparables) {
    if (comparables.length === 0)
        return 30;
    if (comparables.length < 3)
        return 50;
    if (comparables.length < 5)
        return 70;
    return 85;
}
/**
 * تحليل اتجاه السوق
 */
async function analyzeMarketTrend(make, model) {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trendQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'soldCars'), (0, firestore_2.where)('make', '==', make), (0, firestore_2.where)('model', '==', model), (0, firestore_2.where)('saleDate', '>=', firestore_2.Timestamp.fromDate(sixMonthsAgo)), (0, firestore_2.orderBy)('saleDate', 'asc'));
        const snapshot = await (0, firestore_2.getDocs)(trendQuery);
        if (snapshot.size < 5)
            return 'stable';
        const prices = snapshot.docs.map(doc => doc.data().salePrice);
        const recentAvg = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const olderAvg = prices.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const change = (recentAvg - olderAvg) / olderAvg;
        if (change > 0.05)
            return 'increasing';
        if (change < -0.05)
            return 'decreasing';
        return 'stable';
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحليل اتجاه السوق:', error);
        return 'stable';
    }
}
/**
 * تعديلات العمر
 */
function calculateAgeAdjustment(year) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age <= 1)
        return 0.95;
    if (age <= 2)
        return 0.88;
    if (age <= 3)
        return 0.82;
    if (age <= 4)
        return 0.75;
    return 0.68;
}
/**
 * تعديلات الكيلومترات
 */
function calculateMileageAdjustment(mileage) {
    if (mileage < 20000)
        return 1.05;
    if (mileage < 50000)
        return 1.00;
    if (mileage < 80000)
        return 0.95;
    if (mileage < 120000)
        return 0.90;
    return 0.85;
}
/**
 * تطبيق منطق الذكاء الاصطناعي للاستراتيجية
 */
async function applyAIStrategyLogic(strategyId, offer) {
    try {
        const strategyDoc = await getDoc((0, firestore_2.doc)(db, 'saleStrategies', strategyId));
        if (!strategyDoc.exists())
            return;
        const strategy = strategyDoc.data();
        // منطق الذكاء الاصطناعي البسيط
        let decision = 'pending';
        let counterOffer = null;
        if (offer.amount >= strategy.targetPrice * 0.95) {
            decision = 'accepted';
        }
        else if (offer.amount < strategy.minimumPrice) {
            decision = 'declined';
        }
        else if (strategy.strategy === 'aggressive' && strategy.performance.negotiationRounds < 5) {
            counterOffer = Math.min(strategy.targetPrice * 0.95, offer.amount * 1.08);
            decision = 'counter_offered';
        }
        // تحديث العرض
        await (0, firestore_2.updateDoc)((0, firestore_2.doc)(db, 'saleOffers', offer.offerId), {
            status: decision,
            counterOffer,
            processedAt: firestore_2.Timestamp.now()
        });
        // تحديث إحصائيات الاستراتيجية
        const newPerformance = Object.assign(Object.assign({}, strategy.performance), { totalOffers: strategy.performance.totalOffers + 1, averageOffer: (strategy.performance.averageOffer * strategy.performance.totalOffers + offer.amount) /
                (strategy.performance.totalOffers + 1), highestOffer: Math.max(strategy.performance.highestOffer, offer.amount) });
        if (decision === 'counter_offered') {
            newPerformance.negotiationRounds++;
        }
        await (0, firestore_2.updateDoc)(strategyDoc.ref, {
            performance: newPerformance,
            lastActivity: firestore_2.Timestamp.now()
        });
        // إشعار المستخدم
        if (decision === 'accepted' || offer.amount > strategy.targetPrice * 0.90) {
            await notifyUserOfOffer(strategy.userId, offer, decision);
        }
        firebase_functions_1.logger.info(`تم تطبيق منطق الذكاء الاصطناعي على العرض ${offer.offerId}: ${decision}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تطبيق منطق الذكاء الاصطناعي:', error);
    }
}
/**
 * إنشاء جدولة لمراقبة السوق
 */
async function scheduleMarketMonitoring(strategyId) {
    try {
        // في الإنتاج، سيتم إنشاء وظائف مجدولة لمراقبة السوق
        firebase_functions_1.logger.info(`تم إنشاء جدولة مراقبة السوق للاستراتيجية: ${strategyId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إنشاء جدولة مراقبة السوق:', error);
    }
}
/**
 * التحقق من الحاجة لتعديل الاستراتيجية
 */
async function checkStrategyAdjustment(strategyId) {
    var _a;
    try {
        const strategyDoc = await getDoc((0, firestore_2.doc)(db, 'saleStrategies', strategyId));
        if (!strategyDoc.exists())
            return;
        const strategy = strategyDoc.data();
        // إذا لم تكن هناك عروض لأسبوعين، خفض السعر
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const recentOffers = ((_a = strategy.currentOffers) === null || _a === void 0 ? void 0 : _a.filter((offer) => offer.timestamp.toDate() > twoWeeksAgo)) || [];
        if (recentOffers.length === 0 && strategy.strategy !== 'aggressive') {
            // خفض السعر بنسبة 5%
            const newTargetPrice = strategy.targetPrice * 0.95;
            const newMinimumPrice = strategy.minimumPrice * 0.95;
            await (0, firestore_2.updateDoc)(strategyDoc.ref, {
                targetPrice: newTargetPrice,
                minimumPrice: newMinimumPrice,
                rules: Object.assign(Object.assign({}, strategy.rules), { acceptOffersAbove: newTargetPrice * 0.95 })
            });
            firebase_functions_1.logger.info(`تم تعديل أسعار الاستراتيجية ${strategyId} بسبب عدم النشاط`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحقق من تعديل الاستراتيجية:', error);
    }
}
/**
 * تحسين أسعار الاستراتيجية
 */
async function optimizeStrategyPrices(strategyId) {
    var _a;
    try {
        const strategyDoc = await getDoc((0, firestore_2.doc)(db, 'saleStrategies', strategyId));
        if (!strategyDoc.exists())
            return;
        const strategy = strategyDoc.data();
        // تحليل الأداء
        const performance = strategy.performance;
        const successRate = performance.totalOffers > 0 ?
            (((_a = strategy.currentOffers) === null || _a === void 0 ? void 0 : _a.filter((o) => o.status === 'accepted').length) || 0) / performance.totalOffers : 0;
        // تعديل الأسعار بناءً على الأداء
        let priceAdjustment = 1.0;
        if (successRate > 0.3) {
            // أداء جيد - زيادة الأسعار قليلاً
            priceAdjustment = 1.03;
        }
        else if (successRate < 0.1 && performance.totalOffers > 5) {
            // أداء ضعيف - خفض الأسعار
            priceAdjustment = 0.97;
        }
        if (priceAdjustment !== 1.0) {
            const newTargetPrice = strategy.targetPrice * priceAdjustment;
            const newMinimumPrice = strategy.minimumPrice * priceAdjustment;
            await (0, firestore_2.updateDoc)(strategyDoc.ref, {
                targetPrice: newTargetPrice,
                minimumPrice: newMinimumPrice,
                rules: Object.assign(Object.assign({}, strategy.rules), { acceptOffersAbove: newTargetPrice * 0.95 }),
                lastOptimization: firestore_2.Timestamp.now()
            });
            firebase_functions_1.logger.info(`تم تحسين أسعار الاستراتيجية ${strategyId}: ${priceAdjustment}`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحسين أسعار الاستراتيجية:', error);
    }
}
/**
 * إشعار المستخدم بالعرض
 */
async function notifyUserOfOffer(userId, offer, decision) {
    try {
        await (0, firestore_2.setDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'notifications')), {
            userId,
            type: 'sale_offer',
            title: decision === 'accepted' ? 'عرض شراء مقبول!' : 'عرض شراء جديد',
            message: `عرض شراء بقيمة ${offer.amount} EUR - ${decision}`,
            data: { offerId: offer.offerId },
            read: false,
            timestamp: firestore_2.Timestamp.now()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار المستخدم بالعرض:', error);
    }
}
/**
 * إشعار المستخدم بانتهاء الاستراتيجية
 */
async function notifyStrategyCompletion(userId, strategyId) {
    try {
        await (0, firestore_2.setDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'notifications')), {
            userId,
            type: 'strategy_completed',
            title: 'انتهت استراتيجية البيع التلقائي',
            message: 'لم يعد هناك نشاط في استراتيجية البيع التلقائي الخاصة بك',
            data: { strategyId },
            read: false,
            timestamp: firestore_2.Timestamp.now()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار انتهاء الاستراتيجية:', error);
    }
}
//# sourceMappingURL=autonomous-resale.js.map
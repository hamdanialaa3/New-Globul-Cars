"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredNotifications = exports.weeklyUserReports = exports.dailyMaintenanceReminders = exports.onMarketAnalysisUpdated = exports.onSaleOfferCreated = exports.onInsuranceClaimCreated = exports.onMaintenanceAlertCreated = exports.onAccidentAlertCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_2 = require("firebase/firestore");
const firebase_functions_1 = require("firebase-functions");
const db = (0, firestore_2.getFirestore)();
/**
 * معالجة إشعارات الحوادث الجديدة
 */
exports.onAccidentAlertCreated = (0, firestore_1.onDocumentCreated)('emergencyAlerts/{alertId}', async (event) => {
    var _a;
    try {
        const alert = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!alert)
            return;
        firebase_functions_1.logger.info(`إشعار طوارئ جديد: ${alert.vin}`);
        // إرسال إشعار للمستخدم
        await sendAccidentNotification(alert);
        // إشعار خدمات الطوارئ إذا لم يتم إرسالها
        if (!alert.emergencyServicesNotified) {
            await notifyEmergencyServices(alert);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة إشعار الحادث:', error);
    }
});
/**
 * معالجة تنبيهات الصيانة الجديدة
 */
exports.onMaintenanceAlertCreated = (0, firestore_1.onDocumentCreated)('maintenanceAlerts/{alertId}', async (event) => {
    var _a;
    try {
        const alert = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!alert)
            return;
        firebase_functions_1.logger.info(`تنبيه صيانة جديد: ${alert.vin}`);
        // إرسال إشعار للمستخدم
        await sendMaintenanceNotification(alert);
        // إشعار مراكز الخدمة
        await notifyServiceCenters(alert);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة تنبيه الصيانة:', error);
    }
});
/**
 * معالجة مطالبات التأمين الجديدة
 */
exports.onInsuranceClaimCreated = (0, firestore_1.onDocumentCreated)('insuranceClaims/{claimId}', async (event) => {
    var _a;
    try {
        const claim = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!claim)
            return;
        firebase_functions_1.logger.info(`مطالبة تأمين جديدة: ${claim.claimId}`);
        // إشعار المستخدم
        await sendInsuranceClaimNotification(claim);
        // إشعار شركة التأمين
        await notifyInsuranceCompany(claim);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة مطالبة التأمين:', error);
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
        // إشعار المستخدم
        await sendSaleOfferNotification(offer);
        // إشعار البائع إذا كان هناك تفاوض
        if (offer.status === 'counter_offered') {
            await sendCounterOfferNotification(offer);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة عرض الشراء:', error);
    }
});
/**
 * معالجة تحديثات أسعار السوق
 */
exports.onMarketAnalysisUpdated = (0, firestore_1.onDocumentUpdated)('marketAnalysis/{vin}', async (event) => {
    var _a, _b;
    try {
        const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        if (!before || !after)
            return;
        // التحقق من تغيير كبير في السعر
        const priceChange = Math.abs(after.marketValue - (before.marketValue || after.marketValue)) / after.marketValue;
        if (priceChange > 0.05) { // تغيير أكثر من 5%
            await sendMarketPriceNotification(after);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة تحديث تحليل السوق:', error);
    }
});
/**
 * إرسال إشعارات يومية للصيانة المستحقة
 */
exports.dailyMaintenanceReminders = (0, scheduler_1.onSchedule)({
    schedule: '0 9 * * *', // كل يوم الساعة 9 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء إرسال تذكيرات الصيانة اليومية');
        // الحصول على جميع التنبيهات النشطة
        const alertsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'maintenanceAlerts'), (0, firestore_2.where)('status', '==', 'active')));
        for (const alertDoc of alertsSnapshot.docs) {
            const alert = alertDoc.data();
            // التحقق من تاريخ الإشعار الأخير
            const lastNotification = alert.lastNotified || new firestore_2.Timestamp(0, 0);
            const daysSinceLastNotification = (firestore_2.Timestamp.now().toMillis() - lastNotification.toMillis()) / (1000 * 60 * 60 * 24);
            // إرسال تذكير إذا مر أكثر من 3 أيام
            if (daysSinceLastNotification > 3) {
                await sendMaintenanceReminder(alert);
                // تحديث تاريخ آخر إشعار
                await (0, firestore_2.updateDoc)(alertDoc.ref, {
                    lastNotified: firestore_2.Timestamp.now()
                });
            }
        }
        firebase_functions_1.logger.info('تم إرسال تذكيرات الصيانة اليومية بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال تذكيرات الصيانة اليومية:', error);
    }
});
/**
 * إرسال تقارير أسبوعية للمستخدمين
 */
exports.weeklyUserReports = (0, scheduler_1.onSchedule)({
    schedule: '0 10 * * 1', // كل يوم اثنين الساعة 10 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء إرسال التقارير الأسبوعية');
        // الحصول على جميع المستخدمين النشطين
        const usersSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.collection)(db, 'users'));
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            // إنشاء تقرير أسبوعي
            const report = await generateWeeklyReport(userId);
            if (report.hasActivity) {
                await sendWeeklyReport(userId, report);
            }
        }
        firebase_functions_1.logger.info('تم إرسال التقارير الأسبوعية بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال التقارير الأسبوعية:', error);
    }
});
/**
 * تنظيف الإشعارات المنتهية الصلاحية
 */
exports.cleanupExpiredNotifications = (0, scheduler_1.onSchedule)({
    schedule: '0 2 * * *', // كل يوم الساعة 2 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء تنظيف الإشعارات المنتهية');
        const now = firestore_2.Timestamp.now();
        const expiredQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'notifications'), (0, firestore_2.where)('expiresAt', '<', now), (0, firestore_2.where)('read', '==', false));
        const snapshot = await (0, firestore_2.getDocs)(expiredQuery);
        for (const doc of snapshot.docs) {
            await (0, firestore_2.updateDoc)(doc.ref, {
                read: true,
                expired: true,
                expiredAt: now
            });
        }
        firebase_functions_1.logger.info(`تم تنظيف ${snapshot.size} إشعار منتهي الصلاحية`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تنظيف الإشعارات المنتهية:', error);
    }
});
/**
 * إرسال إشعار حادث
 */
async function sendAccidentNotification(alert) {
    try {
        // الحصول على معلومات المستخدم من التوأم الرقمي
        const twinQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'digitalTwins'), (0, firestore_2.where)('vin', '==', alert.vin));
        const twinSnapshot = await (0, firestore_2.getDocs)(twinQuery);
        if (twinSnapshot.empty)
            return;
        const twin = twinSnapshot.docs[0].data();
        const userId = twin.userId;
        // إنشاء الإشعار
        const notificationId = `notif_accident_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId,
            type: 'accident',
            priority: 'critical',
            title: '🚨 حادث مكتشف تلقائياً!',
            message: `تم كشف حادث في سيارتك في الموقع: ${alert.location.latitude}, ${alert.location.longitude}. تم إرسال المساعدة.`,
            data: {
                vin: alert.vin,
                location: alert.location,
                timestamp: alert.timestamp
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 ساعة
            actions: [
                { label: 'عرض التفاصيل', action: 'view_accident' },
                { label: 'اتصل بالطوارئ', action: 'call_emergency' }
            ],
            source: 'iot_system'
        });
        firebase_functions_1.logger.info(`تم إرسال إشعار الحادث للمستخدم ${userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار الحادث:', error);
    }
}
/**
 * إرسال إشعار صيانة
 */
async function sendMaintenanceNotification(alert) {
    var _a;
    try {
        const notificationId = `notif_maint_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId: alert.userId,
            type: 'maintenance',
            priority: alert.priority || 'high',
            title: '🔧 موعد الصيانة',
            message: `سيارتك تحتاج إلى صيانة: ${alert.issues.join(', ')}. الموعد المقترح: ${((_a = alert.scheduledDate) === null || _a === void 0 ? void 0 : _a.toDate().toLocaleDateString('bg-BG')) || 'قريباً'}.`,
            data: {
                vin: alert.vin,
                issues: alert.issues,
                scheduledDate: alert.scheduledDate,
                serviceCenters: alert.serviceCenters
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // أسبوع
            actions: [
                { label: 'احجز موعداً', action: 'book_service' },
                { label: 'عرض التفاصيل', action: 'view_maintenance' }
            ],
            source: 'maintenance_system'
        });
        firebase_functions_1.logger.info(`تم إرسال إشعار الصيانة للمستخدم ${alert.userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار الصيانة:', error);
    }
}
/**
 * إرسال إشعار مطالبة تأمين
 */
async function sendInsuranceClaimNotification(claim) {
    try {
        const notificationId = `notif_claim_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId: claim.userId,
            type: 'insurance',
            priority: 'medium',
            title: '📋 تحديث مطالبة التأمين',
            message: `تم ${claim.status === 'submitted' ? 'تقديم' : 'تحديث'} مطالبة التأمين ${claim.claimId}: ${claim.status}`,
            data: {
                claimId: claim.claimId,
                status: claim.status,
                type: claim.type,
                estimatedDamage: claim.estimatedDamage
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 72 * 60 * 60 * 1000)), // 3 أيام
            actions: [
                { label: 'عرض التفاصيل', action: 'view_claim' }
            ],
            source: 'insurance_system'
        });
        firebase_functions_1.logger.info(`تم إرسال إشعار المطالبة للمستخدم ${claim.userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار المطالبة:', error);
    }
}
/**
 * إرسال إشعار عرض شراء
 */
async function sendSaleOfferNotification(offer) {
    try {
        // الحصول على معلومات الاستراتيجية
        const strategyQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('vin', '==', offer.vin), (0, firestore_2.where)('status', '==', 'active'));
        const strategySnapshot = await (0, firestore_2.getDocs)(strategyQuery);
        if (strategySnapshot.empty)
            return;
        const strategy = strategySnapshot.docs[0].data();
        const notificationId = `notif_offer_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId: strategy.userId,
            type: 'sale_offer',
            priority: 'high',
            title: '💰 عرض شراء جديد!',
            message: `${offer.buyerName} يقدم عرض شراء بقيمة ${offer.amount} EUR لسيارتك.`,
            data: {
                offerId: offer.offerId,
                buyerName: offer.buyerName,
                amount: offer.amount,
                vin: offer.vin
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)), // يومان
            actions: [
                { label: 'قبول العرض', action: 'accept_offer' },
                { label: 'رفض العرض', action: 'decline_offer' },
                { label: 'التفاوض', action: 'counter_offer' }
            ],
            source: 'resale_engine'
        });
        firebase_functions_1.logger.info(`تم إرسال إشعار العرض للمستخدم ${strategy.userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار العرض:', error);
    }
}
/**
 * إرسال إشعار التفاوض المضاد
 */
async function sendCounterOfferNotification(offer) {
    try {
        // إشعار البائع بالعرض المضاد
        const strategyQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'saleStrategies'), (0, firestore_2.where)('vin', '==', offer.vin), (0, firestore_2.where)('status', '==', 'active'));
        const strategySnapshot = await (0, firestore_2.getDocs)(strategyQuery);
        if (strategySnapshot.empty)
            return;
        const strategy = strategySnapshot.docs[0].data();
        const notificationId = `notif_counter_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId: strategy.userId,
            type: 'sale_offer',
            priority: 'high',
            title: '🔄 عرض تفاوضي',
            message: `${offer.buyerName} يقترح ${offer.counterOffer} EUR بدلاً من ${offer.amount} EUR.`,
            data: {
                offerId: offer.offerId,
                buyerName: offer.buyerName,
                originalAmount: offer.amount,
                counterOffer: offer.counterOffer
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // يوم واحد
            actions: [
                { label: 'قبول العرض الجديد', action: 'accept_counter' },
                { label: 'رفض العرض', action: 'decline_offer' },
                { label: 'عرض سعر آخر', action: 'counter_again' }
            ],
            source: 'resale_engine'
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار التفاوض:', error);
    }
}
/**
 * إرسال إشعار تحديث السعر
 */
async function sendMarketPriceNotification(analysis) {
    try {
        // الحصول على معلومات المستخدم
        const carDoc = await (0, firestore_2.getDoc)((0, firestore_2.doc)(db, 'cars', analysis.vin));
        if (!carDoc.exists())
            return;
        const car = carDoc.data();
        const userId = car.userId;
        const oldValue = analysis.lastMarketValue || analysis.marketValue;
        const changePercent = ((analysis.marketValue - oldValue) / oldValue * 100);
        const changeStr = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
        const notificationId = `notif_market_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId,
            type: 'market_update',
            priority: 'low',
            title: '📊 تحديث أسعار السوق',
            message: `قيمة سيارتك ${car.make} ${car.model} في السوق: ${analysis.marketValue} EUR (${changeStr}).`,
            data: {
                vin: analysis.vin,
                marketValue: analysis.marketValue,
                changePercent,
                confidence: analysis.confidence
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // يوم واحد
            actions: [
                { label: 'عرض التحليل', action: 'view_analysis' }
            ],
            source: 'market_analysis'
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال إشعار السوق:', error);
    }
}
/**
 * إرسال تذكير صيانة
 */
async function sendMaintenanceReminder(alert) {
    try {
        const notificationId = `notif_reminder_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId: alert.userId,
            type: 'maintenance',
            priority: 'medium',
            title: '🔧 تذكير صيانة',
            message: `تذكير: سيارتك تحتاج إلى صيانة: ${alert.issues.join(', ')}.`,
            data: {
                vin: alert.vin,
                issues: alert.issues,
                alertId: alert.id
            },
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // يوم واحد
            actions: [
                { label: 'احجز موعداً', action: 'book_service' },
                { label: 'تجاهل', action: 'dismiss_reminder' }
            ],
            source: 'maintenance_system'
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال تذكير الصيانة:', error);
    }
}
/**
 * إشعار مراكز الخدمة
 */
async function notifyServiceCenters(alert) {
    var _a;
    try {
        // في الإنتاج، سيتم إرسال إشعار لمراكز الخدمة المحددة
        firebase_functions_1.logger.info(`إرسال إشعار لمراكز الخدمة: ${((_a = alert.serviceCenters) === null || _a === void 0 ? void 0 : _a.length) || 0} مركز`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار مراكز الخدمة:', error);
    }
}
/**
 * إشعار شركة التأمين
 */
async function notifyInsuranceCompany(claim) {
    try {
        // في الإنتاج، سيتم إرسال إشعار لشركة التأمين عبر API
        firebase_functions_1.logger.info(`إرسال إشعار لشركة التأمين: ${claim.claimId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار شركة التأمين:', error);
    }
}
/**
 * إشعار خدمات الطوارئ
 */
async function notifyEmergencyServices(alert) {
    try {
        // في الإنتاج، سيتم إرسال إشعار لخدمات الطوارئ المحلية
        firebase_functions_1.logger.info(`إرسال إشعار لخدمات الطوارئ: ${alert.vin}`);
        // تحديث حالة الإشعار
        await (0, firestore_2.updateDoc)((0, firestore_2.doc)(db, 'emergencyAlerts', alert.id), {
            emergencyServicesNotified: true,
            notifiedAt: firestore_2.Timestamp.now()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار خدمات الطوارئ:', error);
    }
}
/**
 * إنشاء تقرير أسبوعي
 */
async function generateWeeklyReport(userId) {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        // إحصائيات الإشعارات
        const notificationsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'notifications'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('timestamp', '>=', firestore_2.Timestamp.fromDate(weekAgo))));
        // إحصائيات السيارات
        const carsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'cars'), (0, firestore_2.where)('userId', '==', userId)));
        // إحصائيات الأنشطة
        const activities = {
            notifications: notificationsSnapshot.size,
            cars: carsSnapshot.size,
            maintenanceAlerts: 0,
            insuranceUpdates: 0,
            saleOffers: 0
        };
        notificationsSnapshot.forEach(doc => {
            const notif = doc.data();
            switch (notif.type) {
                case 'maintenance':
                    activities.maintenanceAlerts++;
                    break;
                case 'insurance':
                    activities.insuranceUpdates++;
                    break;
                case 'sale_offer':
                    activities.saleOffers++;
                    break;
            }
        });
        return {
            hasActivity: activities.notifications > 0,
            activities,
            period: {
                from: weekAgo,
                to: new Date()
            }
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إنشاء التقرير الأسبوعي:', error);
        return { hasActivity: false };
    }
}
/**
 * إرسال التقرير الأسبوعي
 */
async function sendWeeklyReport(userId, report) {
    try {
        const notificationId = `notif_weekly_${Date.now()}`;
        await (0, firestore_2.setDoc)((0, firestore_2.doc)(db, 'notifications', notificationId), {
            userId,
            type: 'system',
            priority: 'low',
            title: '📈 تقرير أسبوعي',
            message: `نشاطك هذا الأسبوع: ${report.activities.notifications} إشعار، ${report.activities.maintenanceAlerts} تنبيه صيانة، ${report.activities.insuranceUpdates} تحديث تأمين.`,
            data: report,
            read: false,
            timestamp: firestore_2.Timestamp.now(),
            expiresAt: firestore_2.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // أسبوع
            actions: [
                { label: 'عرض التفاصيل', action: 'view_report' }
            ],
            source: 'system'
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال التقرير الأسبوعي:', error);
    }
}
//# sourceMappingURL=notifications.js.map
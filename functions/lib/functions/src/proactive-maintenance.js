"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaintenanceRequests = exports.sendMaintenanceReminders = exports.analyzeProactiveMaintenance = exports.acceptServiceOffer = exports.getUserMaintenanceAlerts = exports.createMaintenanceAlert = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
const proactive_maintenance_service_1 = require("../../bulgarian-car-marketplace/src/services/proactive-maintenance-service");
/**
 * إنشاء تنبيه صيانة يدوياً
 */
exports.createMaintenanceAlert = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const alertData = req.body;
        const alertId = await proactive_maintenance_service_1.proactiveMaintenanceService.createMaintenanceAlert(alertData);
        res.status(200).json({
            success: true,
            alertId,
            message: 'تم إنشاء تنبيه الصيانة بنجاح',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إنشاء تنبيه الصيانة:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في إنشاء تنبيه الصيانة',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * الحصول على تنبيهات الصيانة لمستخدم
 */
exports.getUserMaintenanceAlerts = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const alerts = await proactive_maintenance_service_1.proactiveMaintenanceService.getUserMaintenanceAlerts(userId);
        res.status(200).json({
            success: true,
            data: alerts,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في الحصول على تنبيهات الصيانة:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في الحصول على تنبيهات الصيانة',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * قبول عرض صيانة
 */
exports.acceptServiceOffer = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { alertId, centerId, scheduledDate } = req.body;
        if (!alertId || !centerId || !scheduledDate) {
            res.status(400).json({ error: 'alertId, centerId, and scheduledDate are required' });
            return;
        }
        const requestId = await proactive_maintenance_service_1.proactiveMaintenanceService.acceptServiceOffer(alertId, centerId, new Date(scheduledDate));
        res.status(200).json({
            success: true,
            requestId,
            message: 'تم قبول عرض الخدمة بنجاح',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في قبول عرض الخدمة:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في قبول عرض الخدمة',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * تحليل استباقي دوري للصيانة
 */
exports.analyzeProactiveMaintenance = (0, scheduler_1.onSchedule)({
    region: 'europe-west1',
    schedule: 'every 2 hours',
    timeoutSeconds: 300,
    memory: '512MiB'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء التحليل الاستباقي للصيانة');
        const db = (0, firestore_1.getFirestore)();
        const twinsQuery = (0, firestore_2.query)((0, firestore_2.collection)(db, 'digitalTwins'));
        const twinsSnapshot = await (0, firestore_2.getDocs)(twinsQuery);
        let alertsCreated = 0;
        for (const twinDoc of twinsSnapshot.docs) {
            const twin = twinDoc.data();
            // تحليل الحاجة للصيانة
            const maintenanceAlert = proactive_maintenance_service_1.proactiveMaintenanceService.analyzeMaintenanceNeeds(twin);
            if (maintenanceAlert) {
                try {
                    await proactive_maintenance_service_1.proactiveMaintenanceService.createMaintenanceAlert(maintenanceAlert);
                    alertsCreated++;
                    firebase_functions_1.logger.info(`تم إنشاء تنبيه صيانة للسيارة ${twin.vin}`);
                }
                catch (error) {
                    firebase_functions_1.logger.error(`خطأ في إنشاء تنبيه للسيارة ${twin.vin}:`, error);
                }
            }
        }
        firebase_functions_1.logger.info(`انتهى التحليل الاستباقي - تم إنشاء ${alertsCreated} تنبيه`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحليل الاستباقي للصيانة:', error);
    }
});
/**
 * إرسال تذكيرات الصيانة المجدولة
 */
exports.sendMaintenanceReminders = (0, scheduler_1.onSchedule)({
    region: 'europe-west1',
    schedule: 'every 6 hours',
    timeoutSeconds: 120,
    memory: '256MiB'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء إرسال تذكيرات الصيانة');
        // في الإنتاج، سيتم البحث عن المواعيد المقبلة وإرسال تذكيرات
        // هنا محاكاة بسيطة
        firebase_functions_1.logger.info('تم إرسال تذكيرات الصيانة بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إرسال تذكيرات الصيانة:', error);
    }
});
/**
 * تحديث حالة طلبات الصيانة
 */
exports.updateMaintenanceRequests = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { requestId, updates } = req.body;
        if (!requestId || !updates) {
            res.status(400).json({ error: 'requestId and updates are required' });
            return;
        }
        await proactive_maintenance_service_1.proactiveMaintenanceService.updateMaintenanceRequest(requestId, updates);
        res.status(200).json({
            success: true,
            message: 'تم تحديث طلب الصيانة بنجاح',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحديث طلب الصيانة:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في تحديث طلب الصيانة',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
//# sourceMappingURL=proactive-maintenance.js.map
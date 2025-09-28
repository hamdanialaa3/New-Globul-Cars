"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMaintenanceNeeds = exports.onEmergencyAlertCreated = exports.receiveIoTData = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_2 = require("firebase/firestore");
const firestore_3 = require("firebase/firestore");
const firestore_4 = require("firebase/firestore");
const gloubul_connect_service_1 = require("../../bulgarian-car-marketplace/src/services/gloubul-connect-service");
/**
 * استقبال بيانات IoT من أجهزة Gloubul Connect عبر HTTP endpoint
 * يستخدم هذا عندما ترسل الأجهزة البيانات مباشرة عبر HTTP بدلاً من MQTT
 */
exports.receiveIoTData = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        // التحقق من صحة الطلب
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const deviceToken = authHeader.substring(7);
        // التحقق من صحة البيانات
        const liveData = req.body;
        if (!liveData.deviceId || !liveData.vin) {
            res.status(400).json({ error: 'Invalid data: deviceId and vin are required' });
            return;
        }
        // التحقق من صحة الجهاز
        const isValidDevice = await validateDevice(deviceToken, liveData.deviceId);
        if (!isValidDevice) {
            res.status(403).json({ error: 'Invalid device or token' });
            return;
        }
        // حفظ البيانات وتحديث التوأم الرقمي
        await gloubul_connect_service_1.gloubulConnectService.updateLiveData(liveData);
        // كشف الحوادث
        if (gloubul_connect_service_1.gloubulConnectService.detectAccident(liveData)) {
            await gloubul_connect_service_1.gloubulConnectService.sendEmergencyAlert(liveData.vin, liveData.location);
            firebase_functions_1.logger.warn(`تم كشف حادث للسيارة ${liveData.vin}`);
        }
        res.status(200).json({
            success: true,
            message: 'Data received successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في استقبال بيانات IoT:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process IoT data'
        });
    }
});
/**
 * مراقبة إنشاء تنبيهات الطوارئ وإرسال الإشعارات
 */
exports.onEmergencyAlertCreated = (0, firestore_1.onDocumentCreated)({
    region: 'europe-west1',
    document: 'emergencyAlerts/{alertId}'
}, async (event) => {
    var _a;
    try {
        const alertData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!alertData)
            return;
        const { vin, location } = alertData;
        // إرسال إشعار للمستخدم
        await sendEmergencyNotification(vin, location);
        // إخطار خدمات الطوارئ (محاكاة)
        await notifyEmergencyServices(vin, location);
        firebase_functions_1.logger.info(`تم إرسال إشعار طوارئ للسيارة ${vin}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة تنبيه الطوارئ:', error);
    }
});
/**
 * تحليل دوري للبيانات وكشف الحاجة للصيانة
 */
exports.analyzeMaintenanceNeeds = (0, scheduler_1.onSchedule)({
    region: 'europe-west1',
    schedule: 'every 1 hours',
    timeoutSeconds: 300,
    memory: '512MiB'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء تحليل الصيانة الدوري');
        const db = (0, firestore_2.getFirestore)();
        // الحصول على جميع التوائم الرقمية النشطة
        const twinsQuery = (0, firestore_3.query)((0, firestore_3.collection)(db, 'digitalTwins'), (0, firestore_3.where)('lastSeen', '>', firestore_4.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))) // آخر 24 ساعة
        );
        const twinsSnapshot = await (0, firestore_3.getDocs)(twinsQuery);
        for (const twinDoc of twinsSnapshot.docs) {
            const twin = twinDoc.data();
            const { vin, engineHealth, activeErrorCodes, nextServiceDueKm, totalMileage } = twin;
            // كشف الحاجة للصيانة
            if (engineHealth === 'critical' || activeErrorCodes.length > 0 || totalMileage >= nextServiceDueKm) {
                await triggerMaintenanceAlert(vin, {
                    engineHealth,
                    activeErrorCodes,
                    nextServiceDueKm,
                    totalMileage
                });
            }
        }
        firebase_functions_1.logger.info('انتهى تحليل الصيانة الدوري');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحليل الصيانة:', error);
    }
});
/**
 * التحقق من صحة الجهاز والرمز المميز
 */
async function validateDevice(token, deviceId) {
    try {
        const db = (0, firestore_2.getFirestore)();
        const deviceRef = (0, firestore_3.doc)(db, 'gloubulConnectDevices', deviceId);
        const deviceDoc = await (0, firestore_3.getDoc)(deviceRef);
        if (!deviceDoc.exists())
            return false;
        const device = deviceDoc.data();
        // في الإنتاج، يجب التحقق من الرمز المميز بشكل صحيح
        return device.status === 'active';
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحقق من الجهاز:', error);
        return false;
    }
}
/**
 * إرسال إشعار طوارئ للمستخدم
 */
async function sendEmergencyNotification(vin, location) {
    // محاكاة إرسال إشعار - في الإنتاج سيتم ربطه بخدمة FCM
    firebase_functions_1.logger.info(`إرسال إشعار طوارئ للسيارة ${vin} في الموقع: ${location.latitude}, ${location.longitude}`);
}
/**
 * إخطار خدمات الطوارئ
 */
async function notifyEmergencyServices(vin, location) {
    // محاكاة إخطار خدمات الطوارئ - في الإنتاج سيتم ربطه بـ API الطوارئ البلغاري
    firebase_functions_1.logger.warn(`إخطار خدمات الطوارئ البلغارية: حادث للسيارة ${vin}`);
}
/**
 * إطلاق تنبيه صيانة
 */
async function triggerMaintenanceAlert(vin, maintenanceData) {
    try {
        const db = (0, firestore_2.getFirestore)();
        const alertRef = (0, firestore_3.doc)((0, firestore_3.collection)(db, 'maintenanceAlerts'));
        await (0, firestore_3.updateDoc)(alertRef, Object.assign(Object.assign({ vin }, maintenanceData), { timestamp: firestore_4.Timestamp.now(), status: 'pending', type: 'proactive' }));
        firebase_functions_1.logger.info(`تم إطلاق تنبيه صيانة للسيارة ${vin}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إطلاق تنبيه الصيانة:', error);
    }
}
//# sourceMappingURL=gloubul-connect.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeIoTDevice = exports.getIoTDeviceStats = exports.registerIoTDevice = exports.setupIoTInfrastructure = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const gloubul_iot_service_1 = require("../../bulgarian-car-marketplace/src/services/gloubul-iot-service");
/**
 * إعداد بنية IoT Core الأساسية
 * يُستدعى مرة واحدة لإعداد البنية التحتية
 */
exports.setupIoTInfrastructure = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 300,
    memory: '512MiB'
}, async (req, res) => {
    try {
        // التحقق من صحة الطلب
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        firebase_functions_1.logger.info('بدء إعداد بنية IoT Core...');
        // إنشاء سجل الأجهزة
        await gloubul_iot_service_1.gloubulIoTService.createDeviceRegistry();
        firebase_functions_1.logger.info('تم إنشاء سجل الأجهزة');
        // إنشاء مواضيع Pub/Sub
        await gloubul_iot_service_1.gloubulIoTService.createPubSubTopics();
        firebase_functions_1.logger.info('تم إنشاء مواضيع Pub/Sub');
        // إنشاء جداول BigQuery
        await gloubul_iot_service_1.gloubulIoTService.createBigQueryTables();
        firebase_functions_1.logger.info('تم إنشاء جداول BigQuery');
        res.status(200).json({
            success: true,
            message: 'تم إعداد بنية IoT Core بنجاح',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إعداد بنية IoT:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في إعداد بنية IoT Core',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * تسجيل جهاز جديد في IoT Core
 */
exports.registerIoTDevice = (0, https_1.onRequest)({
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
        const { deviceId, publicKey } = req.body;
        if (!deviceId) {
            res.status(400).json({ error: 'deviceId is required' });
            return;
        }
        await gloubul_iot_service_1.gloubulIoTService.registerDevice(deviceId, publicKey);
        res.status(200).json({
            success: true,
            message: `تم تسجيل الجهاز ${deviceId} بنجاح`,
            deviceId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تسجيل الجهاز:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في تسجيل الجهاز',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * الحصول على إحصائيات الأجهزة
 */
exports.getIoTDeviceStats = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        const stats = await gloubul_iot_service_1.gloubulIoTService.getDeviceStats();
        res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في الحصول على إحصائيات الأجهزة:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في الحصول على إحصائيات الأجهزة',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * إزالة جهاز من IoT Core
 */
exports.removeIoTDevice = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'DELETE') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { deviceId } = req.body;
        if (!deviceId) {
            res.status(400).json({ error: 'deviceId is required' });
            return;
        }
        await gloubul_iot_service_1.gloubulIoTService.removeDevice(deviceId);
        res.status(200).json({
            success: true,
            message: `تم إزالة الجهاز ${deviceId} بنجاح`,
            deviceId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إزالة الجهاز:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في إزالة الجهاز',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
//# sourceMappingURL=iot-setup.js.map
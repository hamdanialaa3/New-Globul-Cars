"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDigitalTwin = exports.getDigitalTwinStats = exports.analyzeDigitalTwinHealth = exports.syncDigitalTwinToBigQuery = exports.onLiveDataUpdated = exports.getDigitalTwin = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_2 = require("firebase/firestore");
const firestore_3 = require("firebase/firestore");
const gloubul_connect_service_1 = require("../../bulgarian-car-marketplace/src/services/gloubul-connect-service");
const gloubul_iot_service_1 = require("../../bulgarian-car-marketplace/src/services/gloubul-iot-service");
/**
 * الحصول على التوأم الرقمي لسيارة
 */
exports.getDigitalTwin = (0, https_1.onRequest)({
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
        const { vin } = req.query;
        if (!vin || typeof vin !== 'string') {
            res.status(400).json({ error: 'VIN is required' });
            return;
        }
        const twin = await gloubul_connect_service_1.gloubulConnectService.getDigitalTwin(vin);
        if (!twin) {
            res.status(404).json({ error: 'Digital twin not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: twin,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في الحصول على التوأم الرقمي:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في الحصول على التوأم الرقمي',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * تحديث التوأم الرقمي عند تحديث البيانات الحية
 */
exports.onLiveDataUpdated = (0, firestore_1.onDocumentUpdated)({
    region: 'europe-west1',
    document: 'vehicleLiveData/{dataId}'
}, async (event) => {
    var _a, _b;
    try {
        const newData = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after) === null || _b === void 0 ? void 0 : _b.data();
        if (!newData)
            return;
        // تحديث التوأم الرقمي
        const liveData = newData; // Type assertion for VehicleLiveData
        await gloubul_connect_service_1.gloubulConnectService.updateDigitalTwinFromLiveData(liveData);
        // إرسال البيانات إلى BigQuery
        const bigQueryData = {
            deviceId: newData.deviceId,
            vin: newData.vin,
            timestamp: newData.timestamp.toDate(),
            location: `POINT(${newData.location.longitude} ${newData.location.latitude})`,
            speed: newData.speed,
            fuelLevelPercent: newData.fuelLevelPercent,
            engineRPM: newData.engineRPM,
            coolantTemp: newData.coolantTemp,
            batteryVoltage: newData.batteryVoltage,
            odometer: newData.odometer,
            activeErrorCodes: newData.activeErrorCodes,
            tirePressureFrontLeft: newData.tirePressure.frontLeft,
            tirePressureFrontRight: newData.tirePressure.frontRight,
            tirePressureRearLeft: newData.tirePressure.rearLeft,
            tirePressureRearRight: newData.tirePressure.rearRight,
            accelerationX: newData.acceleration.x,
            accelerationY: newData.acceleration.y,
            accelerationZ: newData.acceleration.z
        };
        await gloubul_iot_service_1.gloubulIoTService.insertDataToBigQuery('live_vehicle_data', [bigQueryData]);
        firebase_functions_1.logger.info(`تم تحديث التوأم الرقمي للسيارة ${newData.vin}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحديث التوأم الرقمي:', error);
    }
});
/**
 * مزامنة التوأم الرقمي مع BigQuery
 */
exports.syncDigitalTwinToBigQuery = (0, scheduler_1.onSchedule)({
    region: 'europe-west1',
    schedule: 'every 1 hours',
    timeoutSeconds: 300,
    memory: '512MiB'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء مزامنة التوائم الرقمية مع BigQuery');
        const db = (0, firestore_2.getFirestore)();
        const twinsQuery = (0, firestore_3.query)((0, firestore_3.collection)(db, 'digitalTwins'));
        const twinsSnapshot = await (0, firestore_3.getDocs)(twinsQuery);
        const bigQueryData = twinsSnapshot.docs.map(doc => {
            const twin = doc.data();
            return {
                vin: twin.vin,
                userId: twin.userId,
                lastLocation: twin.lastLocation ? `POINT(${twin.lastLocation.longitude} ${twin.lastLocation.latitude})` : null,
                fuelLevelPercent: twin.fuelLevelPercent,
                engineHealth: twin.engineHealth,
                activeErrorCodes: twin.activeErrorCodes,
                nextServiceDueKm: twin.nextServiceDueKm,
                lastServiceDate: twin.lastServiceDate.toDate(),
                lastSeen: twin.lastSeen.toDate(),
                batteryLevel: twin.batteryLevel,
                signalStrength: twin.signalStrength,
                totalMileage: twin.totalMileage,
                averageFuelConsumption: twin.averageFuelConsumption,
                drivingScore: twin.drivingScore,
                accidentHistory: twin.accidentHistory
            };
        });
        if (bigQueryData.length > 0) {
            await gloubul_iot_service_1.gloubulIoTService.insertDataToBigQuery('digital_twins', bigQueryData);
            firebase_functions_1.logger.info(`تم مزامنة ${bigQueryData.length} توأم رقمي مع BigQuery`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في مزامنة التوائم الرقمية:', error);
    }
});
/**
 * تحليل حالة التوأم الرقمي وإرسال تنبيهات
 */
exports.analyzeDigitalTwinHealth = (0, scheduler_1.onSchedule)({
    region: 'europe-west1',
    schedule: 'every 30 minutes',
    timeoutSeconds: 120,
    memory: '256MiB'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء تحليل حالة التوائم الرقمية');
        const db = (0, firestore_2.getFirestore)();
        const twinsQuery = (0, firestore_3.query)((0, firestore_3.collection)(db, 'digitalTwins'));
        const twinsSnapshot = await (0, firestore_3.getDocs)(twinsQuery);
        for (const twinDoc of twinsSnapshot.docs) {
            const twin = twinDoc.data();
            // كشف المشاكل
            const issues = [];
            if (twin.engineHealth === 'critical') {
                issues.push('حالة المحرك حرجة');
            }
            if (twin.activeErrorCodes.length > 0) {
                issues.push(`أكواد أعطال نشطة: ${twin.activeErrorCodes.join(', ')}`);
            }
            if (twin.fuelLevelPercent < 10) {
                issues.push('مستوى الوقود منخفض');
            }
            if (twin.batteryLevel < 20) {
                issues.push('بطارية الجهاز ضعيفة');
            }
            if (twin.totalMileage >= twin.nextServiceDueKm) {
                issues.push('الصيانة الدورية مطلوبة');
            }
            // إرسال تنبيهات إذا وجدت مشاكل
            if (issues.length > 0) {
                await gloubul_iot_service_1.gloubulIoTService.publishEvent('gloubul-maintenance-alerts', {
                    vin: twin.vin,
                    userId: twin.userId,
                    issues,
                    timestamp: new Date().toISOString()
                });
                firebase_functions_1.logger.info(`تم إرسال تنبيهات للسيارة ${twin.vin}: ${issues.join(', ')}`);
            }
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحليل حالة التوائم الرقمية:', error);
    }
});
/**
 * الحصول على إحصائيات التوائم الرقمية
 */
exports.getDigitalTwinStats = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (req, res) => {
    try {
        const db = (0, firestore_2.getFirestore)();
        const twinsQuery = (0, firestore_3.query)((0, firestore_3.collection)(db, 'digitalTwins'));
        const twinsSnapshot = await (0, firestore_3.getDocs)(twinsQuery);
        const stats = {
            totalTwins: twinsSnapshot.size,
            healthyEngines: twinsSnapshot.docs.filter(doc => doc.data().engineHealth === 'good').length,
            warningEngines: twinsSnapshot.docs.filter(doc => doc.data().engineHealth === 'warning').length,
            criticalEngines: twinsSnapshot.docs.filter(doc => doc.data().engineHealth === 'critical').length,
            averageFuelLevel: twinsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().fuelLevelPercent || 0), 0) / twinsSnapshot.size,
            averageDrivingScore: twinsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().drivingScore || 0), 0) / twinsSnapshot.size,
            lastUpdated: new Date().toISOString()
        };
        res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في الحصول على إحصائيات التوائم الرقمية:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في الحصول على الإحصائيات',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
/**
 * إعادة تهيئة توأم رقمي
 */
exports.resetDigitalTwin = (0, https_1.onRequest)({
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { vin } = req.body;
        if (!vin) {
            res.status(400).json({ error: 'VIN is required' });
            return;
        }
        const db = (0, firestore_2.getFirestore)();
        const twinRef = (0, firestore_3.doc)(db, 'digitalTwins', vin);
        // إعادة التوأم إلى الحالة الأولية
        await (0, firestore_3.updateDoc)(twinRef, {
            fuelLevelPercent: 100,
            engineHealth: 'good',
            activeErrorCodes: [],
            batteryLevel: 100,
            signalStrength: 100,
            drivingScore: 100,
            accidentHistory: 0,
            lastServiceDate: new Date()
        });
        res.status(200).json({
            success: true,
            message: `تم إعادة تهيئة التوأم الرقمي للسيارة ${vin}`,
            vin,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إعادة تهيئة التوأم الرقمي:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'فشل في إعادة تهيئة التوأم الرقمي',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
//# sourceMappingURL=digital-twin.js.map
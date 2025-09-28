"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gloubulConnectService = exports.GloubulConnectService = void 0;
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
const firestore_3 = require("firebase/firestore");
class GloubulConnectService {
    constructor() {
        this.db = (0, firestore_2.getFirestore)();
        this.BULGARIAN_TIMEZONE = 'Europe/Sofia';
    }
    /**
     * تسجيل جهاز جديد في النظام
     */
    async registerDevice(deviceData) {
        try {
            const deviceRef = (0, firestore_1.doc)(this.db, 'gloubulConnectDevices', deviceData.deviceId);
            const device = Object.assign(Object.assign({}, deviceData), { lastSeen: firestore_1.Timestamp.now(), status: 'active' });
            await (0, firestore_1.setDoc)(deviceRef, device);
            // إنشاء التوأم الرقمي الأولي
            await this.initializeDigitalTwin(deviceData.vin, deviceData.userId);
        }
        catch (error) {
            console.error('خطأ في تسجيل الجهاز:', error);
            throw new Error('فشل في تسجيل جهاز Gloubul Connect');
        }
    }
    /**
     * تحديث بيانات حية من الجهاز
     */
    async updateLiveData(liveData) {
        try {
            // حفظ البيانات الحية
            const liveDataRef = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, 'vehicleLiveData'));
            await (0, firestore_1.setDoc)(liveDataRef, liveData);
            // تحديث التوأم الرقمي
            await this.updateDigitalTwin(liveData);
            // تحديث حالة الجهاز
            await this.updateDeviceStatus(liveData.deviceId, 'active');
        }
        catch (error) {
            console.error('خطأ في تحديث البيانات الحية:', error);
            throw new Error('فشل في تحديث بيانات السيارة');
        }
    }
    /**
     * إنشاء التوأم الرقمي الأولي
     */
    async initializeDigitalTwin(vin, userId) {
        const twinRef = (0, firestore_1.doc)(this.db, 'digitalTwins', vin);
        const initialTwin = {
            vin,
            userId,
            lastLocation: new firestore_3.GeoPoint(42.6977, 23.3219), // صوفيا كافتراضي
            fuelLevelPercent: 100,
            engineHealth: 'good',
            activeErrorCodes: [],
            nextServiceDueKm: 15000,
            lastServiceDate: firestore_1.Timestamp.now(),
            lastSeen: firestore_1.Timestamp.now(),
            batteryLevel: 100,
            signalStrength: 100,
            totalMileage: 0,
            averageFuelConsumption: 0,
            drivingScore: 100,
            accidentHistory: 0
        };
        await (0, firestore_1.setDoc)(twinRef, initialTwin);
    }
    /**
     * تحديث التوأم الرقمي بناءً على البيانات الحية (للاستخدام الداخلي والخارجي)
     */
    async updateDigitalTwinFromLiveData(liveData) {
        await this.updateDigitalTwin(liveData);
    }
    /**
     * تحديث التوأم الرقمي بناءً على البيانات الحية
     */
    async updateDigitalTwin(liveData) {
        const twinRef = (0, firestore_1.doc)(this.db, 'digitalTwins', liveData.vin);
        const twinDoc = await (0, firestore_1.getDoc)(twinRef);
        if (!twinDoc.exists()) {
            throw new Error('التوأم الرقمي غير موجود');
        }
        const currentTwin = twinDoc.data();
        // تحليل حالة المحرك
        const engineHealth = this.analyzeEngineHealth(liveData);
        // حساب متوسط استهلاك الوقود
        const avgFuelConsumption = this.calculateAverageFuelConsumption(currentTwin, liveData);
        // حساب نقاط القيادة
        const drivingScore = this.calculateDrivingScore(liveData);
        const updatedTwin = {
            lastLocation: liveData.location,
            fuelLevelPercent: liveData.fuelLevelPercent,
            engineHealth,
            activeErrorCodes: liveData.activeErrorCodes,
            lastSeen: liveData.timestamp,
            totalMileage: liveData.odometer,
            averageFuelConsumption: avgFuelConsumption,
            drivingScore: drivingScore
        };
        await (0, firestore_1.updateDoc)(twinRef, updatedTwin);
    }
    /**
     * تحليل حالة المحرك
     */
    analyzeEngineHealth(liveData) {
        const errorCodes = liveData.activeErrorCodes;
        const coolantTemp = liveData.coolantTemp;
        const batteryVoltage = liveData.batteryVoltage;
        if (errorCodes.length > 0 || coolantTemp > 105 || batteryVoltage < 12) {
            return 'critical';
        }
        if (coolantTemp > 95 || batteryVoltage < 12.5) {
            return 'warning';
        }
        return 'good';
    }
    /**
     * حساب متوسط استهلاك الوقود
     */
    calculateAverageFuelConsumption(currentTwin, liveData) {
        // منطق بسيط للحساب - في الإنتاج سيتم تحسينه
        const currentConsumption = (liveData.speed > 0) ? (liveData.fuelLevelPercent / liveData.speed) * 100 : 0;
        return (currentTwin.averageFuelConsumption + currentConsumption) / 2;
    }
    /**
     * حساب نقاط القيادة
     */
    calculateDrivingScore(liveData) {
        let score = 100;
        // خصم النقاط بناءً على التسارع الحاد
        const harshAcceleration = Math.abs(liveData.acceleration.x) > 2 || Math.abs(liveData.acceleration.y) > 2;
        if (harshAcceleration)
            score -= 10;
        // خصم النقاط للسرعة العالية
        if (liveData.speed > 120)
            score -= 15;
        // خصم النقاط لضغط الإطارات المنخفض
        const lowTirePressure = Object.values(liveData.tirePressure).some(pressure => pressure < 2.0);
        if (lowTirePressure)
            score -= 5;
        return Math.max(0, score);
    }
    /**
     * تحديث حالة الجهاز
     */
    async updateDeviceStatus(deviceId, status) {
        const deviceRef = (0, firestore_1.doc)(this.db, 'gloubulConnectDevices', deviceId);
        await (0, firestore_1.updateDoc)(deviceRef, {
            status,
            lastSeen: firestore_1.Timestamp.now()
        });
    }
    /**
     * الحصول على التوأم الرقمي لسيارة
     */
    async getDigitalTwin(vin) {
        try {
            const twinRef = (0, firestore_1.doc)(this.db, 'digitalTwins', vin);
            const twinDoc = await (0, firestore_1.getDoc)(twinRef);
            if (twinDoc.exists()) {
                return twinDoc.data();
            }
            return null;
        }
        catch (error) {
            console.error('خطأ في الحصول على التوأم الرقمي:', error);
            return null;
        }
    }
    /**
     * الحصول على جميع الأجهزة لمستخدم
     */
    async getUserDevices(userId) {
        try {
            const devicesQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'gloubulConnectDevices'), (0, firestore_1.where)('userId', '==', userId));
            const devicesSnapshot = await (0, firestore_1.getDocs)(devicesQuery);
            return devicesSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('خطأ في الحصول على أجهزة المستخدم:', error);
            return [];
        }
    }
    /**
     * كشف الحوادث بناءً على بيانات التسارع
     */
    detectAccident(liveData) {
        const { acceleration } = liveData;
        const totalAcceleration = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        // كشف تصادم إذا كان التسارع أكبر من 3G
        return totalAcceleration > 29.4; // 3G في m/s²
    }
    /**
     * إرسال إشعار طوارئ للحوادث
     */
    async sendEmergencyAlert(vin, location) {
        try {
            const alertRef = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, 'emergencyAlerts'));
            await (0, firestore_1.setDoc)(alertRef, {
                vin,
                location,
                timestamp: firestore_1.Timestamp.now(),
                status: 'active',
                emergencyServicesNotified: false
            });
            // هنا سيتم إرسال إشعار للطوارئ والمستخدم
            console.log(`تم كشف حادث للسيارة ${vin} في الموقع: ${location.latitude}, ${location.longitude}`);
        }
        catch (error) {
            console.error('خطأ في إرسال إشعار الطوارئ:', error);
        }
    }
}
exports.GloubulConnectService = GloubulConnectService;
exports.gloubulConnectService = new GloubulConnectService();
//# sourceMappingURL=gloubul-connect-service.js.map
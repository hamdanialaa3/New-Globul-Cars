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
     * (Comment removed - was in Arabic)
     */
    async registerDevice(deviceData) {
        try {
            const deviceRef = (0, firestore_1.doc)(this.db, 'gloubulConnectDevices', deviceData.deviceId);
            const device = Object.assign(Object.assign({}, deviceData), { lastSeen: firestore_1.Timestamp.now(), status: 'active' });
            await (0, firestore_1.setDoc)(deviceRef, device);
            // (Comment removed - was in Arabic)
            await this.initializeDigitalTwin(deviceData.vin, deviceData.userId);
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في تسجيل جهاز Gloubul Connect');
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async updateLiveData(liveData) {
        try {
            // (Comment removed - was in Arabic)
            const liveDataRef = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, 'vehicleLiveData'));
            await (0, firestore_1.setDoc)(liveDataRef, liveData);
            // (Comment removed - was in Arabic)
            await this.updateDigitalTwin(liveData);
            // (Comment removed - was in Arabic)
            await this.updateDeviceStatus(liveData.deviceId, 'active');
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في تحديث بيانات السيارة');
        }
    }
    /**
     * (Comment removed - was in Arabic)
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
     * (Comment removed - was in Arabic)
     */
    async updateDigitalTwinFromLiveData(liveData) {
        await this.updateDigitalTwin(liveData);
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async updateDigitalTwin(liveData) {
        const twinRef = (0, firestore_1.doc)(this.db, 'digitalTwins', liveData.vin);
        const twinDoc = await (0, firestore_1.getDoc)(twinRef);
        if (!twinDoc.exists()) {
            throw new Error('التوأم الرقمي غير موجود');
        }
        const currentTwin = twinDoc.data();
        // (Comment removed - was in Arabic)
        const engineHealth = this.analyzeEngineHealth(liveData);
        // (Comment removed - was in Arabic)
        const avgFuelConsumption = this.calculateAverageFuelConsumption(currentTwin, liveData);
        // (Comment removed - was in Arabic)
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
     * (Comment removed - was in Arabic)
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
     * (Comment removed - was in Arabic)
     */
    calculateAverageFuelConsumption(currentTwin, liveData) {
        // (Comment removed - was in Arabic)
        const currentConsumption = (liveData.speed > 0) ? (liveData.fuelLevelPercent / liveData.speed) * 100 : 0;
        return (currentTwin.averageFuelConsumption + currentConsumption) / 2;
    }
    /**
     * (Comment removed - was in Arabic)
     */
    calculateDrivingScore(liveData) {
        let score = 100;
        // (Comment removed - was in Arabic)
        const harshAcceleration = Math.abs(liveData.acceleration.x) > 2 || Math.abs(liveData.acceleration.y) > 2;
        if (harshAcceleration)
            score -= 10;
        // (Comment removed - was in Arabic)
        if (liveData.speed > 120)
            score -= 15;
        // (Comment removed - was in Arabic)
        const lowTirePressure = Object.values(liveData.tirePressure).some(pressure => pressure < 2.0);
        if (lowTirePressure)
            score -= 5;
        return Math.max(0, score);
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async updateDeviceStatus(deviceId, status) {
        const deviceRef = (0, firestore_1.doc)(this.db, 'gloubulConnectDevices', deviceId);
        await (0, firestore_1.updateDoc)(deviceRef, {
            status,
            lastSeen: firestore_1.Timestamp.now()
        });
    }
    /**
     * (Comment removed - was in Arabic)
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
            console.error('[SERVICE] :', error);
            return null;
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async getUserDevices(userId) {
        try {
            const devicesQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'gloubulConnectDevices'), (0, firestore_1.where)('userId', '==', userId));
            const devicesSnapshot = await (0, firestore_1.getDocs)(devicesQuery);
            return devicesSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            return [];
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    detectAccident(liveData) {
        const { acceleration } = liveData;
        const totalAcceleration = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        // (Comment removed - was in Arabic)
        return totalAcceleration > 29.4; // 3G في m/s²
    }
    /**
     * (Comment removed - was in Arabic)
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
            // (Comment removed - was in Arabic)
        }
        catch (error) {
            console.error('[SERVICE] :', error);
        }
    }
}
exports.GloubulConnectService = GloubulConnectService;
exports.gloubulConnectService = new GloubulConnectService();
//# sourceMappingURL=gloubul-connect-service.js.map
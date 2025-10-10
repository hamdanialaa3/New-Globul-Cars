"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proactiveMaintenanceService = exports.ProactiveMaintenanceService = void 0;
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
class ProactiveMaintenanceService {
    constructor() {
        this.db = (0, firestore_2.getFirestore)();
        this.BULGARIAN_TIMEZONE = 'Europe/Sofia';
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async createMaintenanceAlert(alertData) {
        try {
            const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alert = Object.assign(Object.assign({}, alertData), { id: alertId, createdAt: firestore_1.Timestamp.now(), expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 ????
             });
            await (0, firestore_1.setDoc)(alertRef, alert);
            // (Comment removed - was in Arabic)
            await this.notifyServiceCenters(alert);
            return alertId;
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في إنشاء تنبيه الصيانة');
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async getUserMaintenanceAlerts(userId) {
        try {
            const alertsQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'maintenanceAlerts'), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.where)('status', '==', 'active'), (0, firestore_1.orderBy)('createdAt', 'desc'));
            const alertsSnapshot = await (0, firestore_1.getDocs)(alertsQuery);
            return alertsSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            return [];
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async submitServiceOffer(alertId, offer) {
        try {
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alertDoc = await (0, firestore_1.getDoc)(alertRef);
            if (!alertDoc.exists()) {
                throw new Error('تنبيه الصيانة غير موجود');
            }
            const alert = alertDoc.data();
            // (Comment removed - was in Arabic)
            const updatedOffers = [...alert.serviceCenters, offer];
            await (0, firestore_1.updateDoc)(alertRef, {
                serviceCenters: updatedOffers
            });
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في إرسال عرض الخدمة');
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async acceptServiceOffer(alertId, centerId, scheduledDate) {
        try {
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alertDoc = await (0, firestore_1.getDoc)(alertRef);
            if (!alertDoc.exists()) {
                throw new Error('تنبيه الصيانة غير موجود');
            }
            const alert = alertDoc.data();
            const selectedOffer = alert.serviceCenters.find(offer => offer.centerId === centerId);
            if (!selectedOffer) {
                throw new Error('عرض الخدمة غير موجود');
            }
            // (Comment removed - was in Arabic)
            const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const requestRef = (0, firestore_1.doc)(this.db, 'maintenanceRequests', requestId);
            const request = {
                id: requestId,
                alertId,
                userId: alert.userId,
                vin: alert.vin,
                serviceCenterId: centerId,
                status: 'confirmed',
                scheduledDate: firestore_1.Timestamp.fromDate(scheduledDate),
                estimatedCompletion: firestore_1.Timestamp.fromDate(new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)), // 2 ?????
                actualCost: selectedOffer.price,
                currency: 'EUR',
                workDescription: alert.recommendedActions,
                parts: [],
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now()
            };
            await (0, firestore_1.setDoc)(requestRef, request);
            // (Comment removed - was in Arabic)
            await (0, firestore_1.updateDoc)(alertRef, {
                status: 'accepted'
            });
            return requestId;
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في قبول عرض الخدمة');
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async getUserMaintenanceRequests(userId) {
        try {
            const requestsQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'maintenanceRequests'), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'));
            const requestsSnapshot = await (0, firestore_1.getDocs)(requestsQuery);
            return requestsSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            return [];
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async updateMaintenanceRequest(requestId, updates) {
        try {
            const requestRef = (0, firestore_1.doc)(this.db, 'maintenanceRequests', requestId);
            await (0, firestore_1.updateDoc)(requestRef, Object.assign(Object.assign({}, updates), { updatedAt: firestore_1.Timestamp.now() }));
        }
        catch (error) {
            console.error('[SERVICE] :', error);
            throw new Error('فشل في تحديث طلب الصيانة');
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async notifyServiceCenters(alert) {
        try {
            // (Comment removed - was in Arabic)
            // (Comment removed - was in Arabic)
            const mockCenters = await this.getNearbyServiceCenters(alert.vin);
            for (const center of mockCenters) {
                // (Comment removed - was in Arabic)
            }
        }
        catch (error) {
            console.error('[SERVICE] :', error);
        }
    }
    /**
     * (Comment removed - was in Arabic)
     */
    async getNearbyServiceCenters(vin) {
        // (Comment removed - was in Arabic)
        return [
            {
                id: 'center_1',
                name: 'Gloubul Service Center Sofia',
                location: 'Sofia',
                distance: 5.2,
                rating: 4.8,
                reviewCount: 1250
            },
            {
                id: 'center_2',
                name: 'Auto Expert Plovdiv',
                location: 'Plovdiv',
                distance: 12.1,
                rating: 4.6,
                reviewCount: 890
            },
            {
                id: 'center_3',
                name: 'CarCare Varna',
                location: 'Varna',
                distance: 8.7,
                rating: 4.7,
                reviewCount: 654
            }
        ];
    }
    /**
     * (Comment removed - was in Arabic)
     */
    analyzeMaintenanceNeeds(digitalTwin) {
        const issues = [];
        const actions = [];
        // (Comment removed - was in Arabic)
        if (digitalTwin.fuelLevelPercent < 15) {
            issues.push('مستوى الوقود منخفض');
            actions.push('تزويد الوقود');
        }
        // (Comment removed - was in Arabic)
        if (digitalTwin.engineHealth === 'critical') {
            issues.push('حالة المحرك حرجة - أكواد أعطال نشطة');
            actions.push('فحص تشخيصي شامل للمحرك');
            actions.push('إصلاح الأعطال المكتشفة');
        }
        else if (digitalTwin.engineHealth === 'warning') {
            issues.push('تحذير من حالة المحرك');
            actions.push('فحص وقائي للمحرك');
        }
        // (Comment removed - was in Arabic)
        if (digitalTwin.totalMileage >= digitalTwin.nextServiceDueKm) {
            issues.push('الصيانة الدورية مطلوبة');
            actions.push('تغيير زيت المحرك وفلاتر');
            actions.push('فحص المكابح والإطارات');
            actions.push('فحص السوائل والأنظمة الكهربائية');
        }
        // (Comment removed - was in Arabic)
        if (digitalTwin.batteryLevel < 30) {
            issues.push('بطارية الجهاز ضعيفة');
            actions.push('فحص وشحن بطارية الجهاز');
        }
        if (issues.length === 0) {
            return null;
        }
        // (Comment removed - was in Arabic)
        let priority = 'low';
        if (issues.some(issue => issue.includes('حرجة') || issue.includes('critical'))) {
            priority = 'critical';
        }
        else if (issues.some(issue => issue.includes('تحذير') || issue.includes('warning'))) {
            priority = 'high';
        }
        else if (issues.length > 1) {
            priority = 'medium';
        }
        return {
            id: '',
            vin: digitalTwin.vin,
            userId: digitalTwin.userId,
            type: 'proactive',
            priority,
            title: 'تنبيه صيانة استباقي',
            description: `تم اكتشاف ${issues.length} مشاكل محتملة في سيارتك`,
            issues,
            recommendedActions: actions,
            estimatedCost: {
                min: 50,
                max: 500,
                currency: 'EUR'
            },
            serviceCenters: [],
            status: 'active',
            createdAt: firestore_1.Timestamp.now(),
            expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        };
    }
}
exports.ProactiveMaintenanceService = ProactiveMaintenanceService;
exports.proactiveMaintenanceService = new ProactiveMaintenanceService();
//# sourceMappingURL=proactive-maintenance-service.js.map